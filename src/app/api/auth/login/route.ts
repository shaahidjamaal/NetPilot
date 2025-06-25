import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken, createSuccessResponse, createErrorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { usernameOrEmail, password } = body;

    // Validation
    if (!usernameOrEmail) {
      return createErrorResponse('Username or email is required', 400);
    }

    if (!password) {
      return createErrorResponse('Password is required', 400);
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail }
      ]
    });

    if (!user) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Check if user is enabled
    if (!user.enabled) {
      return createErrorResponse('Account is disabled. Please contact administrator.', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.toJSON();

    return createSuccessResponse({
      access_token: token,
      user: userResponse
    }, 'Login successful');

  } catch (error: any) {
    console.error('Login error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
