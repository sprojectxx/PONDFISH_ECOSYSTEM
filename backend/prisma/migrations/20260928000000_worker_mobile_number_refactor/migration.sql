-- AlterTable: Safely migrate workers.email to workers.mobile_number preserving all worker IDs and password hashes
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'email'
    ) THEN
        ALTER TABLE "workers" RENAME COLUMN "email" TO "mobile_number";
    END IF;
END $$;

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "workers_mobile_number_key" ON "workers"("mobile_number");
