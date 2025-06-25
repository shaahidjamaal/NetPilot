import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken, createSuccessResponse, createErrorResponse, validateEmail, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if using external backend
    const useExternalBackend = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';

    if (useExternalBackend) {
      return createErrorResponse('This endpoint is not available when using external backend. Please use your NestJS backend instead.', 503);
    }

    await connectDB();

    const body = await request.json();
    const { email, username, password, firstName, lastName, userType, designation, roleId } = body;

    // Validation
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!username) {
      errors.push('Username is required');
    } else if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!password) {
      errors.push('Password is required');
    } else {
      const passwordErrors = validatePassword(password);
      errors.push(...passwordErrors);
    }

    if (!designation) {
      errors.push('Designation is required');
    }

    if (!roleId) {
      errors.push('Role ID is required');
    }

    if (userType && !['Admin Staff', 'Office Staff'].includes(userType)) {
      errors.push('Invalid user type');
    }

    if (errors.length > 0) {
      return createErrorResponse(errors, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return createErrorResponse('User with this email already exists', 409);
      }
      if (existingUser.username === username) {
        return createErrorResponse('Username is already taken', 409);
      }
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      username,
      password,
      firstName,
      lastName,
      userType: userType || 'Office Staff',
      designation,
      roleId,
      enabled: true
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    // Return user data without password
    const userResponse = newUser.toJSON();

    return createSuccessResponse({
      access_token: token,
      user: userResponse
    }, 'User registered successfully');

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return createErrorResponse(`${field} already exists`, 409);
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return createErrorResponse(validationErrors, 400);
    }

    return createErrorResponse('Internal server error', 500);
  }
}
