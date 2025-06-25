"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, RefreshCw, Server } from 'lucide-react'
import { apiConfig, isUsingExternalBackend } from '@/lib/api-config'

interface BackendStatus {
  isConnected: boolean
  responseTime: number | null
  error: string | null
  lastChecked: Date | null
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    responseTime: null,
    error: null,
    lastChecked: null
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkBackendStatus = async () => {
    setIsChecking(true)
    const startTime = Date.now()

    try {
      // Try to reach a simple endpoint (you might want to add a health check endpoint)
      const response = await fetch(`${apiConfig.baseUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseTime = Date.now() - startTime

      if (response.status === 401) {
        // 401 is expected for profile without token, means backend is working
        setStatus({
          isConnected: true,
          responseTime,
          error: null,
          lastChecked: new Date()
        })
      } else if (response.ok) {
        setStatus({
          isConnected: true,
          responseTime,
          error: null,
          lastChecked: new Date()
        })
      } else {
        setStatus({
          isConnected: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          lastChecked: new Date()
        })
      }
    } catch (error: any) {
      setStatus({
        isConnected: false,
        responseTime: null,
        error: error.message || 'Connection failed',
        lastChecked: new Date()
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkBackendStatus()
  }, [])

  const getStatusColor = () => {
    if (status.isConnected) return 'bg-green-500'
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (status.isConnected) return 'Connected'
    return 'Disconnected'
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Status
        </CardTitle>
        <CardDescription>
          {isUsingExternalBackend() ? 'External NestJS Backend' : 'Local Next.js API'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            {getStatusText()}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Endpoint:</span>
          <span className="text-xs text-muted-foreground font-mono">
            {apiConfig.baseUrl}
          </span>
        </div>

        {status.responseTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Response Time:</span>
            <span className="text-sm text-muted-foreground">
              {status.responseTime}ms
            </span>
          </div>
        )}

        {status.error && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-red-600">Error:</span>
            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {status.error}
            </p>
          </div>
        )}

        {status.lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Checked:</span>
            <span className="text-xs text-muted-foreground">
              {status.lastChecked.toLocaleTimeString()}
            </span>
          </div>
        )}

        <Button 
          onClick={checkBackendStatus} 
          disabled={isChecking}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
