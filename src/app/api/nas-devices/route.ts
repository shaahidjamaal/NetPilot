import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import NasDevice from '@/lib/models/NasDevice';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

// GET - List all NAS devices
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const nasType = searchParams.get('nasType') || '';
    const isActive = searchParams.get('isActive');

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { shortName: { $regex: search, $options: 'i' } },
        { nasIpAddress: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (nasType) {
      query.nasType = nasType;
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [devices, total] = await Promise.all([
      NasDevice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NasDevice.countDocuments(query)
    ]);

    return createSuccessResponse({
      devices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'NAS devices retrieved successfully');

  } catch (error: any) {
    console.error('Get NAS devices error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST - Create new NAS device
export async function POST(request: NextRequest) {
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

    // Check if user has admin permissions
    if (tokenUser.userType !== 'Admin Staff') {
      return createErrorResponse('Insufficient permissions. Admin access required.', 403);
    }

    const body = await request.json();
    const { 
      nasIpAddress, 
      shortName, 
      nasType, 
      description,
      mikrotikConfig,
      isActive = true 
    } = body;

    // Validation
    const errors: string[] = [];

    if (!nasIpAddress) {
      errors.push('NAS IP Address is required');
    }

    if (!shortName) {
      errors.push('Short Name is required');
    }

    if (!nasType) {
      errors.push('NAS Type is required');
    }

    // Validate MikroTik config if nasType is MikroTik RouterOS
    if (nasType === 'MikroTik RouterOS') {
      if (!mikrotikConfig) {
        errors.push('MikroTik configuration is required for MikroTik RouterOS devices');
      } else {
        if (!mikrotikConfig.username) {
          errors.push('MikroTik username is required');
        }
        if (!mikrotikConfig.password) {
          errors.push('MikroTik password is required');
        }
      }
    }

    if (errors.length > 0) {
      return createErrorResponse(errors, 400);
    }

    // Check if device with same IP or short name already exists
    const existingDevice = await NasDevice.findOne({
      $or: [
        { nasIpAddress },
        { shortName }
      ]
    });

    if (existingDevice) {
      if (existingDevice.nasIpAddress === nasIpAddress) {
        return createErrorResponse('A device with this IP address already exists', 409);
      }
      if (existingDevice.shortName === shortName) {
        return createErrorResponse('A device with this short name already exists', 409);
      }
    }

    // Create new NAS device
    const newDevice = new NasDevice({
      nasIpAddress,
      shortName,
      nasType,
      description,
      mikrotikConfig: nasType === 'MikroTik RouterOS' ? mikrotikConfig : undefined,
      isActive,
      createdBy: tokenUser.userId
    });

    await newDevice.save();

    return createSuccessResponse(newDevice, 'NAS device created successfully');

  } catch (error: any) {
    console.error('Create NAS device error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return createErrorResponse(validationErrors, 400);
    }

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return createErrorResponse(`${field} already exists`, 409);
    }

    return createErrorResponse('Internal server error', 500);
  }
}
