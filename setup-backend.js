#!/usr/bin/env node

// Setup script to configure NetPilot frontend for NestJS backend
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupBackend() {
  console.log('🚀 NetPilot Frontend - Backend Configuration Setup');
  console.log('=' .repeat(50));
  
  try {
    // Ask for backend configuration
    const useExternal = await question('Do you want to use an external NestJS backend? (y/n): ');
    
    let envContent = '';
    
    if (useExternal.toLowerCase() === 'y' || useExternal.toLowerCase() === 'yes') {
      const backendUrl = await question('Enter your NestJS backend URL (e.g., http://localhost:3001/api): ');
      
      envContent = `# Backend Configuration
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true
NEXT_PUBLIC_API_URL=${backendUrl}

# Mikrotik Configuration (optional)
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your-mikrotik-password
`;
    } else {
      envContent = `# Backend Configuration
NEXT_PUBLIC_USE_EXTERNAL_BACKEND=false

# MongoDB Configuration (for local Next.js API)
MONGODB_URI=mongodb://localhost:27017/netpilot

# JWT Configuration (for local Next.js API)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Mikrotik Configuration (optional)
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your-mikrotik-password
`;
    }
    
    // Write .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Configuration saved to .env.local');
    
    if (useExternal.toLowerCase() === 'y' || useExternal.toLowerCase() === 'yes') {
      console.log('\n📋 Next steps:');
      console.log('1. Make sure your NestJS backend is running');
      console.log('2. Test the connection: node test-nestjs-api.js');
      console.log('3. Start the frontend: npm run dev');
      console.log('4. Check NESTJS_INTEGRATION.md for detailed setup guide');
    } else {
      console.log('\n📋 Next steps:');
      console.log('1. Set up MongoDB connection');
      console.log('2. Update JWT_SECRET in .env.local');
      console.log('3. Test the local API: node test-api.js');
      console.log('4. Start the frontend: npm run dev');
    }
    
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

setupBackend();
