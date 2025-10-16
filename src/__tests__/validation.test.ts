/**
 * Validation Tests
 *
 * Tests for data validation including:
 * - Phone number format validation
 * - Required field validation
 * - Data sanitization
 */

describe('Validation Tests', () => {
  describe('Phone Number Validation', () => {
    const validateEgyptianPhoneNumber = (phoneNumber: string): boolean => {
      // Egyptian phone number format: +20XXXXXXXXXX (10 digits after +20)
      const egyptianPhoneRegex = /^\+20[0-9]{10}$/;
      return egyptianPhoneRegex.test(phoneNumber);
    };

    it('should accept valid Egyptian phone number', () => {
      const validNumbers = [
        '+201012345678',
        '+201111111111',
        '+201234567890',
        '+201000000000',
      ];

      validNumbers.forEach((number) => {
        expect(validateEgyptianPhoneNumber(number)).toBe(true);
      });
    });

    it('should reject invalid Egyptian phone numbers', () => {
      const invalidNumbers = [
        '01012345678',        // Missing +20
        '+20101234567',       // Too few digits
        '+2010123456789',     // Too many digits
        '201012345678',       // Missing +
        '+20-101-234-5678',   // Contains dashes
        '+20 101 234 5678',   // Contains spaces
        '+211012345678',      // Wrong country code
        'invalid',            // Not a number
        '',                   // Empty string
        null,                 // Null
        undefined,            // Undefined
      ];

      invalidNumbers.forEach((number) => {
        expect(validateEgyptianPhoneNumber(number as any)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      expect(validateEgyptianPhoneNumber('+200000000000')).toBe(true); // All zeros
      expect(validateEgyptianPhoneNumber('+209999999999')).toBe(true); // All nines
    });
  });

  describe('Required Field Validation', () => {
    const validateRequiredFields = (
      data: Record<string, any>,
      requiredFields: string[]
    ): { isValid: boolean; missingFields: string[] } => {
      const missingFields: string[] = [];

      requiredFields.forEach((field) => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
          missingFields.push(field);
        }
      });

      return {
        isValid: missingFields.length === 0,
        missingFields,
      };
    };

    it('should validate all required fields are present', () => {
      const data = {
        phoneNumber: '+201012345678',
        university: 'Cairo University',
        college: 'Engineering',
        semester: 'Year 3',
      };

      const result = validateRequiredFields(data, [
        'phoneNumber',
        'university',
        'college',
        'semester',
      ]);

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const data = {
        phoneNumber: '+201012345678',
        university: 'Cairo University',
        // Missing college and semester
      };

      const result = validateRequiredFields(data, [
        'phoneNumber',
        'university',
        'college',
        'semester',
      ]);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('college');
      expect(result.missingFields).toContain('semester');
    });

    it('should treat empty strings as missing', () => {
      const data = {
        phoneNumber: '+201012345678',
        university: '',
        college: '   ',
        semester: 'Year 3',
      };

      const result = validateRequiredFields(data, [
        'phoneNumber',
        'university',
        'college',
        'semester',
      ]);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('university');
      expect(result.missingFields).toContain('college');
    });

    it('should handle null and undefined values', () => {
      const data = {
        phoneNumber: '+201012345678',
        university: null,
        college: undefined,
        semester: 'Year 3',
      };

      const result = validateRequiredFields(data, [
        'phoneNumber',
        'university',
        'college',
        'semester',
      ]);

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('university');
      expect(result.missingFields).toContain('college');
    });
  });

  describe('User Creation Validation', () => {
    const validateUserCreationData = (
      data: any
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Required fields
      if (!data.clerkId) errors.push('clerkId is required');
      if (!data.email) errors.push('email is required');
      if (!data.firstName) errors.push('firstName is required');
      if (!data.lastName) errors.push('lastName is required');

      // Email format
      if (data.email && !data.email.includes('@')) {
        errors.push('Invalid email format');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    it('should validate complete user creation data', () => {
      const userData = {
        clerkId: 'user_test123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        profilePhoto: 'https://example.com/photo.jpg',
      };

      const result = validateUserCreationData(userData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required user fields', () => {
      const userData = {
        clerkId: 'user_test123',
        // Missing email, firstName, lastName
      };

      const result = validateUserCreationData(userData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email is required');
      expect(result.errors).toContain('firstName is required');
      expect(result.errors).toContain('lastName is required');
    });

    it('should validate email format', () => {
      const userData = {
        clerkId: 'user_test123',
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = validateUserCreationData(userData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('Onboarding Data Validation', () => {
    const validateOnboardingData = (
      data: any
    ): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];

      // Required fields
      if (!data.phoneNumber) errors.push('Phone number is required');
      if (!data.university) errors.push('University is required');
      if (!data.college) errors.push('College is required');
      if (!data.semester) errors.push('Semester is required');

      // Phone number format
      if (data.phoneNumber && !/^\+20[0-9]{10}$/.test(data.phoneNumber)) {
        errors.push('Invalid Egyptian phone number format. Use: +20XXXXXXXXXX');
      }

      // Minimum length validations
      if (data.university && data.university.length < 2) {
        errors.push('University name must be at least 2 characters');
      }
      if (data.college && data.college.length < 2) {
        errors.push('College name must be at least 2 characters');
      }
      if (data.semester && data.semester.length < 1) {
        errors.push('Semester is required');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    it('should validate complete onboarding data', () => {
      const onboardingData = {
        phoneNumber: '+201012345678',
        university: 'Cairo University',
        college: 'Engineering',
        semester: 'Year 3, Semester 1',
      };

      const result = validateOnboardingData(onboardingData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect all validation errors', () => {
      const onboardingData = {
        phoneNumber: '0912345678', // Invalid format
        university: 'A', // Too short
        college: '', // Empty
        // Missing semester
      };

      const result = validateOnboardingData(onboardingData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('phone number'))).toBe(true);
      expect(result.errors.some((e) => e.includes('University'))).toBe(true);
    });

    it('should validate phone number format specifically', () => {
      const invalidPhones = [
        { phoneNumber: '0912345678', university: 'AAU', college: 'Eng', semester: 'Y3' },
        { phoneNumber: '+25191234567', university: 'AAU', college: 'Eng', semester: 'Y3' },
        { phoneNumber: '+1234567890', university: 'AAU', college: 'Eng', semester: 'Y3' },
      ];

      invalidPhones.forEach((data) => {
        const result = validateOnboardingData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.some((e) => e.includes('phone number'))).toBe(true);
      });
    });
  });

  describe('Enrollment Data Validation', () => {
    it('should validate that user profile is complete before enrollment', () => {
      const validateEnrollmentEligibility = (user: any): boolean => {
        return (
          user &&
          user.isProfileComplete === true &&
          user.phoneNumber &&
          user.university &&
          user.college &&
          user.semester
        );
      };

      const completeUser = {
        id: 'cuid_123',
        clerkId: 'user_test123',
        isProfileComplete: true,
        phoneNumber: '+251912345678',
        university: 'AAU',
        college: 'Engineering',
        semester: 'Y3',
      };

      expect(validateEnrollmentEligibility(completeUser)).toBe(true);

      const incompleteUser = {
        id: 'cuid_123',
        clerkId: 'user_test123',
        isProfileComplete: false,
        phoneNumber: null,
        university: null,
        college: null,
        semester: null,
      };

      expect(validateEnrollmentEligibility(incompleteUser)).toBe(false);
    });

    it('should validate courseId format', () => {
      const isValidCourseId = (courseId: any): boolean => {
        const parsed = parseInt(courseId);
        return !isNaN(parsed) && parsed > 0;
      };

      expect(isValidCourseId('1')).toBe(true);
      expect(isValidCourseId('123')).toBe(true);
      expect(isValidCourseId('0')).toBe(false);
      expect(isValidCourseId('-1')).toBe(false);
      expect(isValidCourseId('abc')).toBe(false);
      expect(isValidCourseId('')).toBe(false);
    });
  });

  describe('Data Sanitization', () => {
    const sanitizeString = (input: string): string => {
      if (!input) return '';
      return input.trim().replace(/\s+/g, ' ');
    };

    it('should trim whitespace from strings', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString('test')).toBe('test');
      expect(sanitizeString('  ')).toBe('');
    });

    it('should normalize multiple spaces', () => {
      expect(sanitizeString('test    string')).toBe('test string');
      expect(sanitizeString('multiple   spaces   here')).toBe('multiple spaces here');
    });

    it('should handle edge cases', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });
});
