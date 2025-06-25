// Simple test script to verify the authentication APIs
// Run with: node test-api.js

const baseUrl = 'http://localhost:3000/api';

async function testSeed() {
  console.log('Testing database seed...');

  const response = await fetch(`${baseUrl}/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('Seed Response:', response.status, data);
}

async function testRegister() {
  console.log('Testing user registration...');
  
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      userType: 'Office Staff',
      designation: 'Support Agent',
      roleId: 'role_2'
    }),
  });

  const data = await response.json();
  console.log('Register Response:', response.status, data);
  
  if (response.ok) {
    return data.access_token;
  }
  return null;
}

async function testLogin() {
  console.log('\nTesting user login...');
  
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usernameOrEmail: 'john.doe@example.com',
      password: 'SecurePass123!'
    }),
  });

  const data = await response.json();
  console.log('Login Response:', response.status, data);
  
  if (response.ok) {
    return data.access_token;
  }
  return null;
}

async function testProfile(token) {
  console.log('\nTesting get profile...');
  
  const response = await fetch(`${baseUrl}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('Profile Response:', response.status, data);
}

async function testUsersMe(token) {
  console.log('\nTesting get current user...');
  
  const response = await fetch(`${baseUrl}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('Users/Me Response:', response.status, data);
}

async function testLogout(token) {
  console.log('\nTesting logout...');
  
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('Logout Response:', response.status, data);
}

async function runTests() {
  try {
    // First, try to seed the database
    await testSeed();

    // Test registration
    let token = await testRegister();
    
    if (!token) {
      // If registration fails (user might already exist), try login
      token = await testLogin();
    }
    
    if (token) {
      // Test protected routes
      await testProfile(token);
      await testUsersMe(token);
      await testLogout(token);
    } else {
      console.log('Could not obtain access token');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

runTests();
