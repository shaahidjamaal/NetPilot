# NetPilot Authentication API Integration

This document describes the authentication API integration that has been implemented in the NetPilot ISP management system.

## Overview

The system has been migrated from localStorage-based authentication to a MongoDB-backed REST API with JWT tokens, following the provided Postman collection specifications.

## API Endpoints

### Authentication Endpoints

#### 1. Register User
- **URL**: `POST /api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
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
- **Response**: 
```json
{
  "success": true,
  "access_token": "jwt_token_here",
  "user": { /* user object without password */ }
}
```

#### 2. Login User
- **URL**: `POST /api/auth/login`
- **Description**: Authenticate user with username/email and password
- **Request Body**:
```json
{
  "usernameOrEmail": "john.doe@example.com",
  "password": "SecurePass123!"
}
```
- **Response**:
```json
{
  "success": true,
  "access_token": "jwt_token_here",
  "user": { /* user object without password */ }
}
```

#### 3. Get User Profile
- **URL**: `GET /api/auth/profile`
- **Description**: Get current user profile
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User object without password

#### 4. Logout User
- **URL**: `POST /api/auth/logout`
- **Description**: Logout current user
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Endpoints

#### 1. Get Current User
- **URL**: `GET /api/users/me`
- **Description**: Get current user information
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User object without password

## Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  username: String (required, unique),
  password: String (required, hashed),
  firstName: String (optional),
  lastName: String (optional),
  userType: String (enum: 'Admin Staff', 'Office Staff'),
  designation: String (required),
  roleId: String (required),
  enabled: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 12
2. **JWT Tokens**: Stateless authentication using JSON Web Tokens
3. **Input Validation**: Comprehensive validation for all inputs
4. **Password Requirements**: Strong password policy enforced
5. **Account Status**: Users can be enabled/disabled

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/netpilot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Mikrotik Configuration (existing)
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your-mikrotik-password
```

## Frontend Integration

### Updated Components

1. **Login Page** (`/login`): Now supports username or email login
2. **Register Page** (`/register`): New registration form with all required fields
3. **Auth Hook** (`useAuth`): Updated to use API calls instead of localStorage
4. **Protected Routes**: Automatically verify JWT tokens

### Token Management

- Tokens are stored in localStorage as `netpilot-token`
- Automatic token verification on app startup
- Automatic logout on token expiration
- Token included in all authenticated API calls

## Testing

Use the provided test script to verify API functionality:

```bash
# Make sure your development server is running
npm run dev

# In another terminal, run the test script
node test-api.js
```

## Migration Notes

### Breaking Changes

1. **Authentication Method**: Changed from localStorage user objects to JWT tokens
2. **User ID Format**: Now uses MongoDB ObjectId instead of custom IDs
3. **Password Storage**: Passwords are now hashed (previously stored in plain text)
4. **User Fields**: Added username, firstName, lastName fields

### Backward Compatibility

- Existing user types and roles are preserved
- UI components remain largely unchanged
- Same authentication flow from user perspective

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": ["Error message 1", "Error message 2"],
  "errors": { /* detailed validation errors */ }
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (registration)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `404`: Not Found
- `409`: Conflict (duplicate email/username)
- `500`: Internal Server Error

## Next Steps

1. Set up MongoDB database
2. Configure environment variables
3. Test API endpoints
4. Deploy to production
5. Update any existing user management workflows

## Postman Collection

The implementation follows the provided Postman collection exactly. You can import the collection and test all endpoints with the base URL set to your development server.
