ALTER TABLE "timesheets" ALTER COLUMN "clock_in" DROP NOT NULL;
ALTER TABLE "timesheets" ADD COLUMN "is_billable" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "meetings" ALTER COLUMN "time" DROP NOT NULL;
ALTER TABLE "meetings" ALTER COLUMN "duration" DROP NOT NULL;
ALTER TABLE "meetings" ALTER COLUMN "attendees" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "meetings" ADD COLUMN "agenda" TEXT;
ALTER TABLE "meetings" ADD COLUMN "start_time" TEXT;
ALTER TABLE "meetings" ADD COLUMN "end_time" TEXT;
ALTER TABLE "meetings" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'scheduled';
ALTER TABLE "meetings" ADD COLUMN "reminder" TEXT;
ALTER TABLE "meetings" ADD COLUMN "location" TEXT;
ALTER TABLE "meetings" ADD COLUMN "organizer_id" TEXT;
ALTER TABLE "meetings" ADD COLUMN "organizer_name" TEXT;

ALTER TABLE "settings" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "settings" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "settings" ADD COLUMN "work_start_time" TEXT NOT NULL DEFAULT '09:00';
ALTER TABLE "settings" ADD COLUMN "work_end_time" TEXT NOT NULL DEFAULT '18:00';

CREATE TABLE "task_attachments" (
  "id" TEXT NOT NULL,
  "task_id" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "data_url" TEXT NOT NULL,
  "uploaded_by" TEXT,
  "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "task_attachments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "task_attachments" ADD CONSTRAINT "task_attachments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
