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
  SheetTrigger,
} from '#/components/ui/sheet'
import {
  calculateOvertimeHours,
  combineDateAndTime,
  formatDecimalHours,
  hoursBetween,
  MAX_OVERTIME_HOURS,
  STANDARD_WORK_HOURS,
} from './format'
import { useFinalizeOvertimeRecord } from './overtime.queries'

type FinalizeOvertimeSheetProps = {
  id: string
  workDate: string
  startTime: string
}

export function FinalizeOvertimeSheet({
  id,
  workDate,
  startTime,
}: FinalizeOvertimeSheetProps) {
  const [open, setOpen] = useState(false)
  const [endTime, setEndTime] = useState('')
  const finalizeOvertime = useFinalizeOvertimeRecord()

  const workDateValue = dayjs(workDate).format('YYYY-MM-DD')
  const start = combineDateAndTime(
    workDateValue,
    dayjs(startTime).format('HH:mm'),
  )
  const end = endTime ? combineDateAndTime(workDateValue, endTime) : null

  const workedHours = end ? hoursBetween(start, end) : 0
  const rawOvertime =
    workedHours > 0
      ? Math.round((workedHours - STANDARD_WORK_HOURS) * 100) / 100
      : 0
  const previewHours = end ? calculateOvertimeHours(start, end) : 0
  const exceedsMax = rawOvertime > MAX_OVERTIME_HOURS
  const hasValidEnd = Boolean(end && end > start)
  const canSave = hasValidEnd && !exceedsMax

  const errorMessage =
    finalizeOvertime.error instanceof Error
      ? finalizeOvertime.error.message
      : finalizeOvertime.error
        ? 'Não foi possível fechar o dia.'
        : null

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setEndTime('')
      finalizeOvertime.reset()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await finalizeOvertime.mutateAsync({ id, endTime })
      setOpen(false)
    } catch {
      return
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button size="sm" className="min-h-10 w-full" variant="default" />
        }
      >
        Fechar saída
      </SheetTrigger>

      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Fechar expediente</SheetTitle>
          <SheetDescription>
            Informe a saída para calcular as horas extras e fechar o dia.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="grid gap-5 px-4 py-5">
            <div className="grid gap-2">
              <Label htmlFor="finalize-end-time">Saída</Label>
              <Input
                id="finalize-end-time"
                type="time"
                required
                value={endTime}
                onValueChange={(value) => {
                  setEndTime(value)
                  finalizeOvertime.reset()
                }}
              />
            </div>

            <div className="rounded-xl bg-primary/10 px-4 py-3 ring-1 ring-primary/15">
              <p className="text-xs font-medium tracking-wide text-primary/80 uppercase">
                Horas extras
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
                {formatDecimalHours(previewHours)}
              </p>
              {workedHours > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Expediente: {formatDecimalHours(workedHours)} · padrão{' '}
                  {STANDARD_WORK_HOURS}h
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
              disabled={finalizeOvertime.isPending || !canSave}
              className="min-h-12 w-full text-base"
            >
              {finalizeOvertime.isPending ? 'Fechando…' : 'Fechar dia'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
