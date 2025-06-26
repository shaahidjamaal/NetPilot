// Comprehensive login issue diagnosis script
// Run with: node diagnose-login-issue.js

async function checkPortStatus() {
  console.log('🔍 STEP 1: Checking Port Status');
  console.log('=' .repeat(50));
  
  const ports = [3000, 3001, 3002, 8000, 8080];
  const results = {};
  
  for (const port of ports) {
    console.log(`\n🔌 Testing port ${port}...`);
    
    try {
      // Test if something is running on this port
      const response = await fetch(`http://localhost:${port}`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      console.log(`   ✅ Port ${port} is active (Status: ${response.status})`);
      results[port] = { active: true, status: response.status };
      
      // Try to identify what's running
      const text = await response.text().catch(() => '');
      if (text.includes('Next.js') || text.includes('NetPilot')) {
        console.log(`   📱 Detected: Next.js Frontend (NetPilot)`);
        results[port].type = 'frontend';
      } else if (text.includes('NestJS') || response.headers.get('x-powered-by')?.includes('Express')) {
        console.log(`   🔧 Detected: NestJS Backend`);
        results[port].type = 'backend';
      } else {
        console.log(`   ❓ Unknown service`);
        results[port].type = 'unknown';
      }
      
    } catch (error) {
      console.log(`   ❌ Port ${port} not accessible: ${error.message}`);
      results[port] = { active: false, error: error.message };
    }
  }
  
  return results;
}

async function testBackendAPI() {
  console.log('\n🔍 STEP 2: Testing Backend API Endpoints');
  console.log('=' .repeat(50));
  
  const backendPorts = [3000, 3001, 3002];
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };
  
  for (const port of backendPorts) {
    console.log(`\n🔗 Testing backend on port ${port}...`);
    
    try {
      // Test health/status endpoint
      console.log(`   📡 Testing health endpoint...`);
      const healthResponse = await fetch(`http://localhost:${port}/api/health`, {
        signal: AbortSignal.timeout(5000)
      }).catch(() => null);
      
      if (healthResponse) {
        console.log(`   ✅ Health endpoint accessible (${healthResponse.status})`);
      }
      
      // Test login endpoint
      console.log(`   🔐 Testing login endpoint...`);
      const loginResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(10000)
      });
      
      console.log(`   📊 Login Status: ${loginResponse.status} ${loginResponse.statusText}`);
      
      const responseText = await loginResponse.text();
      console.log(`   📄 Response: ${responseText.substring(0, 200)}...`);
      
      if (loginResponse.status === 200) {
        console.log(`   🎉 WORKING BACKEND FOUND ON PORT ${port}!`);
        
        try {
          const data = JSON.parse(responseText);
          if (data.access_token) {
            console.log(`   🎫 Token received successfully`);
            return { port, working: true, token: data.access_token };
          }
        } catch (e) {
          console.log(`   ⚠️  Response not valid JSON`);
        }
      } else if (loginResponse.status === 503) {
        console.log(`   ⚠️  This is the frontend (returns 503 for external backend)`);
      } else {
        console.log(`   ❌ Login failed: ${responseText}`);
      }
      
    } catch (error) {
      console.log(`   💥 Connection failed: ${error.message}`);
    }
  }
  
  return { working: false };
}

async function checkEnvironmentConfig() {
  console.log('\n🔍 STEP 3: Checking Environment Configuration');
  console.log('=' .repeat(50));
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('📄 Current .env.local configuration:');
      console.log('-' .repeat(30));
      console.log(envContent);
      console.log('-' .repeat(30));
      
      // Parse environment variables
      const envVars = {};
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });
      
      console.log('\n🔧 Configuration Analysis:');
      console.log(`   External Backend: ${envVars.NEXT_PUBLIC_USE_EXTERNAL_BACKEND || 'not set'}`);
      console.log(`   API URL: ${envVars.NEXT_PUBLIC_API_URL || 'not set'}`);
      
      return envVars;
    } else {
      console.log('❌ .env.local file not found');
      return {};
    }
  } catch (error) {
    console.log(`❌ Error reading environment: ${error.message}`);
    return {};
  }
}

async function testFrontendLogin() {
  console.log('\n🔍 STEP 4: Testing Frontend Login');
  console.log('=' .repeat(50));
  
  const frontendPorts = [3000, 3001];
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };
  
  for (const port of frontendPorts) {
    console.log(`\n🖥️  Testing frontend on port ${port}...`);
    
    try {
      const response = await fetch(`http://localhost:${port}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(10000)
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log(`   Response: ${responseText.substring(0, 200)}...`);
      
      if (response.status === 503) {
        console.log(`   ✅ Frontend correctly configured for external backend`);
      } else if (response.status === 200) {
        console.log(`   ✅ Frontend login working (local backend)`);
      } else {
        console.log(`   ❌ Frontend login failed`);
      }
      
    } catch (error) {
      console.log(`   💥 Frontend test failed: ${error.message}`);
    }
  }
}

async function provideSolution(portResults, backendResult, envConfig) {
  console.log('\n🚀 STEP 5: Solution and Recommendations');
  console.log('=' .repeat(50));
  
  if (backendResult.working) {
    console.log(`✅ SOLUTION FOUND: Working backend on port ${backendResult.port}`);
    console.log('\n📋 To fix your login issue:');
    console.log(`1. Update your .env.local file:`);
    console.log(`   NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true`);
    console.log(`   NEXT_PUBLIC_API_URL=http://localhost:${backendResult.port}/api`);
    console.log(`2. Restart your frontend`);
    console.log(`3. Use credentials: admin@example.com / Admin123!`);
  } else {
    console.log('❌ NO WORKING BACKEND FOUND');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Start your NestJS backend:');
    console.log('   cd path/to/your/nestjs-backend');
    console.log('   npm run start:dev');
    console.log('2. Or check if backend is running on a different port');
    console.log('3. Verify backend has the correct endpoints and user data');
  }
  
  console.log('\n📊 Port Status Summary:');
  Object.entries(portResults).forEach(([port, result]) => {
    if (result.active) {
      console.log(`   Port ${port}: ✅ Active (${result.type || 'unknown'})`);
    } else {
      console.log(`   Port ${port}: ❌ Inactive`);
    }
  });
}

async function main() {
  console.log('🔍 NetPilot Login Issue Diagnosis');
  console.log('🕐 ' + new Date().toLocaleString());
  console.log('=' .repeat(60));
  
  try {
    const portResults = await checkPortStatus();
    const backendResult = await testBackendAPI();
    const envConfig = await checkEnvironmentConfig();
    await testFrontendLogin();
    await provideSolution(portResults, backendResult, envConfig);
    
  } catch (error) {
    console.error('💥 Diagnosis failed:', error);
  }
}

main().catch(console.error);
