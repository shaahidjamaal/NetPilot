import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import NasDevice from '@/lib/models/NasDevice';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

// Test connection to a specific NAS device
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if using external backend
    const useExternalBackend = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';
    
    if (useExternalBackend) {
      return createErrorResponse('This endpoint is not available when using external backend. Please use your NestJS backend instead.', 503);
    }

    await connectDB();

    // Check authentication
    const tokenUser = getUserFromRequest(request);
    if (!tokenUser) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Find the NAS device
    const device = await NasDevice.findById(params.id);
    if (!device) {
      return createErrorResponse('NAS device not found', 404);
    }

    let connectionResult = {
      success: false,
      message: 'Connection test not implemented for this device type',
      systemInfo: null
    };

    // Test connection based on device type
    if (device.nasType === 'MikroTik RouterOS') {
      connectionResult = await testMikroTikConnection(device);
    } else {
      // For other device types, we can implement basic ping or other tests
      connectionResult = await testBasicConnection(device);
    }

    // Update device connection status
    await NasDevice.findByIdAndUpdate(params.id, {
      lastConnectionTest: new Date(),
      connectionStatus: connectionResult.success ? 'connected' : 'error',
      connectionMessage: connectionResult.message
    });

    return createSuccessResponse({
      deviceId: device._id,
      deviceName: device.shortName,
      connectionResult
    }, connectionResult.success ? 'Connection test successful' : 'Connection test failed');

  } catch (error: any) {
    console.error('Test connection error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Test MikroTik RouterOS connection
async function testMikroTikConnection(device: any) {
  try {
    if (!device.mikrotikConfig) {
      return {
        success: false,
        message: 'MikroTik configuration is missing',
        systemInfo: null
      };
    }

    // Import RouterOS API client
    const RouterOS = require('node-routeros');
    
    const conn = new RouterOS({
      host: device.nasIpAddress,
      user: device.mikrotikConfig.username,
      password: device.mikrotikConfig.password,
      port: device.mikrotikConfig.apiPort || 8728,
      timeout: device.mikrotikConfig.connectionTimeout || 10000
    });

    // Test connection
    await conn.connect();
    
    // Get system information
    const systemInfo = await conn.write('/system/resource/print');
    
    conn.close();

    return {
      success: true,
      message: 'Successfully connected to MikroTik RouterOS device',
      systemInfo: systemInfo && systemInfo.length > 0 ? systemInfo[0] : null
    };

  } catch (error: any) {
    return {
      success: false,
      message: `MikroTik connection failed: ${error.message}`,
      systemInfo: null
    };
  }
}

// Test basic connection (ping or basic connectivity)
async function testBasicConnection(device: any) {
  try {
    // For non-MikroTik devices, we can implement a basic ping test
    // This is a simplified implementation - in production you might want to use actual ping
    
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const ping = spawn('ping', ['-n', '1', device.nasIpAddress]);
      
      let output = '';
      ping.stdout.on('data', (data: any) => {
        output += data.toString();
      });
      
      ping.stderr.on('data', (data: any) => {
        output += data.toString();
      });
      
      ping.on('close', (code: number) => {
        if (code === 0) {
          resolve({
            success: true,
            message: 'Device is reachable via ping',
            systemInfo: { pingResult: 'success' }
          });
        } else {
          resolve({
            success: false,
            message: 'Device is not reachable via ping',
            systemInfo: { pingResult: 'failed', output }
          });
        }
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        ping.kill();
        resolve({
          success: false,
          message: 'Connection test timed out',
          systemInfo: null
        });
      }, 10000);
    });

  } catch (error: any) {
    return {
      success: false,
      message: `Connection test failed: ${error.message}`,
      systemInfo: null
    };
  }
}
