// Test local Next.js backend
async function testLocalBackend() {
  console.log('🔍 Testing Local Next.js Backend');
  console.log('=' .repeat(40));
  
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };
  
  try {
    // First, create the admin user via seed endpoint
    console.log('🌱 Creating admin user via seed endpoint...');
    const seedResponse = await fetch('http://localhost:3000/api/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Seed Status: ${seedResponse.status}`);
    
    if (seedResponse.ok) {
      console.log('✅ Admin user created successfully');
    } else {
      const seedError = await seedResponse.text();
      console.log(`⚠️  Seed response: ${seedError}`);
    }
    
    // Now test login
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log(`Login Status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const data = await loginResponse.json();
      console.log('🎉 LOGIN SUCCESSFUL!');
      console.log(`🎫 Token: ${data.token ? 'Received' : 'Missing'}`);
      console.log(`👤 User: ${data.user?.email || 'Unknown'}`);
      
      console.log('\n✅ SOLUTION WORKING!');
      console.log('📋 You can now login with:');
      console.log('   Email: admin@example.com');
      console.log('   Password: password');
      
    } else {
      const errorData = await loginResponse.text();
      console.log(`❌ Login failed: ${errorData}`);
    }
    
  } catch (error) {
    console.log(`💥 Test failed: ${error.message}`);
  }
}

testLocalBackend().catch(console.error);
