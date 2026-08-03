import { decimal, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'

export const StatusEnum = pgEnum('status', ['pending', 'paid'])

export const overtimeRecords = pgTable('overtime_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  workDate: timestamp('work_date').notNull().defaultNow(),
  startTime: timestamp('start_time').notNull().defaultNow(),
  endTime: timestamp('end_time'),
  standardHours: decimal('standard_hours').notNull().default('0'),
  overtimeHours: decimal('overtime_hours').notNull().default('0'),
  status: StatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
})
