
"use client"

import * as React from "react"
import { MoreHorizontal, Loader2, FileUp } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useInvoices } from "@/hooks/use-invoices"

export default function BillingPage() {
  const { invoices, generateInvoices, markAsPaid, isLoading } = useInvoices()
  const { toast } = useToast()
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false)

  const handleGenerateInvoices = () => {
    const count = generateInvoices()
    if (count > 0) {
      toast({
        title: "Invoices Generated",
        description: `${count} new invoice(s) have been successfully generated.`,
      })
    } else {
      toast({
        title: "No New Invoices",
        description: "All active customers already have an invoice for the current month.",
      })
    }
    setIsGenerateDialogOpen(false)
  }

  const handleMarkAsPaid = (invoiceId: string) => {
    markAsPaid(invoiceId)
    toast({
        title: "Invoice Updated",
        description: "The invoice has been marked as paid.",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing & Invoices</CardTitle>
              <CardDescription>
                Automated invoice generation and payment tracking system.
              </CardDescription>
            </div>
            <Button onClick={() => setIsGenerateDialogOpen(true)}>
                <FileUp className="mr-2 h-4 w-4"/>
                Generate Invoices
            </Button>
          </div>
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
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>₹{invoice.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Overdue' ? 'destructive' : 'secondary'}
                      className={`${invoice.status === 'Paid' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                      ${invoice.status === 'Overdue' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}
                      ${invoice.status === 'Unpaid' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}`}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Invoice</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                           {invoice.status !== 'Paid' && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                    Mark as Paid
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && invoices.length === 0 && (
                <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
                    No invoices found. Try generating invoices for the current month.
                </div>
            )}
        </CardContent>
      </Card>

      <AlertDialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Generate Monthly Invoices?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will generate new invoices for all active customers who have not yet been billed for the current month. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerateInvoices}>
                      Generate
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
