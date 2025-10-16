import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface ProviderRow {
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

async function importData() {
  try {
    console.log('Starting CSV data import...');

    // Read and parse CourseCategory CSV
    const categoryPath = path.join(__dirname, '../../../CourseCategory.csv');
    const categoryData = fs.readFileSync(categoryPath, 'utf-8');
    const categories = parse(categoryData, {
      columns: true,
      skip_empty_lines: true,
    }) as CategoryRow[];

    console.log(`Found ${categories.length} categories to import`);

    // Import CourseCategories
    for (const category of categories) {
      await prisma.courseCategory.upsert({
        where: { id: parseInt(category.id) },
        update: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
        },
        create: {
          id: parseInt(category.id),
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
        },
      });
      console.log(`✓ Imported category: ${category.name}`);
    }

    // Read and parse CourseProvider CSV
    const providerPath = path.join(__dirname, '../../../CourseProvider.csv');
    const providerData = fs.readFileSync(providerPath, 'utf-8');
    const providers = parse(providerData, {
      columns: true,
      skip_empty_lines: true,
    }) as ProviderRow[];

    console.log(`Found ${providers.length} course providers to import`);

    // Import CourseProviders
    for (const provider of providers) {
      // Parse JSON fields
      const socialMediaLinks = provider.socialMediaLinks
        ? JSON.parse(provider.socialMediaLinks)
        : {};

      await prisma.courseProvider.upsert({
        where: { id: provider.id },
        update: {
          providerId: parseInt(provider.providerId),
          companyName: provider.companyName,
          companyDescription: provider.companyDescription,
          website: provider.website,
          email: provider.email,
          password: provider.password,
          phoneNumber: provider.phoneNumber,
          address: provider.address,
          city: provider.city,
          country: provider.country,
          logo: provider.logo,
          coverImage: provider.coverImage,
          established: provider.established ? new Date(provider.established) : null,
          socialMediaLinks: socialMediaLinks,
          businessLicense: provider.businessLicense,
          taxId: provider.taxId,
          rating: provider.rating ? parseFloat(provider.rating) : null,
          totalStudents: parseInt(provider.totalStudents) || 0,
          totalCourses: parseInt(provider.totalCourses) || 0,
          verified: provider.verified === 'true',
          status: provider.status as any,
          adminId: provider.adminId || null,
        },
        create: {
          id: provider.id,
          providerId: parseInt(provider.providerId),
          companyName: provider.companyName,
          companyDescription: provider.companyDescription,
          website: provider.website,
          email: provider.email,
          password: provider.password,
          phoneNumber: provider.phoneNumber,
          address: provider.address,
          city: provider.city,
          country: provider.country,
          logo: provider.logo,
          coverImage: provider.coverImage,
          established: provider.established ? new Date(provider.established) : null,
          socialMediaLinks: socialMediaLinks,
          businessLicense: provider.businessLicense,
          taxId: provider.taxId,
          rating: provider.rating ? parseFloat(provider.rating) : null,
          totalStudents: parseInt(provider.totalStudents) || 0,
          totalCourses: parseInt(provider.totalCourses) || 0,
          verified: provider.verified === 'true',
          status: provider.status as any,
          adminId: provider.adminId || null,
        },
      });
      console.log(`✓ Imported provider: ${provider.companyName}`);
    }

    // Read and parse Course CSV
    const coursePath = path.join(__dirname, '../../../Course.csv');
    const courseData = fs.readFileSync(coursePath, 'utf-8');
    const courses = parse(courseData, {
      columns: true,
      skip_empty_lines: true,
    }) as CourseRow[];

    console.log(`Found ${courses.length} courses to import`);

    // Import Courses
    for (const course of courses) {
      // Parse JSON fields
      const prerequisites = course.prerequisites ? JSON.parse(course.prerequisites) : [];
      const learningOutcomes = course.learningOutcomes
        ? JSON.parse(course.learningOutcomes)
        : [];

      await prisma.course.upsert({
        where: { id: parseInt(course.id) },
        update: {
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription,
          courseImage: course.courseImage,
          courseFee: course.courseFee ? parseFloat(course.courseFee) : undefined,
          rating: course.rating ? parseFloat(course.rating) : null,
          totalRatings: parseInt(course.totalRatings) || 0,
          level: course.level as any,
          duration: parseInt(course.duration) || 0,
          courseType: course.courseType as any,
          language: course.language,
          address: course.address,
          city: course.city,
          country: course.country,
          venue: course.venue,
          totalLessons: parseInt(course.totalLessons) || undefined,
          totalProjects: parseInt(course.totalProjects) || 0,
          hasCapstoneProject: course.hasCapstoneProject === 'true',
          hasCertificate: course.hasCertificate === 'true',
          prerequisites: prerequisites,
          learningOutcomes: learningOutcomes,
          courseOutline: course.courseOutline,
          maxStudents: parseInt(course.maxStudents) || undefined,
          currentStudents: parseInt(course.currentStudents) || 0,
          startDate: course.startDate ? new Date(course.startDate) : null,
          endDate: course.endDate ? new Date(course.endDate) : null,
          enrollmentDeadline: course.enrollmentDeadline
            ? new Date(course.enrollmentDeadline)
            : null,
          instructorId: course.instructorId || null,
          courseProviderId: course.courseProviderId || null,
          roadmapId: course.roadmapId ? parseInt(course.roadmapId) : null,
          adminId: course.adminId || undefined,
          categoryId: course.categoryId ? parseInt(course.categoryId) : undefined,
          status: course.status as any,
          paymentLink: course.paymentLink || undefined,
        },
        create: {
          id: parseInt(course.id),
          title: course.title,
          slug: course.slug,
          description: course.description,
          shortDescription: course.shortDescription,
          courseImage: course.courseImage,
          courseFee: course.courseFee ? parseFloat(course.courseFee) : 0,
          rating: course.rating ? parseFloat(course.rating) : null,
          totalRatings: parseInt(course.totalRatings) || 0,
          level: course.level as any,
          duration: parseInt(course.duration) || 0,
          courseType: course.courseType as any,
          language: course.language,
          address: course.address,
          city: course.city,
          country: course.country,
          venue: course.venue,
          totalLessons: parseInt(course.totalLessons) || undefined,
          totalProjects: parseInt(course.totalProjects) || 0,
          hasCapstoneProject: course.hasCapstoneProject === 'true',
          hasCertificate: course.hasCertificate === 'true',
          prerequisites: prerequisites,
          learningOutcomes: learningOutcomes,
          courseOutline: course.courseOutline,
          maxStudents: parseInt(course.maxStudents) || undefined,
          currentStudents: parseInt(course.currentStudents) || 0,
          startDate: course.startDate ? new Date(course.startDate) : null,
          endDate: course.endDate ? new Date(course.endDate) : null,
          enrollmentDeadline: course.enrollmentDeadline
            ? new Date(course.enrollmentDeadline)
            : null,
          instructorId: course.instructorId || null,
          courseProviderId: course.courseProviderId || null,
          roadmapId: course.roadmapId ? parseInt(course.roadmapId) : null,
          adminId: course.adminId,
          categoryId: parseInt(course.categoryId),
          status: course.status as any,
          paymentLink: course.paymentLink || undefined,
        },
      });
      console.log(`✓ Imported course: ${course.title}`);
    }

    console.log('\n✅ All data imported successfully!');
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
