
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

import { usePayments } from "@/hooks/use-payments"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PaymentsPage() {
  const { payments, isLoading } = usePayments()

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
    <Card>
      <CardHeader>
        <CardTitle>Payments History</CardTitle>
        <CardDescription>A log of all successful and pending payments.</CardDescription>
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
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">{payment.invoiceId}</TableCell>
                  <TableCell className="font-medium">{payment.customerName}</TableCell>
                  <TableCell>₹{payment.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{format(new Date(payment.paymentDate), "PPP")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.method}</Badge>
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
        {!isLoading && payments.length === 0 && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
            No payments have been recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
