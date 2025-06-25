import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check if any users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return createErrorResponse('Database already seeded. Users exist.', 400);
    }

    // Create default admin user
    const adminUser = new User({
      email: 'admin@example.com',
      username: 'admin',
      password: 'password', // This will be hashed automatically
      firstName: 'System',
      lastName: 'Administrator',
      userType: 'Admin Staff',
      designation: 'Super Admin',
      roleId: 'role_1',
      enabled: true
    });

    await adminUser.save();

    // Create default office staff user
    const staffUser = new User({
      email: 'staff@example.com',
      username: 'staff',
      password: 'password', // This will be hashed automatically
      firstName: 'Office',
      lastName: 'Staff',
      userType: 'Office Staff',
      designation: 'Billing Clerk',
      roleId: 'role_2',
      enabled: true
    });

    await staffUser.save();

    // Create default support user (disabled)
    const supportUser = new User({
      email: 'support@example.com',
      username: 'support',
      password: 'password', // This will be hashed automatically
      firstName: 'Support',
      lastName: 'Agent',
      userType: 'Office Staff',
      designation: 'Support Agent',
      roleId: 'role_3',
      enabled: false
    });

    await supportUser.save();

    return createSuccessResponse({
      message: 'Database seeded successfully',
      users: [
        {
          email: adminUser.email,
          username: adminUser.username,
          userType: adminUser.userType,
          designation: adminUser.designation,
          enabled: adminUser.enabled
        },
        {
          email: staffUser.email,
          username: staffUser.username,
          userType: staffUser.userType,
          designation: staffUser.designation,
          enabled: staffUser.enabled
        },
        {
          email: supportUser.email,
          username: supportUser.username,
          userType: supportUser.userType,
          designation: supportUser.designation,
          enabled: supportUser.enabled
        }
      ]
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return createErrorResponse('Failed to seed database', 500);
  }
}
