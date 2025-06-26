// Test script to check login functionality
// Run with: node test-login.js

const baseUrl = 'http://localhost:3001/api'; // Your NestJS backend URL

async function testLogin() {
  console.log('🔐 Testing NetPilot Login Functionality');
  console.log('=' .repeat(50));
  
  // Test credentials
  const credentials = [
    { usernameOrEmail: 'admin@example.com', password: 'password' },
    { usernameOrEmail: 'admin', password: 'password' },
    { usernameOrEmail: 'admin@example.com', password: 'Admin123!' },
    { usernameOrEmail: 'admin', password: 'Admin123!' }
  ];

  console.log(`🌐 Testing backend at: ${baseUrl}`);
  
  // First, test if the backend is reachable
  try {
    console.log('\n📡 Testing backend connectivity...');
    const healthResponse = await fetch(`${baseUrl}/health`).catch(() => null);
    if (!healthResponse) {
      console.log('❌ Backend not reachable. Trying auth endpoint directly...');
    } else {
      console.log('✅ Backend is reachable');
    }
  } catch (error) {
    console.log('⚠️  Health check failed, continuing with login test...');
  }

  // Test each credential combination
  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`\n🔑 Testing login ${i + 1}/${credentials.length}:`);
    console.log(`   Username/Email: ${cred.usernameOrEmail}`);
    console.log(`   Password: ${cred.password}`);
    
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ LOGIN SUCCESSFUL!');
        console.log(`   🎫 Token: ${data.access_token ? 'Received' : 'Missing'}`);
        console.log(`   👤 User: ${data.user?.email || data.user?.username || 'Unknown'}`);
        
        // Test the token by calling profile endpoint
        if (data.access_token) {
          console.log('\n🔍 Testing token with profile endpoint...');
          const profileResponse = await fetch(`${baseUrl}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('   ✅ Token is valid');
            console.log(`   👤 Profile: ${profileData.email || profileData.username}`);
          } else {
            console.log('   ❌ Token validation failed');
          }
        }
        
        return { success: true, credentials: cred, token: data.access_token };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.log(`   ❌ Login failed: ${errorData.message || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   💥 Network error: ${error.message}`);
    }
  }

  return { success: false };
}

async function testFrontendLogin() {
  console.log('\n🖥️  Testing Frontend Login (localhost:3000)...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernameOrEmail: 'admin@example.com',
        password: 'password'
      }),
    });

    console.log(`Frontend API Status: ${response.status}`);
    
    if (response.status === 503) {
      console.log('✅ Frontend correctly redirecting to external backend (503 expected)');
    } else {
      const data = await response.json().catch(() => ({}));
      console.log('Response:', data);
    }
  } catch (error) {
    console.log(`Frontend test error: ${error.message}`);
  }
}

async function runTests() {
  const result = await testLogin();
  await testFrontendLogin();
  
  console.log('\n' + '='.repeat(50));
  
  if (result.success) {
    console.log('🎉 LOGIN TEST SUCCESSFUL!');
    console.log('\n✅ Working credentials:');
    console.log(`   Username/Email: ${result.credentials.usernameOrEmail}`);
    console.log(`   Password: ${result.credentials.password}`);
    console.log('\n💡 You can now use these credentials in the frontend login form.');
  } else {
    console.log('❌ ALL LOGIN ATTEMPTS FAILED');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure your NestJS backend is running on http://localhost:3001');
    console.log('2. Check if you have created any users in your NestJS backend');
    console.log('3. Try creating a user through your NestJS backend registration endpoint');
    console.log('4. Check your NestJS backend logs for errors');
    console.log('\n📝 To create a test user, you might need to:');
    console.log('- Call POST /api/auth/register on your NestJS backend');
    console.log('- Or seed your database with default users');
  }
}

runTests().catch(console.error);
