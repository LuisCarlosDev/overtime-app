import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../src/db/schema.ts'

config({ path: ['.env.local', '.env'] })

const db = drizzle(process.env.DATABASE_URL!, { schema })

function atTime(base: Date, hours: number, minutes = 0) {
  const date = new Date(base)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(12, 0, 0, 0)
  return date
}

const seedData = [
  {
    workDate: daysAgo(1),
    startTime: atTime(daysAgo(1), 8, 0),
    endTime: atTime(daysAgo(1), 18, 0),
    standardHours: '8',
    overtimeHours: '2',
    status: 'pending' as const,
  },
  {
    workDate: daysAgo(3),
    startTime: atTime(daysAgo(3), 8, 0),
    endTime: atTime(daysAgo(3), 17, 30),
    standardHours: '8',
    overtimeHours: '1.5',
    status: 'pending' as const,
  },
  {
    workDate: daysAgo(5),
    startTime: atTime(daysAgo(5), 8, 0),
    endTime: atTime(daysAgo(5), 17, 0),
    standardHours: '8',
    overtimeHours: '1',
    status: 'paid' as const,
  },
  {
    workDate: daysAgo(8),
    startTime: atTime(daysAgo(8), 9, 0),
    endTime: atTime(daysAgo(8), 18, 30),
    standardHours: '8',
    overtimeHours: '1.5',
    status: 'paid' as const,
  },
  {
    workDate: daysAgo(12),
    startTime: atTime(daysAgo(12), 8, 0),
    endTime: atTime(daysAgo(12), 18, 0),
    standardHours: '8',
    overtimeHours: '2',
    status: 'pending' as const,
  },
]

const rows = await db.insert(schema.overtimeRecords).values(seedData).returning()

console.log(`Seed concluído: ${rows.length} registros inseridos.`)
process.exit(0)
