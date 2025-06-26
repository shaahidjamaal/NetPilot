import { NextRequest } from 'next/server';
import { createMikroTikClientFromNAS } from '@/lib/mikrotik';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

// GET - Fetch Access Request (RADIUS/AAA) logs from MikroTik device
export async function GET(request: NextRequest) {
  try {
    // Check if using external backend
    const useExternalBackend = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';
    
    if (useExternalBackend) {
      return createErrorResponse('This endpoint is not available when using external backend. Please use your NestJS backend instead.', 503);
    }

    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const count = parseInt(searchParams.get('count') || '100');
    const topics = searchParams.get('topics')?.split(',') || ['radius', 'ppp', 'hotspot'];
    const where = searchParams.get('where') || '';
    const username = searchParams.get('username');
    const clientIP = searchParams.get('clientIP');
    const authStatus = searchParams.get('authStatus'); // accept, reject
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate parameters
    if (count > 1000) {
      return createErrorResponse('Count cannot exceed 1000 logs', 400);
    }

    // Create MikroTik client
    const mikrotikClient = await createMikroTikClientFromNAS(deviceId || undefined);
    if ('error' in mikrotikClient) {
      return createErrorResponse(mikrotikClient.error, 503);
    }

    // Build log query options
    const logOptions: any = {
      count,
      topics
    };

    // Build where clause for filtering
    let whereClause = '';
    
    if (username) {
      whereClause += `message~"${username}"`;
    }
    
    if (clientIP) {
      if (whereClause) whereClause += ' && ';
      whereClause += `message~"${clientIP}"`;
    }
    
    if (authStatus) {
      if (whereClause) whereClause += ' && ';
      if (authStatus === 'accept') {
        whereClause += `(message~"accept" || message~"login" || message~"authenticated")`;
      } else if (authStatus === 'reject') {
        whereClause += `(message~"reject" || message~"deny" || message~"failed")`;
      }
    }

    // Add date filtering if provided
    if (startDate || endDate) {
      let dateFilter = '';
      if (startDate) {
        dateFilter += `time>="${startDate}"`;
      }
      if (endDate) {
        if (dateFilter) dateFilter += ' && ';
        dateFilter += `time<="${endDate}"`;
      }
      
      if (whereClause) {
        whereClause = `(${whereClause}) && (${dateFilter})`;
      } else {
        whereClause = dateFilter;
      }
    }

    // Add custom where clause
    if (where) {
      if (whereClause) {
        whereClause = `(${whereClause}) && (${where})`;
      } else {
        whereClause = where;
      }
    }

    if (whereClause) {
      logOptions.where = whereClause;
    }

    // Fetch RADIUS logs
    const result = await mikrotikClient.getRADIUSLogs(logOptions);

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
        deviceId: deviceId || 'default',
        query: logOptions,
        filters: {
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
