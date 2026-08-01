import { createFileRoute } from '@tanstack/react-router'
import { CreateOvertimeSheet } from '#/features/overtime/create-overtime-sheet'
import { OvertimeRecordCard } from '#/features/overtime/overtime-record-card'
import {
  overtimeListQueryOptions,
  useOvertimeRecords,
} from '#/features/overtime/overtime.queries'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(overtimeListQueryOptions()),
  component: Home,
})

function Home() {
  const { data: records } = useOvertimeRecords()

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg space-y-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-balance text-primary">
            Horas Extras
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            Seu controle de horas, simplificado.
          </p>
        </div>
        <CreateOvertimeSheet />
      </header>

      <section>
        {records.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhuma hora extra cadastrada ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {records.map((record) => (
              <OvertimeRecordCard key={record.id} {...record} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
