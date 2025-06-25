import { NextRequest } from 'next/server';
import { createAAAService } from '@/lib/aaa-service';
import { createSuccessResponse, createErrorResponse, getUserFromRequest } from '@/lib/auth';

// Get active sessions
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('type') as 'pppoe' | 'hotspot' || 'pppoe';

    if (!['pppoe', 'hotspot'].includes(serviceType)) {
      return createErrorResponse('Invalid service type. Must be "pppoe" or "hotspot"', 400);
    }

    const aaaService = createAAAService();
    const result = await aaaService.getActiveSessions(serviceType);

    if (result.success) {
      return createSuccessResponse({
        sessions: result.data,
        serviceType,
        count: result.data?.length || 0
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400);
    }

  } catch (error: any) {
    console.error('Get sessions error:', error);
    return createErrorResponse('Internal server error while fetching sessions', 500);
  }
}

// Disconnect session
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Check permissions - both Admin and Office staff can disconnect sessions
    if (!['Admin Staff', 'Office Staff'].includes(tokenUser.userType)) {
      return createErrorResponse('Insufficient permissions', 403);
    }

    const body = await request.json();
    const { sessionId, serviceType = 'pppoe' } = body;

    if (!sessionId) {
      return createErrorResponse('Session ID is required', 400);
    }

    if (!['pppoe', 'hotspot'].includes(serviceType)) {
      return createErrorResponse('Invalid service type. Must be "pppoe" or "hotspot"', 400);
    }

    const aaaService = createAAAService();
    const result = await aaaService.disconnectUser(sessionId, serviceType);

    if (result.success) {
      return createSuccessResponse({
        sessionId,
        serviceType
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400);
    }

  } catch (error: any) {
    console.error('Disconnect session error:', error);
    return createErrorResponse('Internal server error while disconnecting session', 500);
  }
}
