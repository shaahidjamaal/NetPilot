"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Router, Users, Activity, Settings, Sync, AlertCircle, CheckCircle } from 'lucide-react'
import { authApi, handleApiResponse } from '@/lib/api-config'

interface ConnectionStatus {
  connected: boolean
  message: string
  systemInfo?: any
  lastChecked?: Date
}

interface SessionData {
  sessions: any[]
  count: number
  serviceType: string
}

interface UserData {
  users: any[]
  count: number
  serviceType: string
}

export default function MikroTikPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    message: 'Not tested'
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [sessions, setSessions] = useState<SessionData | null>(null)
  const [users, setUsers] = useState<UserData | null>(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [serviceType, setServiceType] = useState<'pppoe' | 'hotspot'>('pppoe')
  const { toast } = useToast()

  const testConnection = async () => {
    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/mikrotik/test', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      })

      const data = await handleApiResponse(response)
      
      setConnectionStatus({
        connected: true,
        message: data.connection.message,
        systemInfo: data.systemInfo,
        lastChecked: new Date()
      })

      toast({
        title: "Connection Successful",
        description: data.connection.message,
      })
    } catch (error: any) {
      setConnectionStatus({
        connected: false,
        message: error.message,
        lastChecked: new Date()
      })

      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message,
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const loadSessions = async () => {
    setIsLoadingSessions(true)
    try {
      const response = await fetch(`/api/mikrotik/sessions?type=${serviceType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      })

      const data = await handleApiResponse(response)
      setSessions(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Load Sessions",
        description: error.message,
      })
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch(`/api/mikrotik/users?type=${serviceType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
        },
      })

      const data = await handleApiResponse(response)
      setUsers(data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Load Users",
        description: error.message,
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const disconnectSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/mikrotik/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, serviceType }),
      })

      await handleApiResponse(response)
      
      toast({
        title: "Session Disconnected",
        description: "User session has been disconnected successfully.",
      })

      // Reload sessions
      loadSessions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Disconnect Session",
        description: error.message,
      })
    }
  }

  useEffect(() => {
    if (connectionStatus.connected) {
      loadSessions()
      loadUsers()
    }
  }, [serviceType, connectionStatus.connected])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MikroTik AAA Management</h1>
          <p className="text-muted-foreground">
            Manage MikroTik router authentication, authorization, and accounting
          </p>
        </div>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Router Connection
          </CardTitle>
          <CardDescription>
            Test and monitor connection to your MikroTik router
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                Status: {connectionStatus.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button onClick={testConnection} disabled={isTestingConnection}>
              {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {connectionStatus.message}
          </div>

          {connectionStatus.lastChecked && (
            <div className="text-xs text-muted-foreground">
              Last checked: {connectionStatus.lastChecked.toLocaleString()}
            </div>
          )}

          {connectionStatus.systemInfo && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Router Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Board: {connectionStatus.systemInfo[0]?.['board-name'] || 'Unknown'}</div>
                <div>Version: {connectionStatus.systemInfo[0]?.version || 'Unknown'}</div>
                <div>Uptime: {connectionStatus.systemInfo[0]?.uptime || 'Unknown'}</div>
                <div>CPU: {connectionStatus.systemInfo[0]?.['cpu-load'] || 'Unknown'}%</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {connectionStatus.connected && (
        <Tabs value={serviceType} onValueChange={(value) => setServiceType(value as 'pppoe' | 'hotspot')}>
          <TabsList>
            <TabsTrigger value="pppoe">PPPoE</TabsTrigger>
            <TabsTrigger value="hotspot">Hotspot</TabsTrigger>
          </TabsList>

          <TabsContent value={serviceType} className="space-y-6">
            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Sessions ({serviceType.toUpperCase()})
                </CardTitle>
                <CardDescription>
                  Monitor and manage active user sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : sessions ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {sessions.count} Active Sessions
                      </Badge>
                      <Button variant="outline" size="sm" onClick={loadSessions}>
                        Refresh
                      </Button>
                    </div>
                    
                    {sessions.sessions.length > 0 ? (
                      <div className="space-y-2">
                        {sessions.sessions.slice(0, 10).map((session, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">{session.name || session.user}</div>
                              <div className="text-sm text-muted-foreground">
                                {session.address} • {session.uptime || session['session-time']}
                              </div>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => disconnectSession(session['.id'])}
                            >
                              Disconnect
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No active sessions
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Click refresh to load sessions
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {serviceType.toUpperCase()} Users
                </CardTitle>
                <CardDescription>
                  View and manage user accounts on MikroTik router
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : users ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {users.count} Users
                      </Badge>
                      <Button variant="outline" size="sm" onClick={loadUsers}>
                        Refresh
                      </Button>
                    </div>
                    
                    {users.users.length > 0 ? (
                      <div className="space-y-2">
                        {users.users.slice(0, 10).map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Profile: {user.profile} • 
                                Status: {user.disabled === 'true' ? 'Disabled' : 'Enabled'}
                              </div>
                            </div>
                            <Badge variant={user.disabled === 'true' ? 'destructive' : 'default'}>
                              {user.disabled === 'true' ? 'Disabled' : 'Active'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Click refresh to load users
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
