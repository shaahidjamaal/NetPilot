# NetPilot MikroTik AAA Integration

This document provides comprehensive guidance for implementing MikroTik Authentication, Authorization, and Accounting (AAA) functionality in the NetPilot ISP management system.

## 🏗️ Architecture Overview

The MikroTik AAA integration consists of several layers:

1. **MikroTik API Client** (`src/lib/mikrotik.ts`) - Low-level RouterOS API communication
2. **AAA Service Layer** (`src/lib/aaa-service.ts`) - Business logic for user/profile management
3. **API Routes** (`src/app/api/mikrotik/*`) - RESTful endpoints for frontend integration
4. **Frontend Components** - UI for managing MikroTik resources

## 🔧 Setup and Configuration

### 1. Environment Variables

Add these variables to your `.env.local` file:

```env
# MikroTik Configuration
MIKROTIK_HOST=192.168.1.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=your-mikrotik-password
MIKROTIK_PORT=8728
```

### 2. MikroTik Router Configuration

#### Enable API Service
```bash
/ip service enable api
/ip service set api port=8728
```

#### Create API User (Recommended)
```bash
/user group add name=api-users policy=api,read,write,policy,test
/user add name=netpilot-api group=api-users password=secure-password
```

#### Configure User Profiles
The system will automatically create profiles based on your NetPilot packages, but you can pre-create them:

```bash
# PPPoE Profile Example
/ppp profile add name="10Mbps_pppoe" rate-limit="10240k/10240k" session-timeout=0

# Hotspot Profile Example
/ip hotspot user profile add name="10Mbps_hotspot" rate-limit="10240k/10240k" session-timeout=0
```

## 🚀 Features

### 1. User Management

#### PPPoE Users
- Create/update/delete PPPoE users
- Automatic profile assignment based on packages
- Password generation and management
- Enable/disable user accounts

#### Hotspot Users
- Create/update/delete Hotspot users
- MAC address binding support
- IP address assignment
- Profile-based bandwidth control

### 2. Profile Management

#### Bandwidth Profiles
- Automatic creation from NetPilot packages
- Support for burst speeds and thresholds
- Session timeout configuration
- Shared user limits

#### Profile Features
- Upload/Download speed limits
- Burst speed configuration
- Session and idle timeouts
- Address pool assignment

### 3. Session Management

#### Active Session Monitoring
- Real-time session viewing
- User connection details
- Session duration tracking
- Bandwidth usage monitoring

#### Session Control
- Force disconnect users
- Monitor connection status
- Track user activity

### 4. Synchronization

#### Single Customer Sync
- Sync individual customers to MikroTik
- Create user accounts and profiles
- Update existing configurations

#### Bulk Synchronization
- Sync multiple customers at once
- Batch profile creation
- Error handling and reporting

## 📡 API Endpoints

### Authentication Required
All endpoints require JWT authentication with appropriate permissions.

### Available Endpoints

#### Connection Testing
```http
GET /api/mikrotik/test
```
Tests connection to MikroTik router and returns system information.

#### User Management
```http
GET /api/mikrotik/users?type=pppoe|hotspot
DELETE /api/mikrotik/users
```

#### Session Management
```http
GET /api/mikrotik/sessions?type=pppoe|hotspot
DELETE /api/mikrotik/sessions
```

#### Profile Management
```http
GET /api/mikrotik/profiles?type=pppoe|hotspot
POST /api/mikrotik/profiles
```

#### Synchronization
```http
POST /api/mikrotik/sync    # Single customer sync
PUT /api/mikrotik/sync     # Bulk customer sync
```

## 🎯 Usage Examples

### 1. Single Customer Sync

```javascript
const syncCustomer = async (customer, package, serviceType) => {
  const response = await fetch('/api/mikrotik/sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer,
      package,
      serviceType: 'pppoe' // or 'hotspot'
    }),
  });
  
  const result = await response.json();
  return result;
};
```

### 2. Bulk Customer Sync

```javascript
const syncAllCustomers = async (customers, packages, serviceType) => {
  const response = await fetch('/api/mikrotik/sync', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customers,
      packages,
      serviceType: 'pppoe'
    }),
  });
  
  const result = await response.json();
  return result;
};
```

### 3. Monitor Active Sessions

```javascript
const getActiveSessions = async (serviceType = 'pppoe') => {
  const response = await fetch(`/api/mikrotik/sessions?type=${serviceType}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const sessions = await response.json();
  return sessions;
};
```

## 🔐 Security and Permissions

### User Role Requirements

- **Admin Staff**: Full access to all MikroTik AAA functions
- **Office Staff**: Limited access to session monitoring and disconnection

### API Security

- All endpoints require JWT authentication
- Role-based access control implemented
- Secure credential storage in environment variables

## 🛠️ Frontend Integration

### MikroTik Management Page

Access the MikroTik AAA management interface at `/mikrotik`:

- Connection status monitoring
- Active session management
- User account overview
- Real-time synchronization

### Customer Integration

The `MikroTikSync` component can be integrated into customer management pages:

```jsx
import { MikroTikSync } from '@/components/mikrotik-sync';

// Single customer sync
<MikroTikSync 
  customer={customer} 
  packages={packages} 
  onSyncComplete={() => refreshData()} 
/>

// Bulk customer sync
<MikroTikSync 
  customers={selectedCustomers} 
  packages={packages} 
  onSyncComplete={() => refreshData()} 
/>
```

## 📊 Bandwidth Profile Conversion

NetPilot packages are automatically converted to MikroTik rate-limit format:

### Basic Rate Limit
```
Package: 10 Mbps Down / 5 Mbps Up
MikroTik: "5120k/10240k"
```

### With Burst
```
Package: 10/5 Mbps with 20/10 Mbps burst
MikroTik: "5120k/10240k 10240k/20480k 5120k/10240k 8/8 8"
```

## 🔄 Synchronization Workflow

### Customer Creation/Update Process

1. **Profile Creation**: System creates/updates bandwidth profile based on package
2. **User Account**: Creates/updates user account with appropriate credentials
3. **Status Sync**: Syncs customer status (Active/Inactive) to user enabled/disabled
4. **Error Handling**: Reports any failures with detailed error messages

### Automatic Triggers

The system can be configured to automatically sync customers when:
- New customer is created
- Customer package is changed
- Customer status is updated
- Bulk operations are performed

## 🚨 Troubleshooting

### Common Issues

#### Connection Failures
- Verify MikroTik API service is enabled
- Check firewall rules on MikroTik router
- Confirm credentials and network connectivity

#### User Creation Errors
- Ensure profiles exist before creating users
- Check for duplicate usernames
- Verify package configuration

#### Permission Errors
- Confirm API user has sufficient permissions
- Check NetPilot user role assignments

### Debug Mode

Enable detailed logging by checking browser console and server logs for:
- API request/response details
- MikroTik command execution
- Error stack traces

## 📈 Performance Considerations

### Bulk Operations
- Process customers in batches for large datasets
- Implement retry logic for failed operations
- Monitor MikroTik router performance during sync

### Connection Management
- Connections are automatically opened/closed for each operation
- Connection pooling not implemented (RouterOS API limitation)
- Consider rate limiting for high-frequency operations

## 🔮 Future Enhancements

### Planned Features
- Real-time bandwidth monitoring
- Automated billing integration
- Advanced reporting and analytics
- Multi-router support
- Backup and restore functionality

### Integration Opportunities
- RADIUS server integration
- Network monitoring tools
- Customer portal self-service
- Mobile app support

This integration transforms NetPilot into a comprehensive ISP management platform with full MikroTik router control and automation capabilities.
