/*
  Warnings:

  - The values [PENDING,CANCELLED_WINDOW,CANCELLED_LATE,FAILED] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `energy` on the `ListenerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `ListenerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `ListenerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tone` on the `ListenerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `windowCancelCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ListenerTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price120Min` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price30Min` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price60Min` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerHour` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ListenerProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `bio` on table `ListenerProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bookingId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthMonth` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthYear` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ListenerAvailability" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('TONE', 'RELATIONAL_ENERGY', 'APPROACH');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('VIDEO_CALL', 'PHONE_CALL', 'TEXT_CHAT');

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentIntentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'AVAILABLE', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "SessionStatus_new" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Session" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Session" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");
ALTER TYPE "SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "public"."SessionStatus_old";
ALTER TABLE "Session" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- DropForeignKey
ALTER TABLE "ListenerProfile" DROP CONSTRAINT "ListenerProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "ListenerTopic" DROP CONSTRAINT "ListenerTopic_listenerId_fkey";

-- DropForeignKey
ALTER TABLE "ListenerTopic" DROP CONSTRAINT "ListenerTopic_topicId_fkey";

-- AlterTable
ALTER TABLE "ListenerProfile" DROP COLUMN "energy",
DROP COLUMN "hourlyRate",
DROP COLUMN "isVerified",
DROP COLUMN "tone",
ADD COLUMN     "availability" "ListenerAvailability" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "bankDetails" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "price120Min" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "price30Min" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "price60Min" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "pricePerHour" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "bio" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "currency",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "totalCost",
ADD COLUMN     "bookingId" TEXT NOT NULL,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "scheduledTime" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'TEXT_CHAT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
DROP COLUMN "windowCancelCount",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birthMonth" TEXT NOT NULL,
ADD COLUMN     "birthYear" TEXT NOT NULL,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "ListenerTopic";

-- DropTable
DROP TABLE "Topic";

-- DropEnum
DROP TYPE "AccountStatus";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListenerCategory" (
    "listenerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ListenerCategory_pkey" PRIMARY KEY ("listenerId","categoryId")
);

-- CreateTable
CREATE TABLE "ListenerAttribute" (
    "id" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ListenerAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "isInstant" BOOLEAN NOT NULL DEFAULT false,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "status" "ChatStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledTime" TIMESTAMP(3),
    "lastMessage" TEXT,
    "lastMessageTime" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "isInstant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "clientSecret" TEXT,
    "status" "PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentIntentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "paymentMethodId" TEXT,
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Earning" (
    "id" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "status" "EarningStatus" NOT NULL DEFAULT 'PENDING',
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availableAt" TIMESTAMP(3),

    CONSTRAINT "Earning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountId" TEXT,
    "bankDetails" JSONB,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "estimatedArrival" TIMESTAMP(3),

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "ListenerAttribute_listenerId_type_idx" ON "ListenerAttribute"("listenerId", "type");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_listenerId_dayOfWeek_idx" ON "AvailabilitySlot"("listenerId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Booking_clientId_idx" ON "Booking"("clientId");

-- CreateIndex
CREATE INDEX "Booking_listenerId_idx" ON "Booking"("listenerId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_sessionId_key" ON "Chat"("sessionId");

-- CreateIndex
CREATE INDEX "Chat_clientId_idx" ON "Chat"("clientId");

-- CreateIndex
CREATE INDEX "Chat_listenerId_idx" ON "Chat"("listenerId");

-- CreateIndex
CREATE INDEX "Chat_status_idx" ON "Chat"("status");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_idx" ON "ChatMessage"("chatId");

-- CreateIndex
CREATE INDEX "ChatMessage_timestamp_idx" ON "ChatMessage"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Review_sessionId_key" ON "Review"("sessionId");

-- CreateIndex
CREATE INDEX "Review_listenerId_idx" ON "Review"("listenerId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_bookingId_key" ON "PaymentIntent"("bookingId");

-- CreateIndex
CREATE INDEX "PaymentIntent_clientId_idx" ON "PaymentIntent"("clientId");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_idx" ON "PaymentIntent"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_sessionId_key" ON "Payment"("sessionId");

-- CreateIndex
CREATE INDEX "Payment_clientId_idx" ON "Payment"("clientId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Earning_paymentId_key" ON "Earning"("paymentId");

-- CreateIndex
CREATE INDEX "Earning_listenerId_idx" ON "Earning"("listenerId");

-- CreateIndex
CREATE INDEX "Earning_status_idx" ON "Earning"("status");

-- CreateIndex
CREATE INDEX "Withdrawal_listenerId_idx" ON "Withdrawal"("listenerId");

-- CreateIndex
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");

-- CreateIndex
CREATE INDEX "ListenerProfile_availability_idx" ON "ListenerProfile"("availability");

-- CreateIndex
CREATE INDEX "ListenerProfile_rating_idx" ON "ListenerProfile"("rating");

-- CreateIndex
CREATE INDEX "ListenerProfile_verified_idx" ON "ListenerProfile"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "Session_bookingId_key" ON "Session"("bookingId");

-- CreateIndex
CREATE INDEX "Session_clientId_idx" ON "Session"("clientId");

-- CreateIndex
CREATE INDEX "Session_listenerId_idx" ON "Session"("listenerId");

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Session_scheduledTime_idx" ON "Session"("scheduledTime");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "ListenerProfile" ADD CONSTRAINT "ListenerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListenerCategory" ADD CONSTRAINT "ListenerCategory_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "ListenerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListenerCategory" ADD CONSTRAINT "ListenerCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListenerAttribute" ADD CONSTRAINT "ListenerAttribute_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "ListenerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "ListenerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "ListenerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentIntentId_fkey" FOREIGN KEY ("paymentIntentId") REFERENCES "PaymentIntent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earning" ADD CONSTRAINT "Earning_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "ListenerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earning" ADD CONSTRAINT "Earning_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "ListenerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
