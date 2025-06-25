# Vercel Deployment Guide for NetPilot

This guide explains how to deploy your NetPilot frontend to Vercel when using an external NestJS backend.

## Quick Fix for Current Error

The deployment error occurs because the build process tries to build local API routes that require MongoDB, even though you're using an external NestJS backend.

### Solution Applied

I've modified the codebase to:

1. **Updated MongoDB connection** (`src/lib/mongodb.ts`):
   - Checks if using external backend
   - Provides dummy connection string during build when using external backend
   - Prevents actual MongoDB connection attempts when using external backend

2. **Updated all API routes** to return a 503 error when using external backend:
   - `/api/auth/login`
   - `/api/auth/register` 
   - `/api/auth/logout`
   - `/api/auth/profile`
   - `/api/users/me`
   - `/api/seed`

## Vercel Environment Variables Setup

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_API_URL=https://your-nestjs-backend-url.com/api
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your-mikrotik-password
MIKROTIK_PORT=8728
```

**Important**: Replace `https://your-nestjs-backend-url.com/api` with your actual NestJS backend URL.

### Option 2: Using Vercel CLI

```bash
vercel env add NEXT_PUBLIC_USE_EXTERNAL_BACKEND
# Enter: true

vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-nestjs-backend-url.com/api

vercel env add MIKROTIK_HOST
# Enter: 192.168.1.1

vercel env add MIKROTIK_USER
# Enter: admin

vercel env add MIKROTIK_PASSWORD
# Enter: your-mikrotik-password

vercel env add MIKROTIK_PORT
# Enter: 8728
```

## Deployment Steps

1. **Set Environment Variables** (as shown above)
2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Backend Requirements

Make sure your NestJS backend:

1. **Is deployed and accessible** from the internet
2. **Has CORS configured** to allow requests from your Vercel domain:
   ```typescript
   // In your NestJS main.ts
   app.enableCors({
     origin: [
       'http://localhost:3000',
       'https://your-vercel-app.vercel.app',
       // Add your custom domain if you have one
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   });
   ```

3. **Has the required endpoints**:
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `POST /api/auth/logout`
   - `GET /api/auth/profile`
   - `GET /api/users/me`

## Testing the Deployment

After deployment:

1. **Check the build logs** in Vercel dashboard
2. **Test the frontend** by visiting your Vercel URL
3. **Test authentication** by trying to log in
4. **Check browser console** for any CORS or API errors

## Troubleshooting

### Build Still Fails
If the build still fails, you can add a dummy `MONGODB_URI` to Vercel environment variables:
```
MONGODB_URI=mongodb://dummy:27017/dummy
```

### CORS Errors
- Ensure your NestJS backend allows requests from your Vercel domain
- Check that the `NEXT_PUBLIC_API_URL` is correct

### 503 Errors on API Routes
This is expected! The local API routes now return 503 when using external backend. Make sure your frontend is configured to use the external backend.

## Next Steps

1. Set the environment variables in Vercel
2. Redeploy your application
3. Update your NestJS backend CORS settings
4. Test the deployed application

The deployment should now work correctly!
