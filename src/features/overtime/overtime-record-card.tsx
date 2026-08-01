import dayjs from 'dayjs'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatDecimalHours, statusLabel } from './format'

type OvertimeRecordCardProps = {
  workDate: string
  startTime: string
  endTime: string
  overtimeHours: string
  status: 'pending' | 'paid'
}

export function OvertimeRecordCard({
  workDate,
  startTime,
  endTime,
  overtimeHours,
  status,
}: OvertimeRecordCardProps) {
  return (
    <Card className="transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {dayjs(workDate).format('DD/MM/YYYY')}

          <Badge variant={status === 'paid' ? 'default' : 'outline'}>
            {statusLabel(status)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Horas extras: {formatDecimalHours(overtimeHours)}
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
              {dayjs(endTime).format('HH:mm')}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
