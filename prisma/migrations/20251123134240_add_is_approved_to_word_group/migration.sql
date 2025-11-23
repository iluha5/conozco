-- AlterTable
ALTER TABLE "WordGroup" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "WordGroup_isApproved_idx" ON "WordGroup"("isApproved");

-- CreateIndex
CREATE INDEX "WordGroup_visibility_isApproved_idx" ON "WordGroup"("visibility", "isApproved");

