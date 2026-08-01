import { Plus } from 'lucide-react'
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
  todayInputValue,
} from './format'
import { useCreateOvertimeRecord } from './overtime.queries'

function defaultFormState() {
  return {
    workDate: todayInputValue(),
    startTime: '08:00',
    endTime: '',
  }
}

export function CreateOvertimeSheet() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultFormState)
  const createOvertime = useCreateOvertimeRecord()

  const start =
    form.workDate && form.startTime
      ? combineDateAndTime(form.workDate, form.startTime)
      : null
  const end =
    form.workDate && form.endTime
      ? combineDateAndTime(form.workDate, form.endTime)
      : null

  const workedHours = start && end ? hoursBetween(start, end) : 0
  const rawOvertime =
    workedHours > 0
      ? Math.round((workedHours - STANDARD_WORK_HOURS) * 100) / 100
      : 0
  const previewHours = start && end ? calculateOvertimeHours(start, end) : 0
  const exceedsMax = rawOvertime > MAX_OVERTIME_HOURS
  const canSave = previewHours > 0 && !exceedsMax

  const errorMessage =
    createOvertime.error instanceof Error
      ? createOvertime.error.message
      : createOvertime.error
        ? 'Não foi possível salvar.'
        : null

  function updateField(field: keyof ReturnType<typeof defaultFormState>) {
    return (value: string) => {
      setForm((current) => ({ ...current, [field]: value }))
      createOvertime.reset()
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setForm(defaultFormState())
      createOvertime.reset()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await createOvertime.mutateAsync(form)
      setOpen(false)
    } catch {
      return
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={<Button size="lg" className="min-h-11 px-4" />}
      >
        <Plus />
        Cadastrar
      </SheetTrigger>

      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Nova hora extra</SheetTitle>
          <SheetDescription>
            Informe entrada e saída do expediente. A extra é o que passar de{' '}
            {STANDARD_WORK_HOURS}h (máx. {MAX_OVERTIME_HOURS}h).
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="grid gap-5 px-4 py-5">
            <div className="grid gap-2">
              <Label htmlFor="work-date">Data</Label>
              <Input
                id="work-date"
                type="date"
                required
                value={form.workDate}
                onValueChange={updateField('workDate')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Entrada</Label>
                <Input
                  id="start-time"
                  type="time"
                  required
                  value={form.startTime}
                  onValueChange={updateField('startTime')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">Saída</Label>
                <Input
                  id="end-time"
                  type="time"
                  required
                  value={form.endTime}
                  onValueChange={updateField('endTime')}
                />
              </div>
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
              disabled={createOvertime.isPending || !canSave}
              className="min-h-12 w-full text-base"
            >
              {createOvertime.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
