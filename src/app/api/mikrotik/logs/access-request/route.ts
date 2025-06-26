import { NextRequest } from 'next/server';
import { createAAAService } from '@/lib/aaa-service';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

// GET - Fetch Access Request logs using AAA service
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '100');
    const username = searchParams.get('username') || undefined;
    const clientIP = searchParams.get('clientIP') || undefined;
    const authStatus = searchParams.get('authStatus') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Validate parameters
    if (count > 1000) {
      return createErrorResponse('Count cannot exceed 1000 logs', 400);
    }

    // Create AAA service
    const aaaService = createAAAService();
    
    // Fetch access request logs
    const result = await aaaService.getAccessRequestLogs({
      count,
      username,
      clientIP,
      authStatus,
      startDate,
      endDate
    });

    if (result.success) {
      // Process and format logs
      const processedLogs = result.data?.map((log: any) => ({
        id: log['.id'] || `${Date.now()}-${Math.random()}`,
        timestamp: log.time || new Date().toISOString(),
        topics: Array.isArray(log.topics) ? log.topics : [log.topics].filter(Boolean),
        message: log.message || '',
        // Parse authentication-specific information from message
        ...parseAuthLogMessage(log.message || ''),
        raw: log
      })) || [];

      return createSuccessResponse({
        logs: processedLogs,
        total: processedLogs.length,
        query: {
          count,
          username,
          clientIP,
          authStatus,
          startDate,
          endDate
        }
      }, 'Access request logs retrieved successfully');
    } else {
      return createErrorResponse(result.message, 500, { error: result.error });
    }

  } catch (error: any) {
    console.error('Access request logs fetch error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Helper function to parse authentication log messages
function parseAuthLogMessage(message: string) {
  const parsed: any = {
    username: null,
    clientIP: null,
    nasIP: null,
    authResult: null,
    reason: null,
    serviceType: null,
    sessionId: null
  };

  try {
    // Common patterns in MikroTik authentication logs
    const patterns = {
      username: /user[=\s]+([^\s,;]+)/i,
      clientIP: /(?:client|from)[=\s]+([0-9.]+)/i,
      nasIP: /(?:nas|server)[=\s]+([0-9.]+)/i,
      sessionId: /(?:session|id)[=\s]+([^\s,;]+)/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = message.match(pattern);
      if (match) {
        parsed[key] = match[1];
      }
    });

    // Determine authentication result
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('accept') || lowerMessage.includes('login') || lowerMessage.includes('authenticated')) {
      parsed.authResult = 'accept';
    } else if (lowerMessage.includes('reject') || lowerMessage.includes('deny') || lowerMessage.includes('failed')) {
      parsed.authResult = 'reject';
    } else if (lowerMessage.includes('logout') || lowerMessage.includes('disconnect')) {
      parsed.authResult = 'logout';
    }

    // Determine service type
    if (lowerMessage.includes('pppoe') || lowerMessage.includes('ppp')) {
      parsed.serviceType = 'pppoe';
    } else if (lowerMessage.includes('hotspot')) {
      parsed.serviceType = 'hotspot';
    }

    // Extract reason for rejection
    const reasonPatterns = [
      /reason[=:\s]+([^,;]+)/i,
      /error[=:\s]+([^,;]+)/i,
      /cause[=:\s]+([^,;]+)/i
    ];

    for (const pattern of reasonPatterns) {
      const match = message.match(pattern);
      if (match) {
        parsed.reason = match[1].trim();
        break;
      }
    }

    // Parse additional RADIUS attributes
    const radiusAttributes = {
      callingStationId: /calling-station-id[=:\s]+([^\s,;]+)/i,
      calledStationId: /called-station-id[=:\s]+([^\s,;]+)/i,
      nasPortId: /nas-port-id[=:\s]+([^\s,;]+)/i,
      framedIP: /framed-ip[=:\s]+([0-9.]+)/i
    };

    Object.entries(radiusAttributes).forEach(([key, pattern]) => {
      const match = message.match(pattern);
      if (match) {
        parsed[key] = match[1];
      }
    });

  } catch (error) {
    console.warn('Error parsing authentication log message:', error);
  }

  return parsed;
}
