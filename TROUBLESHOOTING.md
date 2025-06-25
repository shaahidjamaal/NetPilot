# NetPilot Frontend - Troubleshooting Guide

## "Signal is aborted without reason" Error

This error typically occurs when the request is being aborted due to timeout or network issues. Here's how to troubleshoot:

### 🔍 Quick Diagnosis

1. **Run the debug script**:
   ```bash
   node debug-login.js
   ```

2. **Check your environment**:
   ```bash
   # Verify your .env.local file
   cat .env.local
   ```

3. **Test the debug login page**:
   Navigate to `http://localhost:3000/login-debug` for detailed logging

### 🛠️ Common Solutions

#### 1. Backend Not Running
**Symptoms**: Connection refused, network errors
**Solution**: 
- Start your NestJS backend
- Verify it's running on the correct port
- Test with: `curl http://localhost:3001/api/auth/profile`

#### 2. Wrong Backend URL
**Symptoms**: 404 errors, connection refused
**Solution**: 
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure it matches your NestJS backend URL
- Common URLs:
  - `http://localhost:3001/api` (NestJS default)
  - `http://localhost:3000/api` (Next.js local)

#### 3. CORS Issues
**Symptoms**: CORS errors in browser console
**Solution**: Configure CORS in your NestJS backend:

```typescript
// main.ts in your NestJS backend
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      // Add your frontend URLs
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(3001);
}
bootstrap();
```

#### 4. Request Timeout
**Symptoms**: "Signal is aborted without reason"
**Solution**: 
- Increased timeout to 30 seconds (already done)
- Check if backend is responding slowly
- Use the debug login page for detailed timing

#### 5. Invalid Response Format
**Symptoms**: JSON parse errors, unexpected responses
**Solution**: Ensure your NestJS backend returns the correct format:

```json
{
  "access_token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "username": "username",
    // ... other user fields
  }
}
```

### 🔧 Step-by-Step Debugging

#### Step 1: Verify Backend Connection
```bash
# Test if backend is reachable
curl -X GET http://localhost:3001/api/auth/profile
# Expected: 401 Unauthorized (this is good - means backend is running)
```

#### Step 2: Test Login Endpoint
```bash
# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin@example.com","password":"password"}'
```

#### Step 3: Check Browser Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the request details:
   - Status code
   - Response headers
   - Response body
   - Timing information

#### Step 4: Use Debug Tools
1. **Debug Login Page**: Go to `/login-debug` for detailed logging
2. **Debug Script**: Run `node debug-login.js`
3. **Backend Status**: Add `<BackendStatus />` component to your page

### 🚨 Emergency Fallback

If you can't get the external backend working, switch to local mode:

```env
# .env.local
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=false
```

Then set up the local MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/netpilot
JWT_SECRET=your-secret-key
```

### 📋 Checklist

- [ ] NestJS backend is running
- [ ] Backend URL is correct in `.env.local`
- [ ] CORS is configured in NestJS backend
- [ ] Backend returns correct response format
- [ ] No firewall blocking the connection
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful requests

### 🔍 Advanced Debugging

#### Enable Detailed Logging
The API client now includes detailed console logging. Check your browser console for:
- Request URLs and options
- Response status and timing
- Error details

#### Test with Postman
Import the provided Postman collection and test your backend directly:
1. Set base URL to your NestJS backend
2. Test each endpoint
3. Verify response format

#### Check NestJS Logs
Look at your NestJS backend console for:
- Incoming requests
- Error messages
- CORS issues
- Database connection problems

### 📞 Still Having Issues?

If you're still experiencing problems:

1. **Share the debug output** from `node debug-login.js`
2. **Check browser console** for any error messages
3. **Verify NestJS backend logs** for incoming requests
4. **Test with curl** to isolate frontend vs backend issues
5. **Try the debug login page** at `/login-debug`

### 🎯 Quick Fixes

```bash
# 1. Restart everything
# Stop frontend and backend, then restart both

# 2. Clear browser cache and localStorage
# In browser console:
localStorage.clear()

# 3. Check if ports are correct
netstat -an | grep :3001  # Check if NestJS is running
netstat -an | grep :3000  # Check if Next.js is running

# 4. Test with simple curl
curl -v http://localhost:3001/api/auth/profile
```

The debug tools and improved error handling should help identify the exact issue!
