# NetPilot Logs Management Implementation

This document outlines the comprehensive implementation of NAT logs and Access Request logs functionality for the NetPilot ISP management system.

## 🎯 **Overview**

The logs management system provides real-time monitoring and analysis of network activity through MikroTik RouterOS devices, including:

- **NAT Logs**: Network Address Translation activity monitoring
- **Access Request Logs**: RADIUS/AAA authentication and authorization tracking
- **Real-time Fetching**: Live log streaming with auto-refresh capabilities
- **Advanced Filtering**: Multi-criteria filtering and search functionality
- **Export Capabilities**: CSV export for reporting and analysis

## 🏗️ **Architecture**

### **1. Backend Components**

#### **MikroTik API Extensions** (`src/lib/mikrotik.ts`)
- `getNATLogs()` - Fetch firewall/NAT logs with filtering
- `getRADIUSLogs()` - Fetch RADIUS/AAA authentication logs
- `getSystemLogs()` - General system log retrieval
- Advanced log parsing and filtering capabilities

#### **AAA Service Extensions** (`src/lib/aaa-service.ts`)
- `getNATLogs()` - High-level NAT log management
- `getAccessRequestLogs()` - Authentication log management
- Business logic for log filtering and processing

#### **API Endpoints**
- `/api/logs/nat` - NAT logs endpoint with NAS device integration
- `/api/logs/access-request` - Access request logs endpoint
- `/api/mikrotik/logs/nat` - Direct MikroTik NAT logs (legacy support)
- `/api/mikrotik/logs/access-request` - Direct MikroTik auth logs (legacy support)

### **2. Frontend Components**

#### **NAT Logs Management** (`src/components/nat-logs-management.tsx`)
- Real-time NAT activity monitoring
- Advanced filtering (IP, protocol, action, date range)
- Auto-refresh functionality
- CSV export capabilities

#### **Access Request Logs Management** (`src/components/access-request-logs-management.tsx`)
- RADIUS/AAA authentication monitoring
- User-specific filtering and search
- Authentication result tracking
- Session management insights

## 🔧 **Features Implemented**

### **NAT Logs Management**

#### **Data Fields**
- **Timestamp**: Log entry time
- **Source IP/Port**: Origin of network traffic
- **Destination IP/Port**: Target of network traffic
- **Protocol**: TCP, UDP, ICMP, etc.
- **Action**: Accept, Drop, Reject, SRCNAT, DSTNAT
- **NAT Type**: Source or Destination NAT
- **Interfaces**: In/Out interface information
- **Raw Message**: Complete log message

#### **Filtering Options**
- **Device Selection**: Choose specific MikroTik device
- **IP Address Filtering**: Source and destination IP filtering
- **Protocol Filtering**: TCP, UDP, ICMP protocol selection
- **Action Filtering**: Firewall action filtering
- **Date Range**: Start and end date/time filtering
- **Log Count**: Configurable result limit (10-1000)

#### **Real-time Features**
- **Auto-refresh**: 30-second automatic refresh
- **Manual Refresh**: On-demand log updates
- **Live Status**: Last refresh timestamp display
- **Loading States**: Visual feedback during operations

### **Access Request Logs Management**

#### **Data Fields**
- **Timestamp**: Authentication attempt time
- **Username**: User attempting authentication
- **Client IP**: Source IP of authentication request
- **NAS IP**: Network Access Server IP
- **Auth Result**: Accept, Reject, Logout
- **Service Type**: PPPoE, Hotspot
- **Session ID**: Unique session identifier
- **Reason**: Rejection reason (if applicable)
- **RADIUS Attributes**: Additional authentication data

#### **Filtering Options**
- **Device Selection**: MikroTik device selection
- **Username Search**: Specific user filtering
- **Client IP Filtering**: Source IP filtering
- **Auth Status**: Accept/Reject filtering
- **Date Range**: Time-based filtering
- **Log Count**: Result limit configuration

#### **Authentication Insights**
- **Success/Failure Tracking**: Visual status indicators
- **User Activity**: Per-user authentication history
- **Service Type Identification**: PPPoE vs Hotspot classification
- **Session Management**: Login/logout tracking

## 🔗 **Integration Points**

### **NAS Devices Integration**
- **Device Selection**: Automatic discovery of active MikroTik devices
- **Multi-device Support**: Switch between different routers
- **Configuration Integration**: Uses NAS device credentials
- **Connection Status**: Real-time device connectivity

### **MikroTik RouterOS Integration**
- **API Communication**: Direct RouterOS API integration
- **Log Topics**: Firewall, RADIUS, PPP, Hotspot log filtering
- **Real-time Streaming**: Live log fetching capabilities
- **Error Handling**: Robust connection error management

## 📊 **User Interface Features**

### **Design System Consistency**
- **NetPilot Theme**: Consistent with existing design system
- **Responsive Design**: Mobile-friendly interface
- **Component Reuse**: ShadCN UI components
- **Accessibility**: Proper ARIA labels and keyboard navigation

### **Data Visualization**
- **Status Badges**: Color-coded authentication results
- **Protocol Indicators**: Visual protocol identification
- **Action Classification**: Firewall action categorization
- **Service Type Badges**: PPPoE/Hotspot identification

### **Export and Reporting**
- **CSV Export**: Complete log data export
- **Filtered Exports**: Export current filtered results
- **Timestamp Formatting**: Localized date/time display
- **Data Sanitization**: Proper CSV escaping

## 🛡️ **Security and Performance**

### **Authentication and Authorization**
- **JWT Token Required**: All endpoints require authentication
- **Role-based Access**: Admin/staff access control
- **Secure Communication**: HTTPS for log transmission
- **Input Validation**: Comprehensive parameter validation

### **Performance Optimizations**
- **Log Limits**: Maximum 1000 logs per request
- **Efficient Filtering**: Server-side log filtering
- **Caching Strategy**: Client-side result caching
- **Pagination Ready**: Foundation for future pagination

### **Error Handling**
- **Connection Failures**: Graceful MikroTik connection errors
- **Timeout Management**: Request timeout handling
- **User Feedback**: Clear error messages and notifications
- **Fallback Mechanisms**: Alternative data sources

## 🚀 **Usage Guide**

### **Accessing Log Management**

1. **NAT Logs**: Navigate to "NAT Logs" in the sidebar
2. **Access Request Logs**: Navigate to "Access Request Log" in the sidebar

### **Basic Operations**

1. **Select Device**: Choose MikroTik device from dropdown
2. **Set Filters**: Configure filtering criteria
3. **Load Logs**: Click "Load Logs" to fetch data
4. **Auto-refresh**: Toggle automatic refresh for real-time monitoring
5. **Export Data**: Use "Export CSV" for reporting

### **Advanced Filtering**

#### **NAT Logs**
```
Device: main-router (192.168.1.1)
Count: 500
Source IP: 192.168.1.100
Protocol: TCP
Action: SRCNAT
Date Range: 2024-01-01 to 2024-01-31
```

#### **Access Request Logs**
```
Device: main-router (192.168.1.1)
Count: 200
Username: user@example.com
Auth Status: Reject
Date Range: Last 24 hours
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **Real-time Streaming**: WebSocket-based live log streaming
- **Advanced Analytics**: Log analysis and trending
- **Alerting System**: Automated alerts for security events
- **Log Retention**: Automatic log archiving and cleanup
- **Dashboard Integration**: Log widgets for main dashboard

### **Scalability Improvements**
- **Pagination**: Large dataset handling
- **Search Indexing**: Full-text search capabilities
- **Multi-device Aggregation**: Combined logs from multiple devices
- **Performance Metrics**: Log processing performance monitoring

## 📋 **API Reference**

### **NAT Logs Endpoint**
```http
GET /api/logs/nat?deviceId={id}&count=100&sourceIP=192.168.1.100
```

### **Access Request Logs Endpoint**
```http
GET /api/logs/access-request?deviceId={id}&username=user@example.com&authStatus=reject
```

### **Response Format**
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "logs": [...],
  "total": 150,
  "query": {...}
}
```

## ✅ **Implementation Status**

- ✅ **MikroTik API Extensions**: Complete log fetching functions
- ✅ **NAT Logs Management**: Full UI and backend implementation
- ✅ **Access Request Logs**: Complete authentication log system
- ✅ **NAS Device Integration**: Multi-device support
- ✅ **Real-time Features**: Auto-refresh and manual refresh
- ✅ **Export Functionality**: CSV export capabilities
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Documentation**: Complete implementation guide

The logs management system is production-ready and provides comprehensive network monitoring capabilities for NetPilot ISP management system.
