import { NextRequest } from 'next/server';
import { createAAAService } from '@/lib/aaa-service';
import { createSuccessResponse, createErrorResponse, getUserFromRequest } from '@/lib/auth';

// Test MikroTik connection
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    const aaaService = createAAAService();
    const result = await aaaService.testConnection();

    if (result.success) {
      // Also get system info for additional details
      const systemInfo = await aaaService.mikrotikClient.getSystemInfo();
      
      return createSuccessResponse({
        connection: result,
        systemInfo: systemInfo.success ? systemInfo.data : null
      }, result.message);
    } else {
      return createErrorResponse(result.message, 503, { error: result.error });
    }

  } catch (error: any) {
    console.error('MikroTik test connection error:', error);
    
    if (error.message.includes('MikroTik connection error')) {
      return createErrorResponse('MikroTik connection failed. Please check router configuration.', 503);
    }
    
    return createErrorResponse('Internal server error during connection test', 500);
  }
}
