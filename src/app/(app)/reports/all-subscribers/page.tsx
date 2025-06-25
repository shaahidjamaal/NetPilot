
"use client"

import * as React from 'react';
import * as XLSX from 'xlsx';
import { useCustomers } from "@/hooks/use-customers"
import { useInvoices } from "@/hooks/use-invoices"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Download, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format, isValid } from 'date-fns'

export default function AllSubscribersReportPage() {
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  const { invoices, isLoading: isLoadingInvoices } = useInvoices();
  const isLoading = isLoadingCustomers || isLoadingInvoices;

  const customerSalesData = React.useMemo(() => {
    if (isLoading) return {};

    const sales: { [customerId: string]: { totalSpent: number; invoiceCount: number } } = {};

    invoices.forEach(invoice => {
      if (!sales[invoice.customerId]) {
        sales[invoice.customerId] = { totalSpent: 0, invoiceCount: 0 };
      }
      sales[invoice.customerId].totalSpent += invoice.amount;
      sales[invoice.customerId].invoiceCount += 1;
    });

    return sales;
  }, [invoices, isLoading]);

  const totalRevenue = React.useMemo(() => {
    if (isLoading) return 0;
    return Object.values(customerSalesData).reduce((sum, current) => sum + current.totalSpent, 0);
  }, [customerSalesData, isLoading]);


  const handleExportCsv = () => {
    if (!customers || customers.length === 0) return;

    const headers = [
      "ID", "Name", "Email", "Mobile", "Customer Type", "GST Number", "Service Package", "Status", 
      "Joined Date", "Permanent Address", "Installation Address", "Aadhar Number", "Zone",
      "Total Spent", "Invoice Count"
    ];

    const formatCsvCell = (cellData: string | number | undefined | null) => {
      const stringData = String(cellData ?? '');
      if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const csvRows = customers.map(customer => {
      const sales = customerSalesData[customer.id] || { totalSpent: 0, invoiceCount: 0 };
      const joinedDate = customer.joined && isValid(new Date(customer.joined)) ? format(new Date(customer.joined), 'yyyy-MM-dd') : '';
      const row = [
        customer.id,
        customer.name,
        customer.email,
        customer.mobile,
        customer.customerType,
        customer.gstNumber,
        customer.servicePackage,
        customer.status,
        joinedDate,
        customer.permanentAddress,
        customer.installationAddress,
        customer.aadharNumber,
        customer.zone,
        sales.totalSpent,
        sales.invoiceCount
      ];
      return row.map(formatCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `subscriber-sales-report-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportXlsx = () => {
    if (!customers || customers.length === 0) return;
    
    const dataToExport = customers.map(customer => {
      const sales = customerSalesData[customer.id] || { totalSpent: 0, invoiceCount: 0 };
      return {
        'ID': customer.id,
        'Name': customer.name,
        'Email': customer.email,
        'Mobile': customer.mobile,
        'Customer Type': customer.customerType,
        'GST Number': customer.gstNumber || '',
        'Current Package': customer.servicePackage,
        'Status': customer.status,
        'Joined Date': customer.joined && isValid(new Date(customer.joined)) ? format(new Date(customer.joined), 'yyyy-MM-dd') : '',
        'Total Spent': sales.totalSpent,
        'Invoice Count': sales.invoiceCount,
        'Permanent Address': customer.permanentAddress,
        'Installation Address': customer.installationAddress,
        'Aadhar Number': customer.aadharNumber,
        'Zone': customer.zone,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");
    
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `subscriber-sales-report-${today}.xlsx`);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/reports">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <CardTitle>Subscriber Sales Report</CardTitle>
                <CardDescription>A report on sales revenue and invoice counts for each subscriber.</CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isLoading || customers.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportCsv}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportXlsx}>Export as Excel (.xlsx)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <Card>
                  <CardContent className="p-4">
                      <div className="text-2xl font-bold">{customers.length}</div>
                      <p className="text-xs text-muted-foreground">Total Subscribers</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardContent className="p-4">
                      <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                      <p className="text-xs text-muted-foreground">Total Revenue from All Subscribers</p>
                  </CardContent>
              </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Current Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const sales = customerSalesData[customer.id] || { totalSpent: 0, invoiceCount: 0 };
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </TableCell>
                      <TableCell>{customer.servicePackage}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.status === 'Active' ? 'default' : customer.status === 'Suspended' ? 'secondary' : 'destructive'}
                          className={`${customer.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                          ${customer.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}
                          ${customer.status === 'Inactive' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">₹{sales.totalSpent.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">{sales.invoiceCount}</TableCell>
                      <TableCell>{customer.joined && isValid(new Date(customer.joined)) ? format(new Date(customer.joined), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
