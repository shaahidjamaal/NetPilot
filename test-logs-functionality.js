// Test script for logs functionality
// Run with: node test-logs-functionality.js

async function testLogsAPI() {
  console.log('🔍 Testing NetPilot Logs Functionality');
  console.log('=' .repeat(50));
  
  const baseUrl = 'http://localhost:3000'; // Frontend URL
  const token = 'your-jwt-token-here'; // Replace with actual token
  
  // Test endpoints
  const endpoints = [
    {
      name: 'NAT Logs',
      url: '/api/logs/nat',
      params: {
        count: '50',
        sourceIP: '192.168.1.100'
      }
    },
    {
      name: 'Access Request Logs',
      url: '/api/logs/access-request',
      params: {
        count: '50',
        username: 'testuser'
      }
    },
    {
      name: 'MikroTik NAT Logs (Direct)',
      url: '/api/mikrotik/logs/nat',
      params: {
        count: '25'
      }
    },
    {
      name: 'MikroTik Access Logs (Direct)',
      url: '/api/mikrotik/logs/access-request',
      params: {
        count: '25'
      }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing ${endpoint.name}...`);
    
    try {
      const params = new URLSearchParams(endpoint.params);
      const url = `${baseUrl}${endpoint.url}?${params.toString()}`;
      
      console.log(`   URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success: ${data.message}`);
        console.log(`   📊 Logs count: ${data.logs?.length || 0}`);
        
        if (data.logs && data.logs.length > 0) {
          const firstLog = data.logs[0];
          console.log(`   📝 Sample log: ${firstLog.message?.substring(0, 100)}...`);
        }
      } else if (response.status === 503) {
        console.log(`   ⚠️  External backend mode - endpoint redirected`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`   ❌ Error: ${errorData.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`   💥 Network error: ${error.message}`);
    }
  }
}

async function testNASDevicesAPI() {
  console.log('\n🔍 Testing NAS Devices API');
  console.log('=' .repeat(30));
  
  const baseUrl = 'http://localhost:3000';
  const token = 'your-jwt-token-here';
  
  try {
    const response = await fetch(`${baseUrl}/api/nas-devices`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ NAS Devices found: ${data.devices?.length || 0}`);
      
      const mikrotikDevices = data.devices?.filter(d => d.nasType === 'MikroTik RouterOS') || [];
      console.log(`🔧 MikroTik devices: ${mikrotikDevices.length}`);
      
      mikrotikDevices.forEach(device => {
        console.log(`   - ${device.shortName} (${device.nasIpAddress}) - ${device.isActive ? 'Active' : 'Inactive'}`);
      });
      
    } else if (response.status === 503) {
      console.log(`⚠️  External backend mode - using NestJS backend`);
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Error: ${errorData.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log(`💥 Network error: ${error.message}`);
  }
}

async function testFrontendPages() {
  console.log('\n🔍 Testing Frontend Pages');
  console.log('=' .repeat(30));
  
  const baseUrl = 'http://localhost:3000';
  const pages = [
    '/nat-logs',
    '/access-request-log'
  ];
  
  for (const page of pages) {
    console.log(`\n📄 Testing page: ${page}`);
    
    try {
      const response = await fetch(`${baseUrl}${page}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Check for key components
        if (html.includes('NAT Logs Management') || html.includes('Access Request Logs')) {
          console.log(`   ✅ Page loaded successfully`);
        } else {
          console.log(`   ⚠️  Page loaded but content may be missing`);
        }
        
        // Check for React components
        if (html.includes('_next/static')) {
          console.log(`   ✅ React components detected`);
        }
        
      } else {
        console.log(`   ❌ Page failed to load`);
      }
      
    } catch (error) {
      console.log(`   💥 Network error: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 NetPilot Logs Functionality Test Suite');
  console.log('🕐 ' + new Date().toLocaleString());
  console.log('=' .repeat(60));
  
  console.log('\n📋 Test Instructions:');
  console.log('1. Make sure your frontend is running on http://localhost:3000');
  console.log('2. Make sure your backend is running and accessible');
  console.log('3. Replace "your-jwt-token-here" with a valid JWT token');
  console.log('4. Ensure you have MikroTik devices configured in NAS Devices');
  
  await testFrontendPages();
  await testNASDevicesAPI();
  await testLogsAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Test Summary:');
  console.log('');
  console.log('✅ Frontend pages should load the new log management components');
  console.log('✅ NAS Devices API should return configured MikroTik devices');
  console.log('✅ Log APIs should fetch data from MikroTik devices');
  console.log('');
  console.log('🔧 If tests fail:');
  console.log('1. Check that your services are running');
  console.log('2. Verify MikroTik device configuration');
  console.log('3. Ensure proper authentication tokens');
  console.log('4. Check network connectivity to MikroTik devices');
  console.log('');
  console.log('📖 See LOGS_MANAGEMENT_IMPLEMENTATION.md for detailed usage guide');
}

// Run tests
runAllTests().catch(console.error);
