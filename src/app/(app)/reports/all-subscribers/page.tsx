
"use client"

import { useCustomers } from "@/hooks/use-customers"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Printer, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'

export default function AllSubscribersReportPage() {
  const { customers, isLoading } = useCustomers()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="print:p-0">
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/reports">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle>All Subscribers Report</CardTitle>
                <CardDescription>A complete list of all subscribers in the system.</CardDescription>
              </div>
            </div>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
           <div className="hidden print:block text-center mb-4">
                <h1 className="text-2xl font-bold">All Subscribers Report</h1>
                <p className="text-sm text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
            <Card className="mb-6 print:border print:shadow-sm">
                <CardContent className="p-4">
                    <div className="text-2xl font-bold">{customers.length}</div>
                    <p className="text-xs text-muted-foreground">Total Subscribers</p>
                </CardContent>
            </Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Service Package</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.email}</div>
                      <div className="text-sm text-muted-foreground">{customer.mobile}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'Active' ? 'default' : customer.status === 'Suspended' ? 'destructive' : 'secondary'}
                        className={`${customer.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                        ${customer.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}
                        ${customer.status === 'Inactive' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.servicePackage}</TableCell>
                    <TableCell>{format(new Date(customer.joined), 'yyyy-MM-dd')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
