import { NextRequest } from 'next/server';
import { createAAAService } from '@/lib/aaa-service';
import { createSuccessResponse, createErrorResponse, getUserFromRequest } from '@/lib/auth';

// Get profiles
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
      result = await aaaService.mikrotikClient.getPPPoEProfiles();
    } else {
      result = await aaaService.mikrotikClient.getHotspotProfiles();
    }

    if (result.success) {
      return createSuccessResponse({
        profiles: result.data,
        serviceType,
        count: result.data?.length || 0
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400);
    }

  } catch (error: any) {
    console.error('Get profiles error:', error);
    return createErrorResponse('Internal server error while fetching profiles', 500);
  }
}

// Create profile from package
export async function POST(request: NextRequest) {
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
    const { package: pkg, serviceType = 'pppoe' } = body;

    if (!pkg) {
      return createErrorResponse('Package data is required', 400);
    }

    if (!['pppoe', 'hotspot'].includes(serviceType)) {
      return createErrorResponse('Invalid service type. Must be "pppoe" or "hotspot"', 400);
    }

    const aaaService = createAAAService();
    const result = await aaaService.createBandwidthProfile(pkg, serviceType);

    if (result.success) {
      return createSuccessResponse({
        profile: result.data,
        package: pkg.name,
        serviceType
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400);
    }

  } catch (error: any) {
    console.error('Create profile error:', error);
    return createErrorResponse('Internal server error while creating profile', 500);
  }
}
