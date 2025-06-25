
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useInvoices } from "@/hooks/use-invoices"
import { useCustomers } from "@/hooks/use-customers"
import { type Invoice, type Customer } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Printer } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function ViewInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const id = params.id as string
  const { getInvoiceById, isLoading: isLoadingInvoices } = useInvoices()
  const { getCustomerById, isLoading: isLoadingCustomers } = useCustomers()
  
  const [invoice, setInvoice] = React.useState<Invoice | undefined>(undefined)
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined)
  
  React.useEffect(() => {
    if (!isLoadingInvoices && id) {
      const foundInvoice = getInvoiceById(id)
      if (foundInvoice) {
        setInvoice(foundInvoice)
      } else {
        toast({ variant: "destructive", title: "Invoice not found" })
        router.push("/billing")
      }
    }
  }, [isLoadingInvoices, id, getInvoiceById, router, toast])

  React.useEffect(() => {
      if (invoice && !isLoadingCustomers) {
          const foundCustomer = getCustomerById(invoice.customerId);
          if(foundCustomer) {
              setCustomer(foundCustomer)
          }
      }
  }, [invoice, isLoadingCustomers, getCustomerById])

  const handlePrint = () => {
    window.print()
  }
  
  if (isLoadingInvoices || isLoadingCustomers || !invoice || !customer) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div>
        <div className="mb-8 flex items-center justify-between print:hidden">
            <Button variant="outline" onClick={() => router.push('/billing')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Billing
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
            </Button>
        </div>
        
        <Card className="print:shadow-none print:border-none">
            <CardHeader className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">NetPilot ISP</h1>
                        <p className="text-muted-foreground">123 Tech Street, Silicon Valley, CA 94000</p>
                    </div>
                     <div className="text-right">
                        <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
                        <p className="text-muted-foreground">{invoice.id}</p>
                    </div>
                </div>
                 <Separator />
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <h3 className="font-semibold mb-1">Bill To:</h3>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.permanentAddress}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                     </div>
                     <div className="text-right">
                        <p><span className="font-semibold">Invoice Date:</span> {format(new Date(invoice.generatedDate), 'PPP')}</p>
                        <p><span className="font-semibold">Due Date:</span> {format(new Date(invoice.dueDate), 'PPP')}</p>
                         <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Overdue' ? 'destructive' : 'secondary'}
                          className={`mt-2 text-lg px-4 py-1
                          ${invoice.status === 'Paid' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                          ${invoice.status === 'Overdue' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}
                          ${invoice.status === 'Unpaid' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}`}>
                            {invoice.status}
                        </Badge>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <p className="font-medium">{invoice.packageName}</p>
                                <p className="text-sm text-muted-foreground">Service package for the period.</p>
                            </TableCell>
                            <TableCell className="text-right">₹{invoice.packagePrice.toFixed(2)}</TableCell>
                        </TableRow>
                         {invoice.additionalCharges > 0 && (
                            <TableRow>
                                <TableCell>
                                    <p className="font-medium">Additional Charges</p>
                                    <p className="text-sm text-muted-foreground">One-time fees or adjustments.</p>
                                </TableCell>
                                <TableCell className="text-right">₹{invoice.additionalCharges.toFixed(2)}</TableCell>
                            </TableRow>
                        )}
                        {invoice.discount > 0 && (
                            <TableRow>
                                <TableCell>
                                    <p className="font-medium">Discount</p>
                                    <p className="text-sm text-muted-foreground">{invoice.discount}% off the package price.</p>
                                </TableCell>
                                <TableCell className="text-right text-green-600">- ₹{(invoice.packagePrice * (invoice.discount / 100)).toFixed(2)}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                 <div className="w-full flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                            <p>Total</p>
                            <p>₹{invoice.amount.toFixed(2)}</p>
                        </div>
                    </div>
                 </div>
            </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-xs text-muted-foreground print:block hidden">
            <p>Thank you for your business!</p>
            <p>For any queries regarding this invoice, please contact support@netpilot.com</p>
        </div>
    </div>
  )
}
