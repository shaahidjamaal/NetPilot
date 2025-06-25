"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sync, Router, AlertCircle, CheckCircle, Users } from 'lucide-react'
import { Customer, Package } from '@/lib/types'
import { handleApiResponse } from '@/lib/api-config'

interface MikroTikSyncProps {
  customer?: Customer
  customers?: Customer[]
  packages: Package[]
  onSyncComplete?: () => void
}

interface SyncResult {
  success: boolean
  message: string
  created?: number
  updated?: number
  errors?: string[]
}

export function MikroTikSync({ customer, customers, packages, onSyncComplete }: MikroTikSyncProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [serviceType, setServiceType] = useState<'pppoe' | 'hotspot'>('pppoe')
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const { toast } = useToast()

  const isBulkSync = !customer && customers && customers.length > 0
  const isSingleSync = customer && !customers

  const syncSingle = async () => {
    if (!customer) return

    const pkg = packages.find(p => p.name === customer.servicePackage)
    if (!pkg) {
      toast({
        variant: "destructive",
        title: "Package Not Found",
        description: `Package "${customer.servicePackage}" not found.`,
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/mikrotik/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer,
          package: pkg,
          serviceType,
        }),
      })

      const data = await handleApiResponse(response)
      
      setLastSyncResult(data.result)
      
      toast({
        title: "Sync Successful",
        description: `${customer.name} has been synced to MikroTik router.`,
      })

      onSyncComplete?.()
    } catch (error: any) {
      setLastSyncResult({
        success: false,
        message: error.message,
        errors: [error.message]
      })

      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncBulk = async () => {
    if (!customers || customers.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/mikrotik/sync', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('netpilot-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customers,
          packages,
          serviceType,
        }),
      })

      const data = await handleApiResponse(response)
      
      setLastSyncResult({
        success: true,
        message: data.message,
        created: data.summary.created,
        updated: data.summary.updated,
        errors: data.results.filter((r: any) => !r.success).map((r: any) => r.message)
      })
      
      toast({
        title: "Bulk Sync Completed",
        description: `${data.summary.created} created, ${data.summary.updated} updated, ${data.summary.errors} errors.`,
      })

      onSyncComplete?.()
    } catch (error: any) {
      setLastSyncResult({
        success: false,
        message: error.message,
        errors: [error.message]
      })

      toast({
        variant: "destructive",
        title: "Bulk Sync Failed",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = () => {
    if (isSingleSync) {
      syncSingle()
    } else if (isBulkSync) {
      syncBulk()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Router className="h-5 w-5" />
          MikroTik Sync
        </CardTitle>
        <CardDescription>
          {isSingleSync 
            ? `Sync ${customer?.name} to MikroTik router`
            : `Sync ${customers?.length || 0} customers to MikroTik router`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Service Type</label>
          <Select value={serviceType} onValueChange={(value) => setServiceType(value as 'pppoe' | 'hotspot')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pppoe">PPPoE</SelectItem>
              <SelectItem value="hotspot">Hotspot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isSingleSync && customer && (
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Customer:</strong> {customer.name}
            </div>
            <div className="text-sm">
              <strong>Package:</strong> {customer.servicePackage}
            </div>
            <div className="text-sm">
              <strong>Username:</strong> {customer.pppoeUsername || customer.email}
            </div>
            <div className="text-sm">
              <strong>Status:</strong> 
              <Badge variant={customer.status === 'Active' ? 'default' : 'destructive'} className="ml-2">
                {customer.status}
              </Badge>
            </div>
          </div>
        )}

        {isBulkSync && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{customers?.length} customers selected</span>
            </div>
            <div className="text-sm text-muted-foreground">
              This will create/update user accounts and bandwidth profiles for all selected customers.
            </div>
          </div>
        )}

        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Sync className="mr-2 h-4 w-4" />
          {isSingleSync ? 'Sync Customer' : 'Sync All Customers'}
        </Button>

        {lastSyncResult && (
          <div className="mt-4 p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {lastSyncResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {lastSyncResult.success ? 'Sync Successful' : 'Sync Failed'}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">
              {lastSyncResult.message}
            </div>

            {lastSyncResult.created !== undefined && (
              <div className="text-sm">
                <strong>Created:</strong> {lastSyncResult.created}
              </div>
            )}

            {lastSyncResult.updated !== undefined && (
              <div className="text-sm">
                <strong>Updated:</strong> {lastSyncResult.updated}
              </div>
            )}

            {lastSyncResult.errors && lastSyncResult.errors.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium text-red-600">Errors:</div>
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {lastSyncResult.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {lastSyncResult.errors.length > 3 && (
                    <li>... and {lastSyncResult.errors.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
