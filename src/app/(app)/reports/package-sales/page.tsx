
"use client"

import * as React from "react"
import { addDays, format, startOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"
import { Loader2, IndianRupee, ShoppingCart } from "lucide-react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { DateRangePicker } from "@/components/date-range-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useInvoices } from "@/hooks/use-invoices"
import { usePackages } from "@/hooks/use-packages"

export default function PackageSalesReportPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    
    const { invoices, isLoading: isLoadingInvoices } = useInvoices()
    const { packages, isLoading: isLoadingPackages } = usePackages()

    const isLoading = isLoadingInvoices || isLoadingPackages;

    const salesData = React.useMemo(() => {
        if (!invoices || !packages) return { reportData: [], totalRevenue: 0, totalSales: 0 };
        
        const filteredInvoices = invoices.filter(invoice => {
            if (!date?.from) return true;
            const invoiceDate = new Date(invoice.generatedDate);
            const from = date.from;
            const to = date.to ? addDays(date.to, 1) : addDays(from, 1);
            return invoiceDate >= from && invoiceDate < to;
        });

        const packageSales = packages.map(pkg => ({
            name: pkg.name,
            sales: 0,
            revenue: 0,
        }));

        let totalRevenue = 0;
        let totalSales = 0;

        filteredInvoices.forEach(invoice => {
            const pkgIndex = packageSales.findIndex(p => p.name === invoice.packageName);
            if (pkgIndex !== -1) {
                packageSales[pkgIndex].sales += 1;
                packageSales[pkgIndex].revenue += invoice.amount;
            }
            totalRevenue += invoice.amount;
            totalSales += 1;
        });

        return {
            reportData: packageSales.filter(p => p.sales > 0).sort((a,b) => b.revenue - a.revenue),
            totalRevenue,
            totalSales
        }
    }, [invoices, packages, date]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Package Sales Report</h1>
            <p className="text-muted-foreground">Analyze revenue from different service packages.</p>
        </div>
        <DateRangePicker date={date} onDateChange={setDate} />
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{salesData.totalRevenue.toLocaleString('en-IN')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Packages Sold</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesData.totalSales}</div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-8 md:grid-cols-5">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Sales Breakdown</CardTitle>
                        <CardDescription>Revenue and units sold per package in the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Package Name</TableHead>
                              <TableHead className="text-right">Units Sold</TableHead>
                              <TableHead className="text-right">Total Revenue</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salesData.reportData.map((pkg) => (
                              <TableRow key={pkg.name}>
                                <TableCell className="font-medium">{pkg.name}</TableCell>
                                <TableCell className="text-right">{pkg.sales}</TableCell>
                                <TableCell className="text-right">₹{pkg.revenue.toLocaleString('en-IN')}</TableCell>
                              </TableRow>
                            ))}
                             {salesData.reportData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">No sales data for this period.</TableCell>
                                </TableRow>
                            )}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">{salesData.totalSales}</TableCell>
                                <TableCell className="text-right font-bold">₹{salesData.totalRevenue.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue by Package</CardTitle>
                        <CardDescription>Visualizing package revenue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {salesData.reportData.length > 0 ? (
                            <ChartContainer config={{}} className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart layout="vertical" data={salesData.reportData} margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                        <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                         ) : (
                             <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                                 No data to display.
                             </div>
                         )}
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  )
}
