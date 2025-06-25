import { NextRequest } from 'next/server';
import { createAAAService } from '@/lib/aaa-service';
import { createSuccessResponse, createErrorResponse, getUserFromRequest } from '@/lib/auth';

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
    const { customer, package: pkg, serviceType = 'pppoe' } = body;

    if (!customer || !pkg) {
      return createErrorResponse('Customer and package data are required', 400);
    }

    // Validate service type
    if (!['pppoe', 'hotspot'].includes(serviceType)) {
      return createErrorResponse('Invalid service type. Must be "pppoe" or "hotspot"', 400);
    }

    const aaaService = createAAAService();
    const result = await aaaService.syncCustomer(customer, pkg, serviceType);

    if (result.success) {
      return createSuccessResponse({
        result,
        customer: customer.name,
        package: pkg.name,
        serviceType
      }, result.message);
    } else {
      return createErrorResponse(result.message, 400, { errors: result.errors });
    }

  } catch (error: any) {
    console.error('MikroTik sync error:', error);
    
    if (error.message.includes('MikroTik connection error')) {
      return createErrorResponse('MikroTik connection failed. Please check router configuration.', 503);
    }
    
    return createErrorResponse('Internal server error during MikroTik sync', 500);
  }
}

// Bulk sync endpoint
export async function PUT(request: NextRequest) {
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
    const { customers, packages, serviceType = 'pppoe' } = body;

    if (!customers || !Array.isArray(customers) || !packages || !Array.isArray(packages)) {
      return createErrorResponse('Customers and packages arrays are required', 400);
    }

    const aaaService = createAAAService();
    const results = [];
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const customer of customers) {
      // Find the package for this customer
      const pkg = packages.find(p => p.name === customer.servicePackage);
      if (!pkg) {
        results.push({
          customer: customer.name,
          success: false,
          message: `Package ${customer.servicePackage} not found`
        });
        totalErrors++;
        continue;
      }

      try {
        const result = await aaaService.syncCustomer(customer, pkg, serviceType);
        results.push({
          customer: customer.name,
          success: result.success,
          message: result.message
        });

        if (result.success) {
          if (result.created) totalCreated += result.created;
          if (result.updated) totalUpdated += result.updated;
        } else {
          totalErrors++;
        }
      } catch (error: any) {
        results.push({
          customer: customer.name,
          success: false,
          message: error.message
        });
        totalErrors++;
      }
    }

    return createSuccessResponse({
      summary: {
        total: customers.length,
        created: totalCreated,
        updated: totalUpdated,
        errors: totalErrors
      },
      results,
      serviceType
    }, `Bulk sync completed: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`);

  } catch (error: any) {
    console.error('MikroTik bulk sync error:', error);
    return createErrorResponse('Internal server error during bulk sync', 500);
  }
}
