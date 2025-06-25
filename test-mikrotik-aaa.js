// Test script for MikroTik AAA integration
// Run with: node test-mikrotik-aaa.js

const baseUrl = 'http://localhost:3001/api';

// Test data
const testCustomer = {
  id: 'test-customer-1',
  name: 'Test Customer',
  email: 'test@example.com',
  pppoeUsername: 'testuser',
  pppoePassword: 'TestPass123!',
  servicePackage: 'Basic 10Mbps',
  status: 'Active'
};

const testPackage = {
  name: 'Basic 10Mbps',
  description: 'Basic internet package',
  downloadSpeed: 10,
  uploadSpeed: 5,
  burstEnabled: true,
  burstDownloadSpeed: 20,
  burstUploadSpeed: 10,
  burstThresholdDownload: 8,
  burstThresholdUpload: 4,
  burstTime: 8,
  validity: 30
};

async function getAuthToken() {
  console.log('🔐 Getting authentication token...');
  
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usernameOrEmail: 'admin@example.com',
        password: 'Admin123!'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication successful');
      return data.access_token;
    } else {
      console.log('❌ Authentication failed');
      return null;
    }
  } catch (error) {
    console.log('💥 Authentication error:', error.message);
    return null;
  }
}

async function testMikroTikConnection(token) {
  console.log('\n🔌 Testing MikroTik connection...');
  
  try {
    const response = await fetch(`${baseUrl}/mikrotik/test`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ MikroTik connection successful');
      console.log('📊 Router info:', data.systemInfo?.[0]?.['board-name'] || 'Unknown');
      return true;
    } else {
      console.log('❌ MikroTik connection failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('💥 Connection test error:', error.message);
    return false;
  }
}

async function testCustomerSync(token, serviceType = 'pppoe') {
  console.log(`\n👤 Testing customer sync (${serviceType.toUpperCase()})...`);
  
  try {
    const response = await fetch(`${baseUrl}/mikrotik/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: testCustomer,
        package: testPackage,
        serviceType
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Customer sync successful');
      console.log('📝 Result:', data.result.message);
      return true;
    } else {
      console.log('❌ Customer sync failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('💥 Customer sync error:', error.message);
    return false;
  }
}

async function testGetUsers(token, serviceType = 'pppoe') {
  console.log(`\n👥 Testing get users (${serviceType.toUpperCase()})...`);
  
  try {
    const response = await fetch(`${baseUrl}/mikrotik/users?type=${serviceType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get users successful');
      console.log(`📊 Found ${data.count} users`);
      
      if (data.users.length > 0) {
        console.log('👤 Sample user:', data.users[0].name);
      }
      return true;
    } else {
      console.log('❌ Get users failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('💥 Get users error:', error.message);
    return false;
  }
}

async function testGetSessions(token, serviceType = 'pppoe') {
  console.log(`\n🔗 Testing get sessions (${serviceType.toUpperCase()})...`);
  
  try {
    const response = await fetch(`${baseUrl}/mikrotik/sessions?type=${serviceType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get sessions successful');
      console.log(`📊 Found ${data.count} active sessions`);
      
      if (data.sessions.length > 0) {
        console.log('🔗 Sample session:', data.sessions[0].name || data.sessions[0].user);
      }
      return true;
    } else {
      console.log('❌ Get sessions failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('💥 Get sessions error:', error.message);
    return false;
  }
}

async function testGetProfiles(token, serviceType = 'pppoe') {
  console.log(`\n📋 Testing get profiles (${serviceType.toUpperCase()})...`);
  
  try {
    const response = await fetch(`${baseUrl}/mikrotik/profiles?type=${serviceType}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Get profiles successful');
      console.log(`📊 Found ${data.count} profiles`);
      
      if (data.profiles.length > 0) {
        console.log('📋 Sample profile:', data.profiles[0].name);
      }
      return true;
    } else {
      console.log('❌ Get profiles failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('💥 Get profiles error:', error.message);
    return false;
  }
}

async function testBulkSync(token, serviceType = 'pppoe') {
  console.log(`\n🔄 Testing bulk sync (${serviceType.toUpperCase()})...`);
  
  const customers = [
    { ...testCustomer, id: 'bulk-1', name: 'Bulk Customer 1', pppoeUsername: 'bulk1' },
    { ...testCustomer, id: 'bulk-2', name: 'Bulk Customer 2', pppoeUsername: 'bulk2' }
  ];
  
  try {
    const response = await fetch(`${baseUrl}/mikrotik/sync`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customers,
        packages: [testPackage],
        serviceType
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Bulk sync successful');
      console.log('📊 Summary:', `${data.summary.created} created, ${data.summary.updated} updated, ${data.summary.errors} errors`);
      return true;
    } else {
      console.log('❌ Bulk sync failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('💥 Bulk sync error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 NetPilot MikroTik AAA Integration Test Suite');
  console.log('='.repeat(50));
  
  // Get authentication token
  const token = await getAuthToken();
  if (!token) {
    console.log('\n❌ Cannot proceed without authentication token');
    return;
  }

  // Test MikroTik connection
  const connectionOk = await testMikroTikConnection(token);
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed without MikroTik connection');
    console.log('\n💡 Make sure:');
    console.log('   1. MikroTik router is accessible');
    console.log('   2. API service is enabled');
    console.log('   3. Credentials are correct in .env.local');
    return;
  }

  // Test both PPPoE and Hotspot
  for (const serviceType of ['pppoe', 'hotspot']) {
    console.log(`\n🔧 Testing ${serviceType.toUpperCase()} functionality...`);
    
    await testCustomerSync(token, serviceType);
    await testGetUsers(token, serviceType);
    await testGetSessions(token, serviceType);
    await testGetProfiles(token, serviceType);
    await testBulkSync(token, serviceType);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Test suite completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Check the MikroTik management page at /mikrotik');
  console.log('   2. Try syncing real customers from the customer management page');
  console.log('   3. Monitor active sessions and user accounts');
}

runAllTests().catch(console.error);
