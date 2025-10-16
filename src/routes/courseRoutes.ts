import { Router } from "express";
import { CourseController } from "../controllers/courseController";

const router = Router();

// GET /api/courses - Get all courses with filtering and pagination
router.get("/", CourseController.getAllCourses);

// GET /api/courses/categories - Get all categories
router.get("/categories", CourseController.getCategories);

// GET /api/courses/:slug - Get course by slug
router.get("/:slug", CourseController.getCourseBySlug);

// POST /api/courses/:courseId/enroll - Submit enrollment request
router.post("/:courseId/enroll", CourseController.submitEnrollment);

export default router;
