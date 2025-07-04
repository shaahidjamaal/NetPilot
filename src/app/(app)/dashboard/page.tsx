
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ArrowUp, IndianRupee, ShoppingCart, Signal } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useInvoices } from "@/hooks/use-invoices"
import { usePackages } from "@/hooks/use-packages"
import { useCustomers } from "@/hooks/use-customers"
import { isAfter, startOfMonth, subMonths } from 'date-fns'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const revenueData = [
  { month: "Jan", revenue: 1500000 },
  { month: "Feb", revenue: 1650000 },
  { month: "Mar", revenue: 1800000 },
  { month: "Apr", revenue: 1700000 },
  { month: "May", revenue: 2000000 },
  { month: "Jun", revenue: 2400000 },
]

const usageData = [
  { day: "Mon", usage: 4000 },
  { day: "Tue", usage: 3000 },
  { day: "Wed", usage: 2000 },
  { day: "Thu", usage: 2780 },
  { day: "Fri", usage: 1890 },
  { day: "Sat", usage: 2390 },
  { day: "Sun", usage: 3490 },
]

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function DashboardPage() {
  const { invoices, isLoading: isLoadingInvoices } = useInvoices()
  const { packages, isLoading: isLoadingPackages } = usePackages()
  const { customers, isLoading: isLoadingCustomers } = useCustomers()
  
  const [salesData, setSalesData] = useState({ currentMonthTotal: 0, previousMonthTotal: 0, packageSalesData: [] as any[] });
  const [customerStats, setCustomerStats] = useState({ active: 0, newThisMonth: 0 });

  useEffect(() => {
    if (isLoadingInvoices || !invoices?.length || isLoadingPackages || !packages?.length) {
      return;
    }

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfPreviousMonth = startOfMonth(subMonths(now, 1));
    
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;

    const packageSalesCurrent = packages.reduce((acc, pkg) => ({...acc, [pkg.name]: 0}), {} as { [key: string]: number });

    invoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.generatedDate);
        if (isAfter(invoiceDate, startOfCurrentMonth)) {
            currentMonthTotal += invoice.amount;
            if (packageSalesCurrent[invoice.packageName] !== undefined) {
                packageSalesCurrent[invoice.packageName] += invoice.amount;
            }
        } else if (isAfter(invoiceDate, startOfPreviousMonth)) {
            previousMonthTotal += invoice.amount;
        }
    });
    
    const packageSalesData = packages.map(pkg => ({
        name: pkg.name,
        current: packageSalesCurrent[pkg.name] || 0,
    })).filter(d => d.current > 0).sort((a,b) => b.current - a.current);

    setSalesData({ currentMonthTotal, previousMonthTotal, packageSalesData });
  }, [invoices, packages, isLoadingInvoices, isLoadingPackages]);

  useEffect(() => {
      if (isLoadingCustomers || !customers?.length) return;
      
      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);

      const active = customers.filter(c => c.status === 'Active').length;
      const newThisMonth = customers.filter(c => isAfter(new Date(c.joined), startOfCurrentMonth)).length;

      setCustomerStats({ active, newThisMonth });
  }, [customers, isLoadingCustomers]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{revenueData[5].revenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">+20.0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.active}</div>
            <p className="text-xs text-muted-foreground">Total active subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package Sales (This Month)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{salesData.currentMonthTotal.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">vs ₹{salesData.previousMonthTotal.toLocaleString('en-IN')} last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Subscriptions</CardTitle>
            <ArrowUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{customerStats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <RechartsBarChart data={revenueData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="revenue" radius={8}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Package-wise Sales (This Month)</CardTitle>
            <CardDescription>Top performing packages by revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.packageSalesData.map((pkg) => (
                  <TableRow key={pkg.name}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell className="text-right">₹{pkg.current.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">₹{salesData.currentMonthTotal.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Data Usage Trends</CardTitle>
            <CardDescription>Mock data showing network usage over the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full">
              <RechartsLineChart data={usageData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => `${value / 1000} TB`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line type="monotone" dataKey="usage" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
