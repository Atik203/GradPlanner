/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('DREAM', 'MATCH', 'SAFETY');

-- CreateEnum
CREATE TYPE "ProfessorStatus" AS ENUM ('NOT_CONTACTED', 'EMAILED', 'AWAITING_REPLY', 'REPLIED_POSITIVE', 'REPLIED_NEGATIVE', 'INTERVIEWED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'OFFER_RECEIVED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TRANSCRIPT', 'DEGREE_CERTIFICATE', 'IELTS', 'TOEFL', 'GRE', 'LOR', 'SOP', 'CV', 'PASSPORT', 'POLICE_CLEARANCE', 'BANK_STATEMENT', 'MEDICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'OBTAINED', 'EXPIRED', 'NOT_REQUIRED');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "university" TEXT,
    "cgpa" DOUBLE PRECISION,
    "targetIntake" TEXT,
    "graduationDate" TEXT,
    "targetDegree" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "tier" "Tier" NOT NULL,
    "program" TEXT,
    "tuitionPerYr" TEXT,
    "deadline" TEXT,
    "intake" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "profileUrl" TEXT,
    "researchInterests" TEXT,
    "emailSentDate" TIMESTAMP(3),
    "emailSubject" TEXT,
    "replyReceived" BOOLEAN NOT NULL DEFAULT false,
    "replyDate" TIMESTAMP(3),
    "status" "ProfessorStatus" NOT NULL DEFAULT 'NOT_CONTACTED',
    "lastFollowUp" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "suggestedContact" TEXT,
    "futureFundingNote" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PLANNING',
    "deadline" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "offerReceived" BOOLEAN NOT NULL DEFAULT false,
    "scholarshipAmt" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "country" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityRanking" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "inQs" BOOLEAN NOT NULL DEFAULT false,
    "inThe" BOOLEAN NOT NULL DEFAULT false,
    "inArwu" BOOLEAN NOT NULL DEFAULT false,
    "qs2026Rank" INTEGER,
    "qs2026RankDisplay" TEXT,
    "qs2026Score" DOUBLE PRECISION,
    "qsArScore" DOUBLE PRECISION,
    "qsErScore" DOUBLE PRECISION,
    "qsFsrScore" DOUBLE PRECISION,
    "qsCpfScore" DOUBLE PRECISION,
    "qsIfrScore" DOUBLE PRECISION,
    "qsIsrScore" DOUBLE PRECISION,
    "qsEoScore" DOUBLE PRECISION,
    "qsSusScore" DOUBLE PRECISION,
    "the2026Rank" INTEGER,
    "the2026RankDisplay" TEXT,
    "the2026Score" DOUBLE PRECISION,
    "theTeaching" DOUBLE PRECISION,
    "theResearchEnv" DOUBLE PRECISION,
    "theResearchQuality" DOUBLE PRECISION,
    "theIndustry" DOUBLE PRECISION,
    "theInternational" DOUBLE PRECISION,
    "arwu2025Rank" INTEGER,
    "arwu2025Score" DOUBLE PRECISION,
    "arwuAlumni" DOUBLE PRECISION,
    "arwuAward" DOUBLE PRECISION,
    "arwuHici" DOUBLE PRECISION,
    "arwuNs" DOUBLE PRECISION,
    "arwuPub" DOUBLE PRECISION,
    "arwuPcp" DOUBLE PRECISION,

    CONSTRAINT "UniversityRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_universityId_key" ON "Application"("universityId");

-- CreateIndex
CREATE INDEX "UniversityRanking_qs2026Rank_idx" ON "UniversityRanking"("qs2026Rank");

-- CreateIndex
CREATE INDEX "UniversityRanking_the2026Rank_idx" ON "UniversityRanking"("the2026Rank");

-- CreateIndex
CREATE INDEX "UniversityRanking_arwu2025Rank_idx" ON "UniversityRanking"("arwu2025Rank");

-- CreateIndex
CREATE INDEX "UniversityRanking_country_idx" ON "UniversityRanking"("country");

-- CreateIndex
CREATE INDEX "UniversityRanking_inQs_inThe_inArwu_idx" ON "UniversityRanking"("inQs", "inThe", "inArwu");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityRanking_institutionName_key" ON "UniversityRanking"("institutionName");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
