import dayjs from 'dayjs'
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { EditOvertimeSheet } from './edit-overtime-sheet'
import { FinalizeOvertimeSheet } from './finalize-overtime-sheet'
import {
  formatDecimalHours,
  progressStatusLabel,
  statusLabel,
} from './format'
import { useDeleteOvertimeRecord } from './overtime.queries'

type OvertimeRecordCardProps = {
  id: string
  workDate: string
  startTime: string
  endTime: string | null
  overtimeHours: string
  status: 'pending' | 'paid'
}

export function OvertimeRecordCard({
  id,
  workDate,
  startTime,
  endTime,
  overtimeHours,
  status,
}: OvertimeRecordCardProps) {
  const isOpen = !endTime
  const [actionsOpen, setActionsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const deleteOvertime = useDeleteOvertimeRecord()

  function openAction(action: 'edit' | 'finalize') {
    setActionsOpen(false)
    window.setTimeout(() => {
      if (action === 'edit') setEditOpen(true)
      if (action === 'finalize') setFinalizeOpen(true)
    }, 150)
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Excluir este registro? Essa ação não pode ser desfeita.',
    )
    if (!confirmed) return

    try {
      await deleteOvertime.mutateAsync({ id })
      setActionsOpen(false)
    } catch {
      return
    }
  }

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={() => setActionsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setActionsOpen(true)
          }
        }}
        className="cursor-pointer transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none"
      >
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-3">
            {dayjs(workDate).format('DD/MM/YYYY')}

            <div className="flex flex-wrap justify-end gap-1.5">
              <Badge variant={isOpen ? 'secondary' : 'default'}>
                {progressStatusLabel(endTime)}
              </Badge>
              <Badge variant={status === 'paid' ? 'default' : 'outline'}>
                {statusLabel(status)}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            {isOpen
              ? 'Expediente em andamento'
              : `Horas extras: ${formatDecimalHours(overtimeHours)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-0.5">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Entrada
              </dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {dayjs(startTime).format('HH:mm')}
              </dd>
            </div>
            <div className="space-y-0.5">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Saída
              </dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {isOpen ? '—' : dayjs(endTime).format('HH:mm')}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <DialogContent className="gap-5 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dayjs(workDate).format('DD/MM/YYYY')}</DialogTitle>
            <DialogDescription>
              Escolha o que deseja fazer com este registro.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {isOpen ? (
              <Button
                type="button"
                size="lg"
                className="min-h-12 w-full justify-start text-base"
                onClick={() => openAction('finalize')}
              >
                <CheckCircle2 className="size-4" />
                Fechar saída
              </Button>
            ) : null}

            <Button
              type="button"
              size="lg"
              variant="outline"
              className="min-h-12 w-full justify-start text-base"
              onClick={() => openAction('edit')}
            >
              <Pencil className="size-4" />
              Editar
            </Button>

            <Button
              type="button"
              size="lg"
              variant="destructive"
              className="min-h-12 w-full justify-start text-base"
              disabled={deleteOvertime.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              {deleteOvertime.isPending ? 'Excluindo…' : 'Excluir'}
            </Button>

            {deleteOvertime.error ? (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {deleteOvertime.error instanceof Error
                  ? deleteOvertime.error.message
                  : 'Não foi possível excluir.'}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <EditOvertimeSheet
        id={id}
        workDate={workDate}
        startTime={startTime}
        endTime={endTime}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {isOpen ? (
        <FinalizeOvertimeSheet
          id={id}
          workDate={workDate}
          startTime={startTime}
          open={finalizeOpen}
          onOpenChange={setFinalizeOpen}
        />
      ) : null}
    </>
  )
}
