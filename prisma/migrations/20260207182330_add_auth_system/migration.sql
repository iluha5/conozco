-- CreateEnum
CREATE TYPE "RegistrationMethod" AS ENUM ('ADMIN_CREATED', 'EMAIL_PASSWORD', 'OAUTH_GOOGLE');

-- CreateEnum
CREATE TYPE "RateLimitAction" AS ENUM ('REGISTER', 'RESEND', 'FORGOT', 'LOGIN');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGED', 'WELCOME');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailBounced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "registrationMethod" "RegistrationMethod" NOT NULL DEFAULT 'EMAIL_PASSWORD',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT,
    "action" "RateLimitAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "messageId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expires_idx" ON "EmailVerificationToken"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_email_token_key" ON "EmailVerificationToken"("email", "token");

-- CreateIndex
CREATE INDEX "RateLimitLog_action_createdAt_idx" ON "RateLimitLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitLog_email_createdAt_idx" ON "RateLimitLog"("email", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitLog_ipAddress_createdAt_idx" ON "RateLimitLog"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_email_sentAt_idx" ON "EmailLog"("email", "sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_type_sentAt_idx" ON "EmailLog"("type", "sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_status_sentAt_idx" ON "EmailLog"("status", "sentAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");

-- CreateIndex
CREATE INDEX "User_registrationMethod_idx" ON "User"("registrationMethod");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
