import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user from JWT token
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Find user in database
    const user = await User.findById(tokenUser.userId);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Check if user is still enabled
    if (!user.enabled) {
      return createErrorResponse('Account is disabled', 401);
    }

    // Return user data without password
    const userResponse = user.toJSON();

    return Response.json(userResponse);

  } catch (error: any) {
    console.error('Profile error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
