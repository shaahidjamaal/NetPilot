import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import NasDevice from '@/lib/models/NasDevice';
import { getUserFromRequest, createSuccessResponse, createErrorResponse } from '@/lib/auth';

// GET - Get single NAS device
export async function GET(
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

    const device = await NasDevice.findById(params.id);
    if (!device) {
      return createErrorResponse('NAS device not found', 404);
    }

    return createSuccessResponse(device, 'NAS device retrieved successfully');

  } catch (error: any) {
    console.error('Get NAS device error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT - Update NAS device
export async function PUT(
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
      isActive 
    } = body;

    // Find existing device
    const device = await NasDevice.findById(params.id);
    if (!device) {
      return createErrorResponse('NAS device not found', 404);
    }

    // Validation
    const errors: string[] = [];

    if (nasIpAddress !== undefined && !nasIpAddress) {
      errors.push('NAS IP Address is required');
    }

    if (shortName !== undefined && !shortName) {
      errors.push('Short Name is required');
    }

    if (nasType !== undefined && !nasType) {
      errors.push('NAS Type is required');
    }

    // Validate MikroTik config if nasType is MikroTik RouterOS
    if (nasType === 'MikroTik RouterOS' || (nasType === undefined && device.nasType === 'MikroTik RouterOS')) {
      const config = mikrotikConfig || device.mikrotikConfig;
      if (!config) {
        errors.push('MikroTik configuration is required for MikroTik RouterOS devices');
      } else {
        if (!config.username) {
          errors.push('MikroTik username is required');
        }
        if (!config.password) {
          errors.push('MikroTik password is required');
        }
      }
    }

    if (errors.length > 0) {
      return createErrorResponse(errors, 400);
    }

    // Check for duplicates (excluding current device)
    if (nasIpAddress || shortName) {
      const duplicateQuery: any = {
        _id: { $ne: params.id }
      };
      
      const orConditions = [];
      if (nasIpAddress) orConditions.push({ nasIpAddress });
      if (shortName) orConditions.push({ shortName });
      
      if (orConditions.length > 0) {
        duplicateQuery.$or = orConditions;
        
        const existingDevice = await NasDevice.findOne(duplicateQuery);
        if (existingDevice) {
          if (existingDevice.nasIpAddress === nasIpAddress) {
            return createErrorResponse('A device with this IP address already exists', 409);
          }
          if (existingDevice.shortName === shortName) {
            return createErrorResponse('A device with this short name already exists', 409);
          }
        }
      }
    }

    // Update device
    const updateData: any = {};
    if (nasIpAddress !== undefined) updateData.nasIpAddress = nasIpAddress;
    if (shortName !== undefined) updateData.shortName = shortName;
    if (nasType !== undefined) updateData.nasType = nasType;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Handle MikroTik config
    if (nasType === 'MikroTik RouterOS' || (nasType === undefined && device.nasType === 'MikroTik RouterOS')) {
      if (mikrotikConfig !== undefined) {
        updateData.mikrotikConfig = mikrotikConfig;
      }
    } else if (nasType && nasType !== 'MikroTik RouterOS') {
      // Clear MikroTik config for non-MikroTik devices
      updateData.$unset = { mikrotikConfig: 1 };
    }

    const updatedDevice = await NasDevice.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return createSuccessResponse(updatedDevice, 'NAS device updated successfully');

  } catch (error: any) {
    console.error('Update NAS device error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return createErrorResponse(validationErrors, 400);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return createErrorResponse(`${field} already exists`, 409);
    }

    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE - Delete NAS device
export async function DELETE(
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

    // Check if user has admin permissions
    if (tokenUser.userType !== 'Admin Staff') {
      return createErrorResponse('Insufficient permissions. Admin access required.', 403);
    }

    const device = await NasDevice.findById(params.id);
    if (!device) {
      return createErrorResponse('NAS device not found', 404);
    }

    await NasDevice.findByIdAndDelete(params.id);

    return createSuccessResponse(null, 'NAS device deleted successfully');

  } catch (error: any) {
    console.error('Delete NAS device error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
