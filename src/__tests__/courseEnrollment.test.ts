import { Request, Response } from 'express';
import { CourseController } from '../controllers/courseController';
import prisma from '../utils/prisma';

// Mock Prisma client
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    course: {
      findFirst: jest.fn(),
    },
    courseEnrollment: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('CourseController - Enrollment', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();

    responseObject = {
      success: false,
      message: '',
      data: null,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
    };
  });

  describe('submitEnrollment', () => {
    const mockUser = {
      id: 'cuid_123',
      clerkId: 'user_test123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+251912345678',
      university: 'Addis Ababa University',
      college: 'Engineering',
      semester: 'Year 3, Semester 1',
      isProfileComplete: true,
    };

    const mockCourse = {
      id: 1,
      title: 'Web Development Bootcamp',
      slug: 'web-development-bootcamp',
      courseImage: 'https://example.com/course.jpg',
      paymentLink: 'https://chapa.link/payment-xyz',
    };

    it('should create enrollment successfully for complete profile', async () => {
      const mockEnrollment = {
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+251912345678',
        college: 'Engineering',
        semester: 'Year 3, Semester 1',
        university: 'Addis Ababa University',
        courseId: 1,
        status: 'PENDING',
        notes: null,
        contactedAt: null,
        contactedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        course: mockCourse,
      };

      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.courseEnrollment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.courseEnrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'user_test123' },
      });

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          status: 'PUBLISHED',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          courseImage: true,
          paymentLink: true,
        },
      });

      expect(prisma.courseEnrollment.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'test@example.com',
          phoneNumber: '+251912345678',
          college: 'Engineering',
          semester: 'Year 3, Semester 1',
          university: 'Addis Ababa University',
          courseId: 1,
          status: 'PENDING',
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              courseImage: true,
              paymentLink: true,
            },
          },
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data.course.paymentLink).toBe('https://chapa.link/payment-xyz');
    });

    it('should return 400 if courseId is missing', async () => {
      mockRequest = {
        params: {},
        body: {
          clerkId: 'user_test123',
        },
      };

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('Course ID is required');
    });

    it('should return 400 if clerkId is missing', async () => {
      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {},
      };

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('clerkId missing');
    });

    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_nonexistent',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('User not found');
    });

    it('should return 400 if user profile is incomplete', async () => {
      const incompleteUser = {
        ...mockUser,
        isProfileComplete: false,
        phoneNumber: null,
        university: null,
        college: null,
        semester: null,
      };

      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(incompleteUser);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('incomplete');
    });

    it('should return 404 if course not found or not published', async () => {
      mockRequest = {
        params: {
          courseId: '999',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('not found');
    });

    it('should return 400 if duplicate enrollment exists', async () => {
      const existingEnrollment = {
        id: 1,
        email: 'test@example.com',
        courseId: 1,
        status: 'PENDING',
      };

      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.courseEnrollment.findFirst as jest.Mock).mockResolvedValue(existingEnrollment);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('already have a pending enrollment');
    });

    it('should check for both PENDING and CONTACTED status in duplicate check', async () => {
      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.courseEnrollment.findFirst as jest.Mock).mockResolvedValue(null);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.courseEnrollment.findFirst).toHaveBeenCalledWith({
        where: {
          courseId: 1,
          email: mockUser.email,
          status: {
            in: ['PENDING', 'CONTACTED'],
          },
        },
      });
    });

    it('should include payment link in response', async () => {
      const mockEnrollment = {
        id: 1,
        name: 'John Doe',
        email: 'test@example.com',
        phoneNumber: '+251912345678',
        college: 'Engineering',
        semester: 'Year 3, Semester 1',
        university: 'Addis Ababa University',
        courseId: 1,
        status: 'PENDING',
        course: mockCourse,
      };

      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.courseEnrollment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.courseEnrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.data.course).toHaveProperty('paymentLink');
      expect(responseObject.data.course.paymentLink).toBe('https://chapa.link/payment-xyz');
    });

    it('should handle database errors gracefully', async () => {
      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      );

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.success).toBe(false);
    });

    it('should use user stored data for enrollment', async () => {
      mockRequest = {
        params: {
          courseId: '1',
        },
        body: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.courseEnrollment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.courseEnrollment.create as jest.Mock).mockResolvedValue({});

      await CourseController.submitEnrollment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.courseEnrollment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'John Doe',
            email: mockUser.email,
            phoneNumber: mockUser.phoneNumber,
            college: mockUser.college,
            semester: mockUser.semester,
            university: mockUser.university,
          }),
        })
      );
    });
  });
});
