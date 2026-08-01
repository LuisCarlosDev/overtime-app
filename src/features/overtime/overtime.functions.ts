import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import { db } from '#/db'
import { overtimeRecords } from '#/db/schema'
import {
  calculateOvertimeHours,
  combineDateAndTime,
  hoursBetween,
  MAX_OVERTIME_HOURS,
  STANDARD_WORK_HOURS,
} from './format'

function serializeRecord(
  record: typeof overtimeRecords.$inferSelect,
) {
  return {
    ...record,
    workDate: record.workDate.toISOString(),
    startTime: record.startTime.toISOString(),
    endTime: record.endTime.toISOString(),
    createdAt: record.createdAt?.toISOString() ?? null,
  }
}

export const listOvertimeRecords = createServerFn({ method: 'GET' }).handler(
  async () => {
    const records = await db
      .select()
      .from(overtimeRecords)
      .orderBy(desc(overtimeRecords.workDate))

    return records.map(serializeRecord)
  },
)

type CreateOvertimeInput = {
  workDate: string
  startTime: string
  endTime: string
}

export const createOvertimeRecord = createServerFn({ method: 'POST' })
  .validator((data: CreateOvertimeInput) => {
    if (!data.workDate || !data.startTime || !data.endTime) {
      throw new Error('Preencha data, entrada e saída.')
    }

    const start = combineDateAndTime(data.workDate, data.startTime)
    const end = combineDateAndTime(data.workDate, data.endTime)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error('Data ou horário inválido.')
    }

    if (end <= start) {
      throw new Error('A saída deve ser depois da entrada.')
    }

    const workedHours = hoursBetween(start, end)
    const rawOvertime =
      Math.round((workedHours - STANDARD_WORK_HOURS) * 100) / 100

    if (rawOvertime <= 0) {
      throw new Error(
        `Não há hora extra: o expediente precisa passar de ${STANDARD_WORK_HOURS}h.`,
      )
    }

    if (rawOvertime > MAX_OVERTIME_HOURS) {
      throw new Error(
        `Horas extras no máximo ${MAX_OVERTIME_HOURS}h (você lançou ${rawOvertime}h).`,
      )
    }

    return {
      workDate: start,
      startTime: start,
      endTime: end,
      standardHours: String(STANDARD_WORK_HOURS),
      overtimeHours: String(calculateOvertimeHours(start, end)),
    }
  })
  .handler(async ({ data }) => {
    const [record] = await db
      .insert(overtimeRecords)
      .values({
        workDate: data.workDate,
        startTime: data.startTime,
        endTime: data.endTime,
        standardHours: data.standardHours,
        overtimeHours: data.overtimeHours,
        status: 'pending',
      })
      .returning()

    return serializeRecord(record)
  })
