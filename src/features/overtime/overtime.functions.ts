import { createServerFn } from '@tanstack/react-start'
import { desc, eq, isNull } from 'drizzle-orm'
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
    endTime: record.endTime?.toISOString() ?? null,
    createdAt: record.createdAt?.toISOString() ?? null,
  }
}

function validateClosedShift(start: Date, end: Date) {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Data ou horário inválido.')
  }

  if (end <= start) {
    throw new Error('A saída deve ser depois da entrada.')
  }

  const workedHours = hoursBetween(start, end)
  const rawOvertime =
    Math.round((workedHours - STANDARD_WORK_HOURS) * 100) / 100

  if (rawOvertime > MAX_OVERTIME_HOURS) {
    throw new Error(
      `Horas extras no máximo ${MAX_OVERTIME_HOURS}h (você lançou ${rawOvertime}h).`,
    )
  }

  return {
    endTime: end,
    standardHours: String(STANDARD_WORK_HOURS),
    overtimeHours: String(calculateOvertimeHours(start, end)),
  }
}

function toDateInputValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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
  endTime?: string
}

export const createOvertimeRecord = createServerFn({ method: 'POST' })
  .validator((data: CreateOvertimeInput) => {
    if (!data.workDate || !data.startTime) {
      throw new Error('Preencha data e entrada.')
    }

    const start = combineDateAndTime(data.workDate, data.startTime)

    if (Number.isNaN(start.getTime())) {
      throw new Error('Data ou horário inválido.')
    }

    const endTimeValue = data.endTime?.trim() ?? ''

    if (!endTimeValue) {
      return {
        workDate: start,
        startTime: start,
        endTime: null as Date | null,
        standardHours: String(STANDARD_WORK_HOURS),
        overtimeHours: '0',
        isOpen: true as const,
      }
    }

    const end = combineDateAndTime(data.workDate, endTimeValue)
    const closed = validateClosedShift(start, end)

    return {
      workDate: start,
      startTime: start,
      ...closed,
      isOpen: false as const,
    }
  })
  .handler(async ({ data }) => {
    if (data.isOpen) {
      const [openRecord] = await db
        .select({ id: overtimeRecords.id })
        .from(overtimeRecords)
        .where(isNull(overtimeRecords.endTime))
        .limit(1)

      if (openRecord) {
        throw new Error(
          'Já existe um expediente em aberto. Feche a saída antes de iniciar outro.',
        )
      }
    }

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

type FinalizeOvertimeInput = {
  id: string
  endTime: string
}

export const finalizeOvertimeRecord = createServerFn({ method: 'POST' })
  .validator((data: FinalizeOvertimeInput) => {
    if (!data.id || !data.endTime?.trim()) {
      throw new Error('Informe a saída para fechar o dia.')
    }

    return {
      id: data.id,
      endTime: data.endTime.trim(),
    }
  })
  .handler(async ({ data }) => {
    const [existing] = await db
      .select()
      .from(overtimeRecords)
      .where(eq(overtimeRecords.id, data.id))
      .limit(1)

    if (!existing) {
      throw new Error('Registro não encontrado.')
    }

    if (existing.endTime) {
      throw new Error('Este expediente já foi fechado.')
    }

    const end = combineDateAndTime(
      toDateInputValue(existing.workDate),
      data.endTime,
    )
    const closed = validateClosedShift(existing.startTime, end)

    const [record] = await db
      .update(overtimeRecords)
      .set({
        endTime: closed.endTime,
        standardHours: closed.standardHours,
        overtimeHours: closed.overtimeHours,
      })
      .where(eq(overtimeRecords.id, data.id))
      .returning()

    return serializeRecord(record)
  })

type UpdateOvertimeInput = {
  id: string
  workDate: string
  startTime: string
  endTime?: string
}

export const updateOvertimeRecord = createServerFn({ method: 'POST' })
  .validator((data: UpdateOvertimeInput) => {
    if (!data.id || !data.workDate || !data.startTime) {
      throw new Error('Preencha data e entrada.')
    }

    const start = combineDateAndTime(data.workDate, data.startTime)

    if (Number.isNaN(start.getTime())) {
      throw new Error('Data ou horário inválido.')
    }

    const endTimeValue = data.endTime?.trim() ?? ''

    if (!endTimeValue) {
      return {
        id: data.id,
        workDate: start,
        startTime: start,
        endTime: null as Date | null,
        standardHours: String(STANDARD_WORK_HOURS),
        overtimeHours: '0',
        isOpen: true as const,
      }
    }

    const end = combineDateAndTime(data.workDate, endTimeValue)
    const closed = validateClosedShift(start, end)

    return {
      id: data.id,
      workDate: start,
      startTime: start,
      ...closed,
      isOpen: false as const,
    }
  })
  .handler(async ({ data }) => {
    const [existing] = await db
      .select()
      .from(overtimeRecords)
      .where(eq(overtimeRecords.id, data.id))
      .limit(1)

    if (!existing) {
      throw new Error('Registro não encontrado.')
    }

    if (data.isOpen) {
      const [openRecord] = await db
        .select({ id: overtimeRecords.id })
        .from(overtimeRecords)
        .where(isNull(overtimeRecords.endTime))
        .limit(1)

      if (openRecord && openRecord.id !== data.id) {
        throw new Error(
          'Já existe um expediente em aberto. Feche a saída antes de deixar este em andamento.',
        )
      }
    }

    const [record] = await db
      .update(overtimeRecords)
      .set({
        workDate: data.workDate,
        startTime: data.startTime,
        endTime: data.endTime,
        standardHours: data.standardHours,
        overtimeHours: data.overtimeHours,
      })
      .where(eq(overtimeRecords.id, data.id))
      .returning()

    return serializeRecord(record)
  })
