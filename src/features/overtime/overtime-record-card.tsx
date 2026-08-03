import dayjs from 'dayjs'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { FinalizeOvertimeSheet } from './finalize-overtime-sheet'
import { formatDecimalHours, recordStatusLabel } from './format'

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

  return (
    <Card className="transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {dayjs(workDate).format('DD/MM/YYYY')}

          <Badge
            variant={
              isOpen ? 'secondary' : status === 'paid' ? 'default' : 'outline'
            }
          >
            {recordStatusLabel({ endTime, status })}
          </Badge>
        </CardTitle>
        <CardDescription>
          {isOpen
            ? 'Expediente em andamento'
            : `Horas extras: ${formatDecimalHours(overtimeHours)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {isOpen ? (
          <FinalizeOvertimeSheet
            id={id}
            workDate={workDate}
            startTime={startTime}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
