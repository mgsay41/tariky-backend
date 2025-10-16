import { Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import prisma from '../utils/prisma';

// Mock Prisma client
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock response
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

  describe('createOrUpdateUser', () => {
    it('should create a new user successfully', async () => {
      const mockUserData = {
        clerkId: 'user_test123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profilePhoto: 'https://example.com/photo.jpg',
      };

      const mockCreatedUser = {
        id: 'cuid_123',
        ...mockUserData,
        inceptumId: 1,
        phoneNumber: null,
        password: null,
        age: null,
        bio: null,
        college: null,
        semester: null,
        university: null,
        isProfileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest = {
        body: mockUserData,
      };

      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockCreatedUser);

      await UserController.createOrUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: mockUserData.clerkId },
        update: {
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          profilePhoto: mockUserData.profilePhoto,
        },
        create: {
          clerkId: mockUserData.clerkId,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          profilePhoto: mockUserData.profilePhoto,
          isProfileComplete: false,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveProperty('user');
      expect(responseObject.data).toHaveProperty('isNewUser');
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest = {
        body: {
          clerkId: 'user_test123',
          // Missing email, firstName, lastName
        },
      };

      await UserController.createOrUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('required');
    });

    it('should handle database errors gracefully', async () => {
      mockRequest = {
        body: {
          clerkId: 'user_test123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      (prisma.user.upsert as jest.Mock).mockRejectedValue(
        new Error('Database connection error')
      );

      await UserController.createOrUpdateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.success).toBe(false);
    });
  });

  describe('getProfile', () => {
    it('should retrieve user profile successfully', async () => {
      const mockUser = {
        id: 'cuid_123',
        clerkId: 'user_test123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isProfileComplete: true,
        phoneNumber: '+251912345678',
        university: 'Addis Ababa University',
        college: 'Engineering',
        semester: 'Year 3, Semester 1',
      };

      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await UserController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'user_test123' },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toEqual(mockUser);
    });

    it('should return 404 if user not found', async () => {
      mockRequest = {
        params: {
          clerkId: 'user_nonexistent',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await UserController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('not found');
    });

    it('should return 400 if clerkId is missing', async () => {
      mockRequest = {
        params: {},
      };

      await UserController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('should complete onboarding successfully with valid data', async () => {
      const mockOnboardingData = {
        phoneNumber: '+251912345678',
        university: 'Addis Ababa University',
        college: 'Engineering',
        semester: 'Year 3, Semester 1',
      };

      const mockUpdatedUser = {
        id: 'cuid_123',
        clerkId: 'user_test123',
        ...mockOnboardingData,
        isProfileComplete: true,
      };

      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
        body: mockOnboardingData,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await UserController.completeOnboarding(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'user_test123' },
        data: {
          ...mockOnboardingData,
          isProfileComplete: true,
        },
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data.isProfileComplete).toBe(true);
    });

    it('should validate Ethiopian phone number format', async () => {
      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
        body: {
          phoneNumber: '1234567890', // Invalid format
          university: 'Addis Ababa University',
          college: 'Engineering',
          semester: 'Year 3',
        },
      };

      await UserController.completeOnboarding(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('phone number');
    });

    it('should return 400 if required onboarding fields are missing', async () => {
      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
        body: {
          phoneNumber: '+251912345678',
          // Missing university, college, semester
        },
      };

      await UserController.completeOnboarding(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('required');
    });

    it('should handle duplicate phone number error', async () => {
      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
        body: {
          phoneNumber: '+251912345678',
          university: 'Addis Ababa University',
          college: 'Engineering',
          semester: 'Year 3',
        },
      };

      const duplicateError: any = new Error('Unique constraint failed');
      duplicateError.code = 'P2002';

      (prisma.user.update as jest.Mock).mockRejectedValue(duplicateError);

      await UserController.completeOnboarding(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toContain('already in use');
    });
  });

  describe('checkProfile', () => {
    it('should return isComplete=true for complete profile', async () => {
      const mockUser = {
        id: 'cuid_123',
        clerkId: 'user_test123',
        isProfileComplete: true,
        phoneNumber: '+251912345678',
        university: 'Addis Ababa University',
        college: 'Engineering',
        semester: 'Year 3',
      };

      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await UserController.checkProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data.isComplete).toBe(true);
      expect(responseObject.data.user).toEqual(mockUser);
    });

    it('should return isComplete=false for incomplete profile', async () => {
      const mockUser = {
        id: 'cuid_123',
        clerkId: 'user_test123',
        isProfileComplete: false,
        phoneNumber: null,
      };

      mockRequest = {
        params: {
          clerkId: 'user_test123',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await UserController.checkProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data.isComplete).toBe(false);
    });

    it('should return isComplete=false if user not found', async () => {
      mockRequest = {
        params: {
          clerkId: 'user_nonexistent',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await UserController.checkProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data.isComplete).toBe(false);
      expect(responseObject.data.user).toBeNull();
    });
  });
});
