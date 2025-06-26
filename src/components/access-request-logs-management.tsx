"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw,
  Download,
  Search,
  Router,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  User,
  CheckCircle,
  XCircle,
  LogOut,
} from 'lucide-react';

// Types
interface AccessRequestLog {
  id: string;
  timestamp: string;
  topics: string[];
  message: string;
  username: string | null;
  clientIP: string | null;
  nasIP: string | null;
  authResult: string | null;
  reason: string | null;
  serviceType: string | null;
  sessionId: string | null;
  callingStationId?: string;
  calledStationId?: string;
  nasPortId?: string;
  framedIP?: string;
  raw: any;
}

interface NASDevice {
  _id: string;
  shortName: string;
  nasIpAddress: string;
  nasType: string;
  isActive: boolean;
}

// Filter schema
const filterSchema = z.object({
  deviceId: z.string().optional(),
  count: z.number().min(10).max(1000).default(100),
  username: z.string().optional(),
  clientIP: z.string().optional(),
  authStatus: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

export function AccessRequestLogsManagement() {
  const [logs, setLogs] = useState<AccessRequestLog[]>([]);
  const [devices, setDevices] = useState<NASDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { toast } = useToast();

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      count: 100,
      username: '',
      clientIP: '',
      authStatus: '',
      startDate: '',
      endDate: '',
    },
  });

  // Load NAS devices
  const loadDevices = useCallback(async () => {
    try {
      const response = await fetch('/api/nas-devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const mikrotikDevices = data.devices?.filter((device: NASDevice) => 
          device.nasType === 'MikroTik RouterOS' && device.isActive
        ) || [];
        setDevices(mikrotikDevices);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }, []);

  // Load access request logs
  const loadLogs = useCallback(async (filters: FilterFormData) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.deviceId) params.append('deviceId', filters.deviceId);
      if (filters.count) params.append('count', filters.count.toString());
      if (filters.username) params.append('username', filters.username);
      if (filters.clientIP) params.append('clientIP', filters.clientIP);
      if (filters.authStatus) params.append('authStatus', filters.authStatus);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/logs/access-request?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setLastRefresh(new Date());
        
        if (data.logs?.length === 0) {
          toast({
            title: 'No logs found',
            description: 'No access request logs match the current filters.',
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load logs');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load access request logs',
      });
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Handle form submission
  const onSubmit = (data: FilterFormData) => {
    loadLogs(data);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (isAutoRefresh) {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
      setIsAutoRefresh(false);
    } else {
      const interval = setInterval(() => {
        const currentFilters = form.getValues();
        loadLogs(currentFilters);
      }, 30000); // Refresh every 30 seconds
      
      setAutoRefreshInterval(interval);
      setIsAutoRefresh(true);
    }
  };

  // Export logs to CSV
  const exportToCSV = () => {
    if (logs.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to export',
        description: 'Load some logs first before exporting.',
      });
      return;
    }

    const headers = [
      'Timestamp',
      'Username',
      'Client IP',
      'NAS IP',
      'Auth Result',
      'Service Type',
      'Session ID',
      'Reason',
      'Calling Station ID',
      'Called Station ID',
      'NAS Port ID',
      'Framed IP',
      'Message'
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.username || '',
        log.clientIP || '',
        log.nasIP || '',
        log.authResult || '',
        log.serviceType || '',
        log.sessionId || '',
        log.reason || '',
        log.callingStationId || '',
        log.calledStationId || '',
        log.nasPortId || '',
        log.framedIP || '',
        `"${log.message.replace(/"/g, '""')}"` // Escape quotes in message
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `access-request-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Get auth result badge
  const getAuthResultBadge = (authResult: string | null) => {
    if (!authResult) return null;
    
    const lowerResult = authResult.toLowerCase();
    if (lowerResult === 'accept') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Accept
        </Badge>
      );
    } else if (lowerResult === 'reject') {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Reject
        </Badge>
      );
    } else if (lowerResult === 'logout') {
      return (
        <Badge variant="secondary">
          <LogOut className="w-3 h-3 mr-1" />
          Logout
        </Badge>
      );
    }
    
    return <Badge variant="outline">{authResult}</Badge>;
  };

  // Get service type badge
  const getServiceTypeBadge = (serviceType: string | null) => {
    if (!serviceType) return null;
    
    const variant = serviceType.toLowerCase() === 'pppoe' ? 'default' : 'secondary';
    return <Badge variant={variant}>{serviceType.toUpperCase()}</Badge>;
  };

  useEffect(() => {
    loadDevices();
    
    // Cleanup auto-refresh on unmount
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [loadDevices]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Request Logs
              </CardTitle>
              <CardDescription>
                Monitor RADIUS/AAA authentication attempts and user access logs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastRefresh && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last: {formatTimestamp(lastRefresh.toISOString())}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoRefresh}
                className={isAutoRefresh ? 'bg-green-50 border-green-200' : ''}
              >
                {isAutoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAutoRefresh ? 'Stop' : 'Auto'} Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="deviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MikroTik Device</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select device" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {devices.map((device) => (
                            <SelectItem key={device._id} value={device._id}>
                              <div className="flex items-center gap-2">
                                <Router className="h-4 w-4" />
                                {device.shortName} ({device.nasIpAddress})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Log Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="10"
                          max="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientIP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client IP</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="authStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auth Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All statuses</SelectItem>
                          <SelectItem value="accept">Accept</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Load Logs
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentFilters = form.getValues();
                    loadLogs(currentFilters);
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Request Logs ({logs.length})</CardTitle>
          <CardDescription>
            RADIUS/AAA authentication and authorization logs
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading access request logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No access logs found</h3>
              <p className="text-muted-foreground mb-4">
                Select a MikroTik device and click "Load Logs" to view authentication activity.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Client IP</TableHead>
                    <TableHead>Auth Result</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.username ? (
                            <>
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{log.username}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{log.clientIP || '-'}</span>
                      </TableCell>
                      <TableCell>
                        {getAuthResultBadge(log.authResult)}
                      </TableCell>
                      <TableCell>
                        {getServiceTypeBadge(log.serviceType)}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{log.sessionId || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.reason || '-'}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
