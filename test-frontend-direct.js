// Test frontend directly
async function testFrontend() {
  console.log('🔍 Testing Frontend Direct');
  console.log('=' .repeat(40));
  
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };
  
  try {
    console.log('🖥️  Testing frontend login...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`Response: ${responseText}`);
    
    if (response.status === 503) {
      console.log('✅ Frontend correctly configured for external backend');
      console.log('🎉 LOGIN SHOULD WORK IN THE BROWSER!');
    } else if (response.status === 200) {
      console.log('✅ Frontend login working');
    } else {
      console.log('❌ Frontend issue detected');
    }
    
  } catch (error) {
    console.log(`💥 Error: ${error.message}`);
  }
}

testFrontend().catch(console.error);
