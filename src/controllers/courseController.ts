import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendSuccess, sendError } from "../utils/response";
import { CourseQuery } from "../types";

export class CourseController {
  // Get all courses (with filters or all if ?all=true)
  static async getAllCourses(req: Request, res: Response) {
    try {
      // Check database connection before proceeding
      try {
        // Use a timeout to prevent hanging in serverless environments
        const connectionPromise = prisma.$queryRaw`SELECT 1`;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 5000)
        );
        
        await Promise.race([connectionPromise, timeoutPromise]);
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        return sendError(res, "Database connection error. Please try again later.", 503);
      }
      
      // Only log in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        console.log("Database URL:", process.env.DATABASE_URL ? "Set" : "Not set");
        console.log("Attempting to fetch courses...");
      }
      const {
        page = "1",
        limit = "10",
        level,
        courseType,
        category,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        all,
      } = req.query as CourseQuery & { all?: string };

      const isAll = all === "true";

      const fallbackLimit = 10;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = isAll
        ? undefined
        : Math.min(50, Math.max(1, parseInt(limit)));
      const skip = isAll
        ? undefined
        : (pageNum - 1) * (limitNum || fallbackLimit);

      // Filters
      const whereClause: any = { status: "PUBLISHED" };

      if (level) whereClause.level = level.toUpperCase();
      if (courseType) whereClause.courseType = courseType.toUpperCase();
      if (category) whereClause.category = { slug: category };
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
        ];
      }

      // Sort
      const orderBy: any = {};
      if (sortBy === "rating") orderBy.rating = sortOrder;
      else if (sortBy === "price") orderBy.courseFee = sortOrder;
      else if (sortBy === "students") orderBy.currentStudents = sortOrder;
      else orderBy.createdAt = sortOrder;

      const [courses, totalCourses] = await Promise.all([
        prisma.course.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limitNum,
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                rating: true,
                experience: true,
                specialization: true,
              },
            },
            courseProvider: {
              select: {
                id: true,
                companyName: true,
                logo: true,
                rating: true,
                verified: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
            roadmap: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
            _count: {
              select: {
                enrolledStudents: true,
              },
            },
          },
        }),
        isAll
          ? Promise.resolve(0)
          : prisma.course.count({ where: whereClause }),
      ]);

      const formattedCourses = courses.map((course) => ({
        ...course,
        enrolledStudentsCount: course._count.enrolledStudents,
        _count: undefined,
      }));

      const pagination = isAll
        ? undefined
        : {
            page: pageNum,
            limit: limitNum || fallbackLimit,
            total: totalCourses,
            totalPages: Math.ceil(totalCourses / (limitNum || fallbackLimit)),
          };

      console.log("Successfully fetched courses:", formattedCourses.length);
      return sendSuccess(
        res,
        formattedCourses,
        "Courses retrieved successfully",
        200,
        pagination
      );
    } catch (error) {
      console.error("Error fetching courses:", error);
      
      // Handle specific Prisma errors
      if ((error as { code?: string }).code) {
        // Connection errors
        if ((error as { code?: string }).code === 'P1001' || (error as { code?: string }).code === 'P1002') {
          return sendError(res, "Database connection error. Please try again later.", 503);
        }
        // Authentication errors
        if ((error as { code?: string }).code === 'P1003') {
          return sendError(res, "Database authentication failed. Please try again later.", 500);
        }
        // Timeout errors
        if ((error as { code?: string }).code === 'P1008') {
          return sendError(res, "Database operation timed out. Please try again later.", 504);
        }
        // Record not found
        if ((error as { code?: string }).code === 'P2025') {
          return sendError(res, "Requested resource not found.", 404);
        }
      }
      
      // Handle specific error types for serverless environments
      const errorMessage = (error as Error).message || "";
      
      // Connection timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        return sendError(res, "Database connection timed out. Please try again later.", 504);
      }
      
      // Memory limit errors
      if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
        return sendError(res, "Server resource limit reached. Please try again later.", 503);
      }
      
      // For serverless function errors, provide a more specific message
      if (errorMessage.includes('serverless') || errorMessage.includes('function') || 
          errorMessage.includes('execution') || errorMessage.includes('lambda')) {
        return sendError(res, "Serverless function error. Please try again later.", 500);
      }
      
      // Generic error handling
      return sendError(res, 
        process.env.NODE_ENV === 'production' 
          ? "An error occurred while fetching courses. Please try again later." 
          : `Failed to fetch courses: ${errorMessage || "Unknown error"}`,
        500
      );
    }
  }

  // Get single course by slug
  static async getCourseBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      if (!slug) return sendError(res, "Course slug is required", 400);

      const course = await prisma.course.findUnique({
        where: { slug, status: "PUBLISHED" },
        include: {
          instructor: true,
          courseProvider: true,
          category: true,
          roadmap: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrolledStudents: true,
            },
          },
        },
      });

      if (!course) return sendError(res, "Course not found", 404);

      const formattedCourse = {
        ...course,
        enrolledStudentsCount: course._count.enrolledStudents,
        _count: undefined,
      };

      return sendSuccess(res, formattedCourse, "Course retrieved successfully");
    } catch (error) {
      console.error("Error fetching course:", error);
      return sendError(res, "Failed to fetch course", 500);
    }
  }

  // Get all course categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.courseCategory.findMany({
        include: {
          _count: {
            select: {
              courses: {
                where: { status: "PUBLISHED" },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      const formatted = categories.map((category) => ({
        ...category,
        courseCount: category._count.courses,
        _count: undefined,
      }));

      return sendSuccess(res, formatted, "Categories retrieved successfully");
    } catch (error) {
      console.error("Error fetching categories:", error);
      return sendError(res, "Failed to fetch categories", 500);
    }
  }

  // Enroll in a course
  static async enrollInCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, name, phoneNumber, college, semester } = req.body;

      if (!id || !userId || !name || !phoneNumber) {
        return sendError(res, "Missing required fields", 400);
      }

      // Check if course exists and is published
      const course = await prisma.course.findFirst({
        where: {
          id: parseInt(id),
          status: "PUBLISHED"
        }
      });

      if (!course) {
        return sendError(res, "Course not found", 404);
      }

      // Check if user is already enrolled
      const existingEnrollment = await prisma.course.findFirst({
        where: {
          id: parseInt(id),
          enrolledStudents: {
            some: {
              id: userId
            }
          }
        }
      });

      if (existingEnrollment) {
        return sendError(res, "Already enrolled in this course", 400);
      }

      // Enroll the user
      await prisma.course.update({
        where: { id: parseInt(id) },
        data: {
          enrolledStudents: {
            connect: { id: userId }
          },
          currentStudents: { increment: 1 }
        }
      });

      return sendSuccess(res, null, "Successfully enrolled in course");
    } catch (error) {
      console.error("Error enrolling in course:", error);
      return sendError(res, "Failed to enroll in course", 500);
    }
  }
}
