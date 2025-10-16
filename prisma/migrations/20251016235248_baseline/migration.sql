-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."InstructorClass" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."RoadmapStatus" AS ENUM ('PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CourseProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."CourseType" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('PENDING', 'CONTACTED', 'ENROLLED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "adminId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "inceptumId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "profilePhoto" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "age" INTEGER,
    "bio" TEXT,
    "college" TEXT,
    "semester" TEXT,
    "university" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseProvider" (
    "id" TEXT NOT NULL,
    "providerId" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyDescription" TEXT,
    "website" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "established" TIMESTAMP(3),
    "socialMediaLinks" JSONB,
    "businessLicense" TEXT,
    "taxId" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalCourses" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."CourseProviderStatus" NOT NULL DEFAULT 'PENDING',
    "adminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "yearOfGraduation" INTEGER NOT NULL,
    "degree" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "photo" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certificate" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "institute" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "courseImage" TEXT,
    "courseFee" DECIMAL(10,2) NOT NULL,
    "paymentLink" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "level" "public"."CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "duration" INTEGER NOT NULL,
    "courseType" "public"."CourseType" NOT NULL DEFAULT 'ONLINE',
    "language" TEXT NOT NULL DEFAULT 'English',
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "venue" TEXT,
    "totalLessons" INTEGER,
    "totalProjects" INTEGER DEFAULT 0,
    "hasCapstoneProject" BOOLEAN NOT NULL DEFAULT false,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT true,
    "prerequisites" TEXT[],
    "learningOutcomes" TEXT[],
    "courseOutline" TEXT,
    "maxStudents" INTEGER,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "enrollmentDeadline" TIMESTAMP(3),
    "instructorId" TEXT,
    "courseProviderId" TEXT,
    "roadmapId" INTEGER,
    "adminId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "status" "public"."CourseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Roadmap" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "roadmapImage" TEXT,
    "level" "public"."CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "estimatedDuration" INTEGER,
    "totalCourses" INTEGER NOT NULL DEFAULT 0,
    "prerequisites" TEXT[],
    "learningGoals" TEXT[],
    "careerOutcomes" TEXT[],
    "sequence" INTEGER[],
    "isLinear" BOOLEAN NOT NULL DEFAULT true,
    "adminId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "status" "public"."RoadmapStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Instructor" (
    "id" TEXT NOT NULL,
    "instructorId" SERIAL NOT NULL,
    "profilePicture" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "instructorClass" "public"."InstructorClass" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "cv" TEXT,
    "bio" TEXT,
    "specialization" TEXT,
    "experience" INTEGER,
    "expertise" TEXT[],
    "certifications" TEXT[],
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalCourses" INTEGER NOT NULL DEFAULT 0,
    "courseProviderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseRequest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "roadmapName" TEXT,
    "duration" INTEGER NOT NULL,
    "courseOutline" TEXT,
    "courseFee" DECIMAL(10,2),
    "paymentLink" TEXT,
    "level" "public"."CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "courseType" "public"."CourseType" NOT NULL DEFAULT 'ONLINE',
    "location" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "courseImage" TEXT,
    "numberOfSessions" INTEGER NOT NULL,
    "sessionDuration" INTEGER NOT NULL,
    "maxStudents" INTEGER,
    "instructorId" TEXT NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourseEnrollment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "contactedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserCourses" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_EnrolledRoadMaps" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EnrolledRoadMaps_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_InstructorRoadMaps" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InstructorRoadMaps_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_adminId_key" ON "public"."Admin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phoneNumber_key" ON "public"."Admin"("phoneNumber");

-- CreateIndex
CREATE INDEX "Admin_email_phoneNumber_idx" ON "public"."Admin"("email", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_inceptumId_key" ON "public"."User"("inceptumId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "public"."User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_phoneNumber_clerkId_idx" ON "public"."User"("email", "phoneNumber", "clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProvider_providerId_key" ON "public"."CourseProvider"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProvider_email_key" ON "public"."CourseProvider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CourseProvider_phoneNumber_key" ON "public"."CourseProvider"("phoneNumber");

-- CreateIndex
CREATE INDEX "CourseProvider_email_phoneNumber_companyName_idx" ON "public"."CourseProvider"("email", "phoneNumber", "companyName");

-- CreateIndex
CREATE INDEX "Education_userId_idx" ON "public"."Education"("userId");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "public"."Certificate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "public"."Course"("slug");

-- CreateIndex
CREATE INDEX "Course_slug_instructorId_roadmapId_adminId_courseProviderId_idx" ON "public"."Course"("slug", "instructorId", "roadmapId", "adminId", "courseProviderId", "categoryId");

-- CreateIndex
CREATE INDEX "Course_level_courseType_rating_idx" ON "public"."Course"("level", "courseType", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_name_key" ON "public"."CourseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCategory_slug_key" ON "public"."CourseCategory"("slug");

-- CreateIndex
CREATE INDEX "CourseCategory_slug_idx" ON "public"."CourseCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_key" ON "public"."Roadmap"("slug");

-- CreateIndex
CREATE INDEX "Roadmap_slug_adminId_categoryId_idx" ON "public"."Roadmap"("slug", "adminId", "categoryId");

-- CreateIndex
CREATE INDEX "Roadmap_level_status_idx" ON "public"."Roadmap"("level", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_instructorId_key" ON "public"."Instructor"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_phoneNumber_key" ON "public"."Instructor"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "public"."Instructor"("email");

-- CreateIndex
CREATE INDEX "Instructor_email_phoneNumber_courseProviderId_idx" ON "public"."Instructor"("email", "phoneNumber", "courseProviderId");

-- CreateIndex
CREATE INDEX "Instructor_rating_experience_idx" ON "public"."Instructor"("rating", "experience");

-- CreateIndex
CREATE INDEX "CourseRequest_instructorId_status_idx" ON "public"."CourseRequest"("instructorId", "status");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_status_idx" ON "public"."CourseEnrollment"("courseId", "status");

-- CreateIndex
CREATE INDEX "CourseEnrollment_email_phoneNumber_idx" ON "public"."CourseEnrollment"("email", "phoneNumber");

-- CreateIndex
CREATE INDEX "_UserCourses_B_index" ON "public"."_UserCourses"("B");

-- CreateIndex
CREATE INDEX "_EnrolledRoadMaps_B_index" ON "public"."_EnrolledRoadMaps"("B");

-- CreateIndex
CREATE INDEX "_InstructorRoadMaps_B_index" ON "public"."_InstructorRoadMaps"("B");

-- AddForeignKey
ALTER TABLE "public"."CourseProvider" ADD CONSTRAINT "CourseProvider_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_courseProviderId_fkey" FOREIGN KEY ("courseProviderId") REFERENCES "public"."CourseProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."CourseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Roadmap" ADD CONSTRAINT "Roadmap_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Roadmap" ADD CONSTRAINT "Roadmap_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."CourseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Instructor" ADD CONSTRAINT "Instructor_courseProviderId_fkey" FOREIGN KEY ("courseProviderId") REFERENCES "public"."CourseProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseRequest" ADD CONSTRAINT "CourseRequest_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserCourses" ADD CONSTRAINT "_UserCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserCourses" ADD CONSTRAINT "_UserCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EnrolledRoadMaps" ADD CONSTRAINT "_EnrolledRoadMaps_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EnrolledRoadMaps" ADD CONSTRAINT "_EnrolledRoadMaps_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InstructorRoadMaps" ADD CONSTRAINT "_InstructorRoadMaps_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InstructorRoadMaps" ADD CONSTRAINT "_InstructorRoadMaps_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
