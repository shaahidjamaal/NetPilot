
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MoreHorizontal, Loader2, PlusCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { useInvoices, type AddInvoiceInput } from "@/hooks/use-invoices"
import { usePayments } from "@/hooks/use-payments"
import { useToast } from "@/hooks/use-toast"
import { type Customer } from "@/lib/types"
import { type Package } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Schema for the new invoice form
const invoiceSchema = z.object({
  customerId: z.string({ required_error: "Please select a customer." }),
  packageName: z.string({ required_error: "Please select a service package." }),
  additionalCharges: z.coerce.number().min(0).optional().default(0),
  discountOverride: z.coerce.number().min(0).max(100).optional(),
})

function CreateInvoiceDialog({ onFormSubmit, customers, packages, isLoading }: { onFormSubmit: (values: AddInvoiceInput) => void, customers: Customer[], packages: Package[], isLoading: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      discountOverride: 0,
      additionalCharges: 0,
    }
  })

  const { toast } = useToast()
  
  const selectedCustomerId = form.watch("customerId")
  const selectedPackageName = form.watch("packageName")

  const selectedCustomer = React.useMemo(() => customers.find(c => c.id === selectedCustomerId), [customers, selectedCustomerId])
  const selectedPackage = React.useMemo(() => packages.find(p => p.name === selectedPackageName), [packages, selectedPackageName])

  React.useEffect(() => {
    if (selectedCustomer) {
      form.setValue("discountOverride", selectedCustomer.discount || 0)
    } else {
      form.setValue("discountOverride", 0)
    }
  }, [selectedCustomer, form])

  const handleSubmit = (values: z.infer<typeof invoiceSchema>) => {
    onFormSubmit(values)
    toast({
      title: "Invoice Created",
      description: "A new invoice has been successfully generated.",
    })
    setIsOpen(false)
    form.reset()
  }

  const basePrice = selectedPackage?.price || 0
  const discount = form.watch("discountOverride") || 0
  const additionalCharges = form.watch("additionalCharges") || 0
  const discountAmount = basePrice * (discount / 100)
  const totalAmount = (basePrice - discountAmount) + additionalCharges

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4"/> Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>Manually generate an invoice for a customer.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>{customer.name} ({customer.id})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="packageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Package</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a package" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.name} value={pkg.name}>{pkg.name} (₹{pkg.price})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                  control={form.control}
                  name="additionalCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Charges</FormLabel>
                      <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                      <FormDescription>Any extra one-time fees.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="discountOverride"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input type="number" placeholder="0" {...field} onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)}/>
                           <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>Overrides customer's default discount.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <Separator />
            
            <div className="rounded-lg border bg-secondary/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Package Price:</span>
                    <span>₹{basePrice.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Discount ({discount}%):</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Additional Charges:</span>
                    <span>+ ₹{additionalCharges.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!selectedCustomer || !selectedPackage}>Create Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


export default function BillingPage() {
  const { invoices, addInvoice, markAsPaid, deleteInvoice, isLoading, customers, packages } = useInvoices()
  const { addPayment } = usePayments()
  const { toast } = useToast()
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<string | null>(null)
  const router = useRouter()

  const handleMarkAsPaid = (invoiceId: string) => {
    // Find the invoice first to get its details for the payment record
    const invoice = invoices.find(inv => inv.id === invoiceId)
    
    // Mark invoice as paid
    markAsPaid(invoiceId)
    
    // Create a corresponding payment record
    if (invoice) {
        addPayment({
            invoiceId: invoice.id,
            customerId: invoice.customerId,
            customerName: invoice.customerName,
            amount: invoice.amount,
            method: 'Admin-Recorded',
            status: 'Completed',
            transactionId: `adm-${new Date().getTime()}`
        })
    }

    toast({
        title: "Invoice Updated",
        description: "The invoice has been marked as paid and a payment record created.",
    })
  }

  const handleSendReminder = (invoiceId: string) => {
    toast({
      title: "Reminder Sent",
      description: `An invoice reminder has been sent for ${invoiceId}.`,
    })
  }

  const handleDeleteInvoice = () => {
    if (invoiceToDelete) {
        deleteInvoice(invoiceToDelete)
        toast({
            title: "Invoice Deleted",
            description: "The invoice has been deleted.",
            variant: "destructive",
        })
        setInvoiceToDelete(null)
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing & Invoices</CardTitle>
              <CardDescription>
                Manual invoice generation and payment tracking system.
              </CardDescription>
            </div>
            <CreateInvoiceDialog
                onFormSubmit={addInvoice}
                customers={customers}
                packages={packages}
                isLoading={isLoading}
            />
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
                          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                            View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendReminder(invoice.id)}>
                            Send Reminder
                          </DropdownMenuItem>
                           {invoice.status !== 'Paid' && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                    Mark as Paid
                                </DropdownMenuItem>
                            )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setInvoiceToDelete(invoice.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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
                    No invoices found. Create a new invoice to get started.
                </div>
            )}
        </CardContent>
      </Card>
      
      {invoiceToDelete && (
        <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the invoice. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteInvoice} variant="destructive">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
