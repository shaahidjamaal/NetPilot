// Test the login fix
// Run with: node test-login-fix.js

async function testLoginFix() {
  console.log('🔍 Testing Login Fix');
  console.log('=' .repeat(40));
  
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };
  
  console.log('🔐 Testing with credentials:');
  console.log(`   Email: ${credentials.usernameOrEmail}`);
  console.log(`   Password: ${credentials.password}`);
  
  try {
    // Test backend directly
    console.log('\n📡 Testing backend on port 3001...');
    const backendResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log(`Backend Status: ${backendResponse.status}`);
    
    if (backendResponse.ok) {
      const data = await backendResponse.json();
      console.log('✅ Backend login successful!');
      console.log(`🎫 Token received: ${data.access_token ? 'Yes' : 'No'}`);
      
      // Test frontend
      console.log('\n🖥️  Testing frontend on port 3000...');
      const frontendResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log(`Frontend Status: ${frontendResponse.status}`);
      
      if (frontendResponse.status === 503) {
        console.log('✅ Frontend correctly redirecting to external backend');
        console.log('\n🎉 LOGIN SHOULD NOW WORK!');
        console.log('\n📋 Next steps:');
        console.log('1. Open http://localhost:3000/login');
        console.log('2. Use credentials: admin@example.com / Admin123!');
        console.log('3. You should be redirected to the dashboard');
      } else {
        console.log('⚠️  Frontend not configured correctly');
      }
      
    } else {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.log(`❌ Backend login failed: ${errorData.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log(`💥 Test failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your NestJS backend is running on port 3001');
    console.log('2. Check that the backend has the admin user created');
    console.log('3. Verify the backend endpoints are working');
  }
}

testLoginFix().catch(console.error);
