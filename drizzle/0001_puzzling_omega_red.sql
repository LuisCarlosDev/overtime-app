CREATE TYPE "public"."status" AS ENUM('pending', 'paid');--> statement-breakpoint
ALTER TABLE "overtime_records" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."status";--> statement-breakpoint
ALTER TABLE "overtime_records" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";