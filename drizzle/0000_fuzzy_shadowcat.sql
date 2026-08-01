CREATE TABLE "overtime_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_date" timestamp DEFAULT now() NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp NOT NULL,
	"standard_hours" numeric DEFAULT '0' NOT NULL,
	"overtime_hours" numeric DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
