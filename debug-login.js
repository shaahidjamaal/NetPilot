// Debug script to test login with detailed error information
// Run with: node debug-login.js

async function testFrontendLogin() {
  console.log('🔍 Debugging Frontend Login');
  console.log('=' .repeat(50));
  
  const frontendUrl = 'http://localhost:3001'; // Frontend is running on 3001
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };

  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`🔑 Testing credentials: ${credentials.usernameOrEmail} / ${credentials.password}`);
  
  try {
    console.log('\n📡 Making login request to frontend...');
    
    const response = await fetch(`${frontendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📄 Raw Response: ${responseText}`);
    
    try {
      const data = JSON.parse(responseText);
      console.log(`📦 Parsed Response:`, data);
      
      if (response.ok) {
        console.log('✅ Login successful!');
        return data;
      } else {
        console.log(`❌ Login failed: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (parseError) {
      console.log(`❌ Failed to parse JSON response: ${parseError.message}`);
    }
    
  } catch (error) {
    console.log(`💥 Network/Fetch Error: ${error.message}`);
    console.log(`🔍 Error details:`, error);
  }
}

async function checkEnvironmentConfig() {
  console.log('\n🔧 Checking Environment Configuration');
  console.log('-' .repeat(30));
  
  // Check if we can read the frontend's environment
  try {
    const response = await fetch('http://localhost:3001/_next/static/chunks/webpack.js');
    console.log('Frontend is serving files correctly');
  } catch (error) {
    console.log('❌ Frontend might not be running properly');
  }
  
  // Test the API configuration endpoint
  try {
    console.log('\n🔍 Testing API configuration...');
    
    // Try to access a simple endpoint to see the configuration
    const testResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'OPTIONS',
    });
    
    console.log(`OPTIONS request status: ${testResponse.status}`);
    
  } catch (error) {
    console.log(`API configuration test failed: ${error.message}`);
  }
}

async function testDirectBackendConnection() {
  console.log('\n🔗 Testing Direct Backend Connection');
  console.log('-' .repeat(30));
  
  const backendUrl = 'http://localhost:3001/api'; // This might be wrong if both are on 3001
  
  try {
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernameOrEmail: 'admin@example.com',
        password: 'Admin123!'
      }),
    });
    
    console.log(`Direct backend test: ${response.status}`);
    const data = await response.json();
    console.log('Direct backend response:', data);
    
  } catch (error) {
    console.log(`Direct backend test failed: ${error.message}`);
  }
}

async function runDebugTests() {
  await testFrontendLogin();
  await checkEnvironmentConfig();
  await testDirectBackendConnection();
  
  console.log('\n' + '='.repeat(50));
  console.log('🔧 TROUBLESHOOTING RECOMMENDATIONS:');
  console.log('');
  console.log('1. PORT CONFLICT ISSUE:');
  console.log('   - Your frontend is running on port 3001');
  console.log('   - Your backend is configured for port 3001');
  console.log('   - This creates a conflict!');
  console.log('');
  console.log('2. SOLUTIONS:');
  console.log('   a) Change your NestJS backend to run on port 3000');
  console.log('   b) Or change frontend to run on port 3000');
  console.log('   c) Update NEXT_PUBLIC_API_URL in .env.local');
  console.log('');
  console.log('3. RECOMMENDED FIX:');
  console.log('   - Stop your current processes');
  console.log('   - Start NestJS backend on port 3000');
  console.log('   - Start frontend on port 3001');
  console.log('   - Update .env.local: NEXT_PUBLIC_API_URL=http://localhost:3000/api');
}

runDebugTests().catch(console.error);
