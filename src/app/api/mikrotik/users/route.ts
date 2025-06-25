import { NextRequest } from 'next/server';
import { createAAAService } from '@/lib/aaa-service';
import { createSuccessResponse, createErrorResponse, getUserFromRequest } from '@/lib/auth';

// Get MikroTik users
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
    let result;

    if (serviceType === 'pppoe') {
      result = await aaaService.mikrotikClient.getPPPoEUsers();
    } else {
      result = await aaaService.mikrotikClient.getHotspotUsers();
    }

    if (result.success) {
      return createSuccessResponse({
        users: result.data,
        serviceType,
        count: result.data?.length || 0
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400);
    }

  } catch (error: any) {
    console.error('Get MikroTik users error:', error);
    return createErrorResponse('Internal server error while fetching users', 500);
  }
}

// Delete MikroTik user
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Check if user has admin permissions
    if (tokenUser.userType !== 'Admin Staff') {
      return createErrorResponse('Insufficient permissions. Admin access required.', 403);
    }

    const body = await request.json();
    const { username, serviceType = 'pppoe' } = body;

    if (!username) {
      return createErrorResponse('Username is required', 400);
    }

    if (!['pppoe', 'hotspot'].includes(serviceType)) {
      return createErrorResponse('Invalid service type. Must be "pppoe" or "hotspot"', 400);
    }

    const aaaService = createAAAService();
    const result = await aaaService.deleteUserAccount(username, serviceType);

    if (result.success) {
      return createSuccessResponse({
        username,
        serviceType
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400);
    }

  } catch (error: any) {
    console.error('Delete MikroTik user error:', error);
    return createErrorResponse('Internal server error while deleting user', 500);
  }
}
