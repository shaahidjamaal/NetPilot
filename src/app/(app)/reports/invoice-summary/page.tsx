
"use client"

import * as React from "react"
import { addDays, format, startOfMonth, isWithinInterval, isBefore } from "date-fns"
import { DateRange } from "react-day-picker"
import { Loader2, FileText, FileCheck2, FileClock, FileX2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateRangePicker } from "@/components/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { useInvoices } from "@/hooks/use-invoices"

export default function InvoiceSummaryPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    
    const { invoices, isLoading } = useInvoices()

    const invoiceData = React.useMemo(() => {
        if (!invoices) return { list: [], total: 0, totalAmount: 0, paid: 0, paidAmount: 0, unpaid: 0, unpaidAmount: 0, overdue: 0, overdueAmount: 0 };
        
        const filteredInvoices = invoices.filter(invoice => {
            if (!date?.from) return true;
            const invoiceDate = new Date(invoice.generatedDate);
            const to = date.to ? date.to : date.from;
            return isWithinInterval(invoiceDate, { start: date.from, end: to });
        });

        const today = new Date();
        const summary = {
            list: filteredInvoices,
            total: filteredInvoices.length,
            totalAmount: filteredInvoices.reduce((acc, inv) => acc + inv.amount, 0),
            paid: 0, paidAmount: 0,
            unpaid: 0, unpaidAmount: 0,
            overdue: 0, overdueAmount: 0,
        };

        filteredInvoices.forEach(inv => {
            const isOverdue = inv.status === 'Unpaid' && isBefore(new Date(inv.dueDate), today);
            
            if (inv.status === 'Paid') {
                summary.paid++;
                summary.paidAmount += inv.amount;
            } else if (isOverdue) {
                summary.overdue++;
                summary.overdueAmount += inv.amount;
            } else { // Unpaid but not overdue
                summary.unpaid++;
                summary.unpaidAmount += inv.amount;
            }
        });

        return summary;
    }, [invoices, date]);

    const getStatusInfo = (invoice: typeof invoices[0]) => {
        const isOverdue = invoice.status === 'Unpaid' && isBefore(new Date(invoice.dueDate), new Date());
        if (invoice.status === 'Paid') {
            return { text: 'Paid', variant: 'default' as const, className: 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' };
        }
        if (isOverdue) {
            return { text: 'Overdue', variant: 'destructive' as const, className: 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' };
        }
        return { text: 'Unpaid', variant: 'secondary' as const, className: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' };
    };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Summary Report</h1>
            <p className="text-muted-foreground">Track paid, unpaid, and overdue invoices.</p>
        </div>
        <DateRangePicker date={date} onDateChange={setDate} />
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoiceData.total}</div>
                        <p className="text-xs text-muted-foreground">Total amount: ₹{invoiceData.totalAmount.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                        <FileCheck2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoiceData.paid}</div>
                         <p className="text-xs text-muted-foreground">Total amount: ₹{invoiceData.paidAmount.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
                        <FileClock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoiceData.unpaid}</div>
                         <p className="text-xs text-muted-foreground">Total amount: ₹{invoiceData.unpaidAmount.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                        <FileX2 className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoiceData.overdue}</div>
                         <p className="text-xs text-muted-foreground">Total amount: ₹{invoiceData.overdueAmount.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Invoice List</CardTitle>
                    <CardDescription>All invoices within the selected date range.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoiceData.list.map((invoice) => {
                                const status = getStatusInfo(invoice);
                                return (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>{invoice.customerName}</TableCell>
                                        <TableCell className="text-right">₹{invoice.amount.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{format(new Date(invoice.dueDate), "PPP")}</TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant} className={status.className}>
                                                {status.text}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                     {invoiceData.list.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No invoices found in this date range.
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  )
}
