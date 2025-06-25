// Test script for NestJS backend API
// Run with: node test-nestjs-api.js

// Update this URL to match your NestJS backend
const baseUrl = 'http://localhost:3001/api';

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

async function testValidationErrors() {
  console.log('\nTesting validation errors...');
  
  // Test invalid email
  const invalidEmailResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'invalid-email',
      username: 'testuser',
      password: 'Test123!@#'
    }),
  });
  
  const invalidEmailData = await invalidEmailResponse.json();
  console.log('Invalid Email Response:', invalidEmailResponse.status, invalidEmailData);
  
  // Test weak password
  const weakPasswordResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'weak'
    }),
  });
  
  const weakPasswordData = await weakPasswordResponse.json();
  console.log('Weak Password Response:', weakPasswordResponse.status, weakPasswordData);
  
  // Test invalid credentials
  const invalidCredsResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      usernameOrEmail: 'john.doe@example.com',
      password: 'wrongpassword'
    }),
  });
  
  const invalidCredsData = await invalidCredsResponse.json();
  console.log('Invalid Credentials Response:', invalidCredsResponse.status, invalidCredsData);
}

async function testProtectedRouteWithoutToken() {
  console.log('\nTesting protected route without token...');
  
  const response = await fetch(`${baseUrl}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  console.log('No Token Response:', response.status, data);
}

async function runTests() {
  try {
    console.log(`Testing NestJS Backend API at: ${baseUrl}`);
    console.log('='.repeat(50));
    
    // Test validation errors first
    await testValidationErrors();
    
    // Test protected route without token
    await testProtectedRouteWithoutToken();
    
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
    
    console.log('\n' + '='.repeat(50));
    console.log('Testing completed!');
    
  } catch (error) {
    console.error('Test error:', error.message);
    console.log('\nMake sure your NestJS backend is running on the correct port!');
  }
}

runTests();
