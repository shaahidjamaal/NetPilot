import { NextRequest } from 'next/server';
import { createMikroTikClientFromNAS } from '@/lib/mikrotik';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

// GET - Fetch NAT logs from MikroTik device
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
    const topics = searchParams.get('topics')?.split(',') || ['firewall'];
    const where = searchParams.get('where') || '';
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
      
      if (where) {
        logOptions.where = `(${where}) && (${dateFilter})`;
      } else {
        logOptions.where = dateFilter;
      }
    } else if (where) {
      logOptions.where = where;
    }

    // Fetch NAT logs
    const result = await mikrotikClient.getNATLogs(logOptions);

    if (result.success) {
      // Process and format logs
      const processedLogs = result.data?.map((log: any) => ({
        id: log['.id'] || `${Date.now()}-${Math.random()}`,
        timestamp: log.time || new Date().toISOString(),
        topics: Array.isArray(log.topics) ? log.topics : [log.topics].filter(Boolean),
        message: log.message || '',
        // Parse NAT-specific information from message
        ...parseNATLogMessage(log.message || ''),
        raw: log
      })) || [];

      return createSuccessResponse({
        logs: processedLogs,
        total: processedLogs.length,
        deviceId: deviceId || 'default',
        query: logOptions
      }, 'NAT logs retrieved successfully');
    } else {
      return createErrorResponse(result.message, 500, { error: result.error });
    }

  } catch (error: any) {
    console.error('NAT logs fetch error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Helper function to parse NAT log messages
function parseNATLogMessage(message: string) {
  const parsed: any = {
    sourceIP: null,
    destinationIP: null,
    sourcePort: null,
    destinationPort: null,
    protocol: null,
    action: null
  };

  try {
    // Common patterns in MikroTik firewall logs
    const patterns = {
      sourceIP: /src-address=([0-9.]+)/,
      destinationIP: /dst-address=([0-9.]+)/,
      sourcePort: /src-port=(\d+)/,
      destinationPort: /dst-port=(\d+)/,
      protocol: /protocol=(\w+)/,
      action: /(accept|drop|reject|srcnat|dstnat)/i
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = message.match(pattern);
      if (match) {
        parsed[key] = match[1];
      }
    });

    // Additional parsing for NAT-specific information
    if (message.includes('srcnat') || message.includes('SRCNAT')) {
      parsed.natType = 'source';
    } else if (message.includes('dstnat') || message.includes('DSTNAT')) {
      parsed.natType = 'destination';
    }

    // Parse interface information
    const inInterfaceMatch = message.match(/in-interface=([^\s,]+)/);
    if (inInterfaceMatch) {
      parsed.inInterface = inInterfaceMatch[1];
    }

    const outInterfaceMatch = message.match(/out-interface=([^\s,]+)/);
    if (outInterfaceMatch) {
      parsed.outInterface = outInterfaceMatch[1];
    }

  } catch (error) {
    console.warn('Error parsing NAT log message:', error);
  }

  return parsed;
}
