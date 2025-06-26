"use client"

import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  TestTube,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Router,
} from 'lucide-react';

// Validation schema
const nasDeviceSchema = z.object({
  nasIpAddress: z.string()
    .min(1, 'IP Address is required')
    .regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Invalid IP address format'),
  shortName: z.string()
    .min(1, 'Short Name is required')
    .max(50, 'Short Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Short Name can only contain letters, numbers, underscores, and dashes'),
  nasType: z.enum(['MikroTik RouterOS', 'Cisco', 'Ubiquiti', 'Other']),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  isActive: z.boolean().default(true),
  mikrotikConfig: z.object({
    apiPort: z.number().min(1).max(65535).default(8728),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    connectionTimeout: z.number().min(1000).max(60000).default(10000),
    enableSsl: z.boolean().default(false),
  }).optional(),
});

type NasDeviceFormData = z.infer<typeof nasDeviceSchema>;

interface NasDevice {
  _id: string;
  nasIpAddress: string;
  shortName: string;
  nasType: string;
  description?: string;
  isActive: boolean;
  connectionStatus?: 'connected' | 'disconnected' | 'error';
  connectionMessage?: string;
  lastConnectionTest?: string;
  mikrotikConfig?: {
    apiPort: number;
    username: string;
    password: string;
    connectionTimeout: number;
    enableSsl: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export function NasDevicesManagement() {
  const [devices, setDevices] = useState<NasDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<NasDevice | null>(null);
  const [testingDeviceId, setTestingDeviceId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<NasDeviceFormData>({
    resolver: zodResolver(nasDeviceSchema),
    defaultValues: {
      nasIpAddress: '',
      shortName: '',
      nasType: 'MikroTik RouterOS',
      description: '',
      isActive: true,
      mikrotikConfig: {
        apiPort: 8728,
        username: '',
        password: '',
        connectionTimeout: 10000,
        enableSsl: false,
      },
    },
  });

  const watchNasType = form.watch('nasType');

  // Load devices
  const loadDevices = async () => {
    try {
      const response = await fetch('/api/nas-devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      } else {
        throw new Error('Failed to load devices');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to load NAS devices',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // Handle form submission
  const onSubmit = async (data: NasDeviceFormData) => {
    try {
      const url = editingDevice ? `/api/nas-devices/${editingDevice._id}` : '/api/nas-devices';
      const method = editingDevice ? 'PUT' : 'POST';

      // Remove mikrotikConfig if not MikroTik device
      const submitData = { ...data };
      if (data.nasType !== 'MikroTik RouterOS') {
        delete submitData.mikrotikConfig;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `NAS device ${editingDevice ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        setEditingDevice(null);
        form.reset();
        loadDevices();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Operation failed',
      });
    }
  };

  // Handle edit
  const handleEdit = (device: NasDevice) => {
    setEditingDevice(device);
    form.reset({
      nasIpAddress: device.nasIpAddress,
      shortName: device.shortName,
      nasType: device.nasType as any,
      description: device.description || '',
      isActive: device.isActive,
      mikrotikConfig: device.mikrotikConfig || {
        apiPort: 8728,
        username: '',
        password: '',
        connectionTimeout: 10000,
        enableSsl: false,
      },
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this NAS device?')) {
      return;
    }

    try {
      const response = await fetch(`/api/nas-devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'NAS device deleted successfully',
        });
        loadDevices();
      } else {
        throw new Error('Failed to delete device');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete device',
      });
    }
  };

  // Test connection
  const testConnection = async (deviceId: string) => {
    setTestingDeviceId(deviceId);
    try {
      const response = await fetch(`/api/nas-devices/${deviceId}/test-connection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.connectionResult.success) {
        toast({
          title: 'Connection Successful',
          description: data.connectionResult.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: data.connectionResult?.message || 'Connection test failed',
        });
      }
      
      // Reload devices to update connection status
      loadDevices();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Connection test failed',
      });
    } finally {
      setTestingDeviceId(null);
    }
  };

  // Get connection status badge
  const getConnectionStatusBadge = (device: NasDevice) => {
    if (!device.connectionStatus) {
      return <Badge variant="secondary">Not Tested</Badge>;
    }

    switch (device.connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Router className="h-5 w-5" />
              NAS Devices Management
            </CardTitle>
            <CardDescription>
              Configure and manage your Network Access Server devices
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingDevice(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add NAS Device
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDevice ? 'Edit NAS Device' : 'Add New NAS Device'}
                </DialogTitle>
                <DialogDescription>
                  Configure the connection details for your NAS device
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nasIpAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NAS IP Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shortName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="main-router" {...field} />
                          </FormControl>
                          <FormDescription>
                            Alphanumeric identifier for the device
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="nasType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NAS Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MikroTik RouterOS">MikroTik RouterOS</SelectItem>
                            <SelectItem value="Cisco">Cisco</SelectItem>
                            <SelectItem value="Ubiquiti">Ubiquiti</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Optional description of the device"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Device</FormLabel>
                          <FormDescription>
                            Enable this device for use in the system
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* MikroTik-specific configuration */}
                  {watchNasType === 'MikroTik RouterOS' && (
                    <div className="space-y-4 border rounded-lg p-4">
                      <h4 className="font-medium">MikroTik RouterOS Configuration</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mikrotikConfig.apiPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Port</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="8728"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 8728)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="mikrotikConfig.connectionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timeout (ms)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="10000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 10000)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mikrotikConfig.username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username *</FormLabel>
                              <FormControl>
                                <Input placeholder="admin" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="mikrotikConfig.password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password *</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="mikrotikConfig.enableSsl"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable SSL</FormLabel>
                              <FormDescription>
                                Use SSL for API connection (requires SSL certificate on router)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingDevice(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDevice ? 'Update Device' : 'Create Device'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No NAS devices configured. Add your first device to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connection</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{device.shortName}</div>
                      {device.description && (
                        <div className="text-sm text-muted-foreground">{device.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{device.nasType}</Badge>
                  </TableCell>
                  <TableCell>{device.nasIpAddress}</TableCell>
                  <TableCell>
                    <Badge variant={device.isActive ? 'default' : 'secondary'}>
                      {device.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getConnectionStatusBadge(device)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(device._id)}
                        disabled={testingDeviceId === device._id}
                      >
                        {testingDeviceId === device._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(device)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(device._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
