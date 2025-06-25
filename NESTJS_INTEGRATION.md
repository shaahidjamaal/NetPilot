# NetPilot Frontend - NestJS Backend Integration

This guide explains how to connect the NetPilot frontend to your existing NestJS backend with MongoDB.

## Quick Setup

### 1. Configure Environment Variables

Create a `.env.local` file in your NetPilot frontend root directory:

```env
# Backend Configuration
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Mikrotik Configuration (if needed)
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your-mikrotik-password
```

**Important**: Replace `http://localhost:3001/api` with your actual NestJS backend URL.

### 2. Verify Your NestJS Backend Endpoints

Make sure your NestJS backend has these endpoints implemented:

#### Authentication Endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - User logout (protected)

#### User Endpoints:
- `GET /api/users/me` - Get current user (protected)

### 3. Expected Request/Response Format

#### Register Request:
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "Office Staff",
  "designation": "Support Agent",
  "roleId": "role_2"
}
```

#### Register/Login Response:
```json
{
  "success": true,
  "access_token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "Office Staff",
    "designation": "Support Agent",
    "roleId": "role_2",
    "enabled": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Login Request:
```json
{
  "usernameOrEmail": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Profile Response:
```json
{
  "_id": "user_id",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "Office Staff",
  "designation": "Support Agent",
  "roleId": "role_2",
  "enabled": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### 4. Test the Connection

Test your backend integration by trying to login:

```bash
# Start the frontend
npm run dev

# Then go to http://localhost:3000/login and try logging in
```

### 5. Start the Frontend

```bash
npm run dev
```

The frontend will now connect to your NestJS backend instead of the local Next.js API routes.

## CORS Configuration

Make sure your NestJS backend allows CORS requests from your frontend domain. In your NestJS main.ts:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
    credentials: true,
  });
  
  await app.listen(3001);
}
bootstrap();
```

## Authentication Headers

The frontend automatically includes JWT tokens in requests:

```
Authorization: Bearer <jwt_token>
```

Make sure your NestJS backend validates these tokens for protected routes.

## Error Handling

Your NestJS backend should return errors in this format:

```json
{
  "success": false,
  "message": ["Error message 1", "Error message 2"],
  "statusCode": 400
}
```

Common status codes:
- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `404`: Not Found
- `409`: Conflict (duplicate email/username)
- `500`: Internal Server Error

## Switching Back to Local API

To switch back to the local Next.js API routes, update your `.env.local`:

```env
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=false
```

## Troubleshooting

### 1. Connection Refused
- Verify your NestJS backend is running
- Check the `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure the port matches your NestJS application

### 2. CORS Errors
- Configure CORS in your NestJS backend
- Add your frontend URL to the allowed origins

### 3. Authentication Errors
- Verify JWT token format and validation
- Check that protected routes require authentication
- Ensure token expiration is handled properly

### 4. Validation Errors
- Match the request/response format exactly
- Implement proper validation in your NestJS DTOs
- Return validation errors in the expected format

## Features Supported

✅ User Registration  
✅ User Login (username or email)  
✅ JWT Token Authentication  
✅ Protected Routes  
✅ User Profile Management  
✅ Automatic Token Refresh  
✅ Error Handling  
✅ Loading States  
✅ Form Validation  

## Next Steps

1. Test all authentication flows
2. Implement additional API endpoints as needed
3. Add user management features
4. Integrate with your existing MongoDB data
5. Deploy both frontend and backend

Your NetPilot frontend is now ready to work with your NestJS backend!
