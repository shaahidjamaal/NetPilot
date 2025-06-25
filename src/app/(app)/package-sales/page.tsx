
"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { addDays, format, isWithinInterval } from "date-fns"
import { Loader2, Calendar as CalendarIcon } from "lucide-react"

import { useInvoices } from "@/hooks/use-invoices"
import { usePackages } from "@/hooks/use-packages"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"

export default function PackageSalesPage() {
  const { invoices, isLoading: isLoadingInvoices } = useInvoices()
  const { packages, isLoading: isLoadingPackages } = usePackages()

  const [date, setDate] = React.useState<DateRange | undefined>()

  React.useEffect(() => {
    setDate({
      from: addDays(new Date(), -30),
      to: new Date(),
    })
  }, [])

  const salesData = React.useMemo(() => {
    if (isLoadingInvoices || isLoadingPackages) return { packageSales: [], totalRevenue: 0, totalUnits: 0 }

    const filteredInvoices = invoices.filter(invoice => {
      if (!date?.from) return true; // if no start date, include all
      const endDate = date.to || date.from; // if no end date, use start date
      const invoiceDate = new Date(invoice.generatedDate)
      return isWithinInterval(invoiceDate, { start: date.from, end: addDays(endDate, 1) }) // add a day to make the range inclusive
    })

    const salesByPackage = packages.map(pkg => {
      const relevantInvoices = filteredInvoices.filter(inv => inv.packageName === pkg.name)
      const unitsSold = relevantInvoices.length
      const revenue = relevantInvoices.reduce((sum, inv) => sum + inv.amount, 0)
      return {
        name: pkg.name,
        price: pkg.price,
        unitsSold,
        revenue,
      }
    }).filter(p => p.unitsSold > 0);

    const totalRevenue = salesByPackage.reduce((sum, pkg) => sum + pkg.revenue, 0)
    const totalUnits = salesByPackage.reduce((sum, pkg) => sum + pkg.unitsSold, 0)

    return { packageSales: salesByPackage, totalRevenue, totalUnits }
  }, [invoices, packages, isLoadingInvoices, isLoadingPackages, date])

  const isLoading = isLoadingInvoices || isLoadingPackages;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Package Sales Report</CardTitle>
                <CardDescription>An overview of sales for each service package.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      </CardHeader>
       <CardContent>
        {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{salesData.totalRevenue.toLocaleString('en-IN')}</div>
                            <p className="text-xs text-muted-foreground">in the selected period</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{salesData.totalUnits}</div>
                            <p className="text-xs text-muted-foreground">in the selected period</p>
                        </CardContent>
                    </Card>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Units Sold</TableHead>
                            <TableHead className="text-right">Total Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salesData.packageSales.map((pkg) => (
                        <TableRow key={pkg.name}>
                            <TableCell className="font-medium">{pkg.name}</TableCell>
                            <TableCell className="text-right">₹{pkg.price.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-right">{pkg.unitsSold}</TableCell>
                            <TableCell className="text-right">₹{pkg.revenue.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="font-bold">Grand Total</TableCell>
                            <TableCell className="text-right font-bold">{salesData.totalUnits}</TableCell>
                            <TableCell className="text-right font-bold">₹{salesData.totalRevenue.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                 {salesData.packageSales.length === 0 && (
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
                        No sales data found for the selected period.
                    </div>
                )}
            </div>
          )
        }
      </CardContent>
    </Card>
  )
}
