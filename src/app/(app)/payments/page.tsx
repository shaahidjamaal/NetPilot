
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Loader2, ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { usePayments } from "@/hooks/use-payments"
import { useCustomers } from "@/hooks/use-customers"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


function PaymentsPageContent() {
  const searchParams = useSearchParams();
  const fromReports = searchParams.get('from') === 'reports';

  const { payments, isLoading: isLoadingPayments } = usePayments()
  const { customers, isLoading: isLoadingCustomers } = useCustomers()
  
  const isLoading = isLoadingPayments || isLoadingCustomers;

  const paymentDetails = React.useMemo(() => {
    if (isLoading) return [];
    
    return payments.map(payment => {
      const customer = customers.find(c => c.id === payment.customerId);
      const receivedBy = ['Online Gateway', 'Bank Transfer'].includes(payment.method) ? 'Online Payment' : 'Admin';
      
      return {
        ...payment,
        pppoeUsername: customer?.pppoeUsername || 'N/A',
        receivedBy: receivedBy
      }
    })
  }, [payments, customers, isLoading]);


  const getStatusBadgeVariant = (status: 'Completed' | 'Pending' | 'Failed') => {
    switch (status) {
      case 'Completed': return 'default'
      case 'Pending': return 'secondary'
      case 'Failed': return 'destructive'
    }
  }

  const getStatusBadgeClass = (status: 'Completed' | 'Pending' | 'Failed') => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400'
      case 'Pending': return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
      case 'Failed': return 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400'
    }
  }

  return (
    <div className="space-y-4">
      {fromReports && (
        <Button variant="outline" asChild>
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports Center
          </Link>
        </Button>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Payments History</CardTitle>
          <CardDescription>A log of all payments made by customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="hidden md:table-cell">Received By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentDetails.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs hidden sm:table-cell">{payment.transactionId || payment.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.customerName}</div>
                      <div className="text-sm text-muted-foreground">{payment.pppoeUsername}</div>
                    </TableCell>
                    <TableCell className="text-right">₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate), "PP")}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{payment.receivedBy}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(payment.status)} 
                        className={getStatusBadgeClass(payment.status)}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && paymentDetails.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
              No payments have been recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <React.Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PaymentsPageContent />
    </React.Suspense>
  )
}
