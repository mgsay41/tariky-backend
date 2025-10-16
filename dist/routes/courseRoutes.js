"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const router = (0, express_1.Router)();
// GET /api/courses - Get all courses with filtering and pagination
router.get("/", courseController_1.CourseController.getAllCourses);
// GET /api/courses/categories - Get all categories
router.get("/categories", courseController_1.CourseController.getCategories);
// GET /api/courses/:slug - Get course by slug
router.get("/:slug", courseController_1.CourseController.getCourseBySlug);
// POST /api/courses/:courseId/enroll - Submit enrollment request
router.post("/:courseId/enroll", courseController_1.CourseController.submitEnrollment);
exports.default = router;
