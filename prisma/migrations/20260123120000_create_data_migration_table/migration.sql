-- CreateTable
CREATE TABLE IF NOT EXISTS "DataMigration" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedBy" TEXT,
    "gitSha" TEXT,
    "checksum" TEXT NOT NULL,
    "durationMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',

    CONSTRAINT "DataMigration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DataMigration_name_key" ON "DataMigration"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DataMigration_name_idx" ON "DataMigration"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DataMigration_appliedAt_idx" ON "DataMigration"("appliedAt");
