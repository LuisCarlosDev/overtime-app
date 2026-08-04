import dayjs from 'dayjs'
import { useState, type FormEvent } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import {
  calculateOvertimeHours,
  combineDateAndTime,
  formatDecimalHours,
  hoursBetween,
  MAX_OVERTIME_HOURS,
  STANDARD_WORK_HOURS,
} from './format'
import { useUpdateOvertimeRecord } from './overtime.queries'

type EditOvertimeSheetProps = {
  id: string
  workDate: string
  startTime: string
  endTime: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formFromRecord(record: {
  workDate: string
  startTime: string
  endTime: string | null
}) {
  return {
    workDate: dayjs(record.workDate).format('YYYY-MM-DD'),
    startTime: dayjs(record.startTime).format('HH:mm'),
    endTime: record.endTime ? dayjs(record.endTime).format('HH:mm') : '',
  }
}

export function EditOvertimeSheet({
  id,
  workDate,
  startTime,
  endTime,
  open,
  onOpenChange,
}: EditOvertimeSheetProps) {
  const [form, setForm] = useState(() =>
    formFromRecord({ workDate, startTime, endTime }),
  )
  const updateOvertime = useUpdateOvertimeRecord()

  const start =
    form.workDate && form.startTime
      ? combineDateAndTime(form.workDate, form.startTime)
      : null
  const end =
    form.workDate && form.endTime
      ? combineDateAndTime(form.workDate, form.endTime)
      : null

  const hasEndTime = form.endTime.trim().length > 0
  const workedHours = start && end ? hoursBetween(start, end) : 0
  const rawOvertime =
    workedHours > 0
      ? Math.round((workedHours - STANDARD_WORK_HOURS) * 100) / 100
      : 0
  const previewHours = start && end ? calculateOvertimeHours(start, end) : 0
  const exceedsMax = hasEndTime && rawOvertime > MAX_OVERTIME_HOURS
  const canSaveOpen = Boolean(form.workDate && form.startTime) && !hasEndTime
  const hasValidEnd = Boolean(start && end && end > start)
  const canSaveClosed = hasEndTime && hasValidEnd && !exceedsMax
  const canSave = canSaveOpen || canSaveClosed

  const errorMessage =
    updateOvertime.error instanceof Error
      ? updateOvertime.error.message
      : updateOvertime.error
        ? 'Não foi possível salvar.'
        : null

  function updateField(field: keyof ReturnType<typeof formFromRecord>) {
    return (value: string) => {
      setForm((current) => ({ ...current, [field]: value }))
      updateOvertime.reset()
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (next) {
      setForm(formFromRecord({ workDate, startTime, endTime }))
      updateOvertime.reset()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await updateOvertime.mutateAsync({
        id,
        workDate: form.workDate,
        startTime: form.startTime,
        endTime: hasEndTime ? form.endTime : undefined,
      })
      onOpenChange(false)
    } catch {
      return
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Editar expediente</SheetTitle>
          <SheetDescription>
            Ajuste data, entrada e saída. Se limpar a saída, o dia volta a ficar
            em andamento.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="grid gap-5 px-4 py-5">
            <div className="grid gap-2">
              <Label htmlFor="edit-work-date">Data</Label>
              <Input
                id="edit-work-date"
                type="date"
                required
                value={form.workDate}
                onValueChange={updateField('workDate')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="edit-start-time">Entrada</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  required
                  value={form.startTime}
                  onValueChange={updateField('startTime')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end-time">Saída (opcional)</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={form.endTime}
                  onValueChange={updateField('endTime')}
                />
              </div>
            </div>

            <div className="rounded-xl bg-primary/10 px-4 py-3 ring-1 ring-primary/15">
              <p className="text-xs font-medium tracking-wide text-primary/80 uppercase">
                {hasEndTime ? 'Horas extras' : 'Status'}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {hasEndTime
                  ? formatDecimalHours(previewHours)
                  : 'Em andamento'}
              </p>
              {hasEndTime && workedHours > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Expediente: {formatDecimalHours(workedHours)} · padrão{' '}
                  {STANDARD_WORK_HOURS}h
                </p>
              ) : null}
              {!hasEndTime ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Sem saída o expediente fica em andamento.
                </p>
              ) : null}
              {exceedsMax ? (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Máximo de {MAX_OVERTIME_HOURS}h extras.
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <SheetFooter>
            <Button
              type="submit"
              size="lg"
              disabled={updateOvertime.isPending || !canSave}
              className="min-h-12 w-full text-base"
            >
              {updateOvertime.isPending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
