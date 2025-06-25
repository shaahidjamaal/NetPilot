import { NextRequest } from 'next/server';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token to verify authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the token from storage. We just confirm the request is valid.
    
    return createSuccessResponse({}, 'Logged out successfully');

  } catch (error: any) {
    console.error('Logout error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
