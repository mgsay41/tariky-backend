import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import prisma from '../utils/prisma';

interface CourseProviderRow {
  id: string;
  providerId: string;
  companyName: string;
  companyDescription: string;
  website: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  logo: string;
  coverImage: string;
  established: string;
  socialMediaLinks: string;
  businessLicense: string;
  taxId: string;
  rating: string;
  totalStudents: string;
  totalCourses: string;
  verified: string;
  status: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  courseImage: string;
  courseFee: string;
  rating: string;
  totalRatings: string;
  level: string;
  duration: string;
  courseType: string;
  language: string;
  address: string;
  city: string;
  country: string;
  venue: string;
  totalLessons: string;
  totalProjects: string;
  hasCapstoneProject: string;
  hasCertificate: string;
  prerequisites: string;
  learningOutcomes: string;
  courseOutline: string;
  maxStudents: string;
  currentStudents: string;
  startDate: string;
  endDate: string;
  enrollmentDeadline: string;
  instructorId: string;
  courseProviderId: string;
  roadmapId: string;
  adminId: string;
  categoryId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentLink: string;
}

// Helper to parse JSON strings from CSV
function parseJSON(value: string): any {
  if (!value || value.trim() === '' || value === 'null') return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// Helper to parse arrays from CSV
function parseArray(value: string): string[] {
  if (!value || value.trim() === '' || value === '[]') return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

// Helper to parse boolean values
function parseBoolean(value: string): boolean {
  return value === 'true' || value === '1' || value === 'TRUE';
}

// Helper to parse dates
function parseDate(value: string): Date | null {
  if (!value || value.trim() === '' || value === 'null') return null;
  return new Date(value);
}

// Read CSV file and return parsed rows
async function readCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function seedCourseCategories() {
  console.log('\n📚 Seeding Course Categories...');

  const csvPath = path.join(__dirname, '../../../CourseCategory.csv');
  const rows = await readCSV<CourseCategoryRow>(csvPath);

  for (const row of rows) {
    try {
      await prisma.courseCategory.upsert({
        where: { id: parseInt(row.id) },
        update: {
          name: row.name,
          slug: row.slug,
          description: row.description,
          icon: row.icon || null,
          color: row.color || null,
        },
        create: {
          id: parseInt(row.id),
          name: row.name,
          slug: row.slug,
          description: row.description,
          icon: row.icon || null,
          color: row.color || null,
        },
      });
      console.log(`  ✅ ${row.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to seed category ${row.name}:`, error);
    }
  }

  console.log(`✅ Seeded ${rows.length} course categories\n`);
}

async function seedCourseProviders() {
  console.log('\n🏢 Seeding Course Providers...');

  const csvPath = path.join(__dirname, '../../../CourseProvider.csv');
  const rows = await readCSV<CourseProviderRow>(csvPath);

  for (const row of rows) {
    try {
      // Check if admin exists, create if not
      let admin;
      try {
        admin = await prisma.admin.findUnique({
          where: { id: row.adminId },
        });

        if (!admin) {
          // Create a default admin if not exists
          admin = await prisma.admin.create({
            data: {
              id: row.adminId,
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@tariky.net',
              password: '$2b$12$defaultHashedPassword',
              phoneNumber: '+20 000 000 0000',
            },
          });
          console.log(`  ℹ️  Created admin user for provider`);
        }
      } catch (adminError) {
        console.error(`  ⚠️  Admin check/create failed, skipping provider ${row.companyName}`);
        continue;
      }

      await prisma.courseProvider.upsert({
        where: { id: row.id },
        update: {
          companyName: row.companyName,
          companyDescription: row.companyDescription || null,
          website: row.website || null,
          email: row.email,
          password: row.password,
          phoneNumber: row.phoneNumber,
          address: row.address || null,
          city: row.city || null,
          country: row.country || null,
          logo: row.logo || null,
          coverImage: row.coverImage || null,
          established: parseDate(row.established),
          socialMediaLinks: parseJSON(row.socialMediaLinks),
          businessLicense: row.businessLicense || null,
          taxId: row.taxId || null,
          rating: row.rating ? parseFloat(row.rating) : 0.0,
          totalStudents: parseInt(row.totalStudents) || 0,
          totalCourses: parseInt(row.totalCourses) || 0,
          verified: parseBoolean(row.verified),
          status: row.status as any,
          adminId: row.adminId,
        },
        create: {
          id: row.id,
          companyName: row.companyName,
          companyDescription: row.companyDescription || null,
          website: row.website || null,
          email: row.email,
          password: row.password,
          phoneNumber: row.phoneNumber,
          address: row.address || null,
          city: row.city || null,
          country: row.country || null,
          logo: row.logo || null,
          coverImage: row.coverImage || null,
          established: parseDate(row.established),
          socialMediaLinks: parseJSON(row.socialMediaLinks),
          businessLicense: row.businessLicense || null,
          taxId: row.taxId || null,
          rating: row.rating ? parseFloat(row.rating) : 0.0,
          totalStudents: parseInt(row.totalStudents) || 0,
          totalCourses: parseInt(row.totalCourses) || 0,
          verified: parseBoolean(row.verified),
          status: row.status as any,
          adminId: row.adminId,
        },
      });
      console.log(`  ✅ ${row.companyName}`);
    } catch (error) {
      console.error(`  ❌ Failed to seed provider ${row.companyName}:`, error);
    }
  }

  console.log(`✅ Seeded ${rows.length} course providers\n`);
}

async function seedCourses() {
  console.log('\n📖 Seeding Courses...');

  const csvPath = path.join(__dirname, '../../../Course.csv');
  const rows = await readCSV<CourseRow>(csvPath);

  for (const row of rows) {
    try {
      // Verify required relations exist
      const [admin, category, instructor, provider] = await Promise.all([
        prisma.admin.findUnique({ where: { id: row.adminId } }),
        prisma.courseCategory.findUnique({ where: { id: parseInt(row.categoryId) } }),
        row.instructorId ? prisma.instructor.findUnique({ where: { id: row.instructorId } }) : Promise.resolve(null),
        row.courseProviderId ? prisma.courseProvider.findUnique({ where: { id: row.courseProviderId } }) : Promise.resolve(null),
      ]);

      if (!admin) {
        console.error(`  ⚠️  Admin ${row.adminId} not found for course ${row.title}, skipping`);
        continue;
      }

      if (!category) {
        console.error(`  ⚠️  Category ${row.categoryId} not found for course ${row.title}, skipping`);
        continue;
      }

      if (row.instructorId && !instructor) {
        console.error(`  ⚠️  Instructor ${row.instructorId} not found for course ${row.title}, skipping`);
        continue;
      }

      if (row.courseProviderId && !provider) {
        console.error(`  ⚠️  Provider ${row.courseProviderId} not found for course ${row.title}, skipping`);
        continue;
      }

      await prisma.course.upsert({
        where: { id: parseInt(row.id) },
        update: {
          title: row.title,
          slug: row.slug,
          description: row.description || null,
          shortDescription: row.shortDescription || null,
          courseImage: row.courseImage || null,
          courseFee: row.courseFee ? parseFloat(row.courseFee) : 0,
          paymentLink: row.paymentLink || null,
          rating: row.rating ? parseFloat(row.rating) : 0.0,
          totalRatings: parseInt(row.totalRatings) || 0,
          level: row.level as any,
          duration: parseInt(row.duration),
          courseType: row.courseType as any,
          language: row.language || 'English',
          address: row.address || null,
          city: row.city || null,
          country: row.country || null,
          venue: row.venue || null,
          totalLessons: row.totalLessons ? parseInt(row.totalLessons) : null,
          totalProjects: row.totalProjects ? parseInt(row.totalProjects) : 0,
          hasCapstoneProject: parseBoolean(row.hasCapstoneProject),
          hasCertificate: parseBoolean(row.hasCertificate),
          prerequisites: parseArray(row.prerequisites),
          learningOutcomes: parseArray(row.learningOutcomes),
          courseOutline: row.courseOutline || null,
          maxStudents: row.maxStudents ? parseInt(row.maxStudents) : null,
          currentStudents: parseInt(row.currentStudents) || 0,
          startDate: parseDate(row.startDate),
          endDate: parseDate(row.endDate),
          enrollmentDeadline: parseDate(row.enrollmentDeadline),
          instructorId: row.instructorId || null,
          courseProviderId: row.courseProviderId || null,
          roadmapId: row.roadmapId ? parseInt(row.roadmapId) : null,
          adminId: row.adminId,
          categoryId: parseInt(row.categoryId),
          status: row.status as any,
        },
        create: {
          id: parseInt(row.id),
          title: row.title,
          slug: row.slug,
          description: row.description || null,
          shortDescription: row.shortDescription || null,
          courseImage: row.courseImage || null,
          courseFee: row.courseFee ? parseFloat(row.courseFee) : 0,
          paymentLink: row.paymentLink || null,
          rating: row.rating ? parseFloat(row.rating) : 0.0,
          totalRatings: parseInt(row.totalRatings) || 0,
          level: row.level as any,
          duration: parseInt(row.duration),
          courseType: row.courseType as any,
          language: row.language || 'English',
          address: row.address || null,
          city: row.city || null,
          country: row.country || null,
          venue: row.venue || null,
          totalLessons: row.totalLessons ? parseInt(row.totalLessons) : null,
          totalProjects: row.totalProjects ? parseInt(row.totalProjects) : 0,
          hasCapstoneProject: parseBoolean(row.hasCapstoneProject),
          hasCertificate: parseBoolean(row.hasCertificate),
          prerequisites: parseArray(row.prerequisites),
          learningOutcomes: parseArray(row.learningOutcomes),
          courseOutline: row.courseOutline || null,
          maxStudents: row.maxStudents ? parseInt(row.maxStudents) : null,
          currentStudents: parseInt(row.currentStudents) || 0,
          startDate: parseDate(row.startDate),
          endDate: parseDate(row.endDate),
          enrollmentDeadline: parseDate(row.enrollmentDeadline),
          instructorId: row.instructorId || null,
          courseProviderId: row.courseProviderId || null,
          roadmapId: row.roadmapId ? parseInt(row.roadmapId) : null,
          adminId: row.adminId,
          categoryId: parseInt(row.categoryId),
          status: row.status as any,
        },
      });
      console.log(`  ✅ ${row.title}`);
    } catch (error) {
      console.error(`  ❌ Failed to seed course ${row.title}:`, error);
    }
  }

  console.log(`✅ Seeded ${rows.length} courses\n`);
}

async function main() {
  console.log('🌱 Starting database seeding from CSV files...\n');
  console.log('=' .repeat(60));

  try {
    // Seed in order of dependencies
    await seedCourseCategories();
    await seedCourseProviders();
    await seedCourses();

    console.log('=' .repeat(60));
    console.log('\n🎉 Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
main();
