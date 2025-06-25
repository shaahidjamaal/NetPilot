
"use client"

import { useCustomers } from "@/hooks/use-customers"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'

export default function AllSubscribersReportPage() {
  const { customers, isLoading } = useCustomers()

  const handleExport = () => {
    if (!customers || customers.length === 0) return;

    // Define headers to match the Customer type
    const headers = [
      "ID", "Name", "Email", "Mobile", "Service Package", "Status", 
      "Joined Date", "Permanent Address", "Installation Address", "Aadhar Number"
    ];

    // Function to safely format a cell for CSV
    const formatCsvCell = (cellData: string) => {
      const stringData = String(cellData ?? '');
      // If the data contains a comma, double quote, or newline, wrap it in double quotes.
      if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        // Escape existing double quotes by doubling them
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const csvRows = customers.map(customer => {
      const row = [
        customer.id,
        customer.name,
        customer.email,
        customer.mobile,
        customer.servicePackage,
        customer.status,
        format(new Date(customer.joined), 'yyyy-MM-dd'),
        customer.permanentAddress,
        customer.installationAddress,
        customer.aadharNumber,
      ];
      return row.map(formatCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `all-subscribers-report-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                <CardTitle>All Subscribers Report</CardTitle>
                <CardDescription>A complete list of all subscribers in the system.</CardDescription>
              </div>
            </div>
            <Button onClick={handleExport} disabled={isLoading || customers.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
            <Card className="mb-6">
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
