// Test which ports have your backend running
async function testPorts() {
  console.log('🔍 Testing Backend Ports');
  console.log('=' .repeat(40));
  
  const ports = [3000, 3001, 3002, 8000, 8080];
  const credentials = {
    usernameOrEmail: 'admin@example.com',
    password: 'Admin123!'
  };
  
  for (const port of ports) {
    console.log(`\n🔌 Testing port ${port}...`);
    
    try {
      const response = await fetch(`http://localhost:${port}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`   ✅ BACKEND FOUND ON PORT ${port}!`);
        console.log(`   🎫 Token received: ${data.access_token ? 'Yes' : 'No'}`);
        return port;
      } else if (response.status === 503) {
        console.log(`   ⚠️  Frontend API (returns 503 - external backend)`);
      } else {
        const data = await response.json().catch(() => ({}));
        console.log(`   ❌ Error: ${data.message || 'Unknown'}`);
      }
    } catch (error) {
      console.log(`   💥 Connection failed: ${error.message}`);
    }
  }
  
  return null;
}

async function main() {
  const backendPort = await testPorts();
  
  console.log('\n' + '='.repeat(40));
  
  if (backendPort) {
    console.log(`🎉 Your NestJS backend is running on port ${backendPort}`);
    console.log(`\n🔧 Update your .env.local:`);
    console.log(`NEXT_PUBLIC_API_URL=http://localhost:${backendPort}/api`);
  } else {
    console.log('❌ NestJS backend not found on common ports');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your NestJS backend is running');
    console.log('2. Check what port your NestJS backend is configured for');
    console.log('3. Start your NestJS backend if it\'s not running');
  }
}

main().catch(console.error);
