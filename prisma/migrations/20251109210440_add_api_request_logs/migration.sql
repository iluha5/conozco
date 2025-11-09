-- CreateTable
CREATE TABLE "ApiRequestLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "serviceName" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "requestData" TEXT NOT NULL,
    "responseData" TEXT,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiRequestLog_userId_idx" ON "ApiRequestLog"("userId");

-- CreateIndex
CREATE INDEX "ApiRequestLog_serviceName_createdAt_idx" ON "ApiRequestLog"("serviceName", "createdAt");

-- CreateIndex
CREATE INDEX "ApiRequestLog_createdAt_idx" ON "ApiRequestLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

