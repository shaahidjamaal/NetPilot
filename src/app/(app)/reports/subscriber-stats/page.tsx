
"use client"

import * as React from "react"
import { startOfMonth, isWithinInterval } from "date-fns"
import { DateRange } from "react-day-picker"
import { Loader2, Users, UserPlus, UserCheck, UserX } from "lucide-react"
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useCustomers } from "@/hooks/use-customers"

export default function SubscriberStatsPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    
    const { customers, isLoading } = useCustomers()

    const stats = React.useMemo(() => {
        if (!customers) return { total: 0, active: 0, inactive: 0, suspended: 0, new: 0, chartData: [] };

        const active = customers.filter(c => c.status === 'Active').length;
        const inactive = customers.filter(c => c.status === 'Inactive').length;
        const suspended = customers.filter(c => c.status === 'Suspended').length;
        
        const newCustomers = customers.filter(c => {
            if (!date?.from) return false;
            const joinDate = new Date(c.joined);
            const to = date.to ? date.to : date.from;
            return isWithinInterval(joinDate, { start: date.from, end: to });
        }).length;

        const chartData = [
            { name: "Active", value: active, fill: 'hsl(var(--chart-1))' },
            { name: "Inactive", value: inactive, fill: 'hsl(var(--chart-3))' },
            { name: "Suspended", value: suspended, fill: 'hsl(var(--chart-4))' },
        ].filter(item => item.value > 0);

        return {
            total: customers.length,
            active,
            inactive,
            suspended,
            new: newCustomers,
            chartData
        }
    }, [customers, date]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriber Statistics</h1>
            <p className="text-muted-foreground">View active, inactive, and new customer data.</p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-sm text-muted-foreground">New Customers Date Range</span>
            <DateRangePicker date={date} onDateChange={setDate} />
        </div>
      </div>

      {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive/Suspended</CardTitle>
                        <UserX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.inactive + stats.suspended}</div>
                        <p className="text-xs text-muted-foreground">{stats.inactive} Inactive, {stats.suspended} Suspended</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Subscribers</CardTitle>
                        <UserPlus className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.new}</div>
                        <p className="text-xs text-muted-foreground">in selected period</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Subscriber Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                     {stats.chartData.length > 0 ? (
                        <ChartContainer config={{}} className="mx-auto aspect-square h-[350px]">
                            <RechartsPieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={stats.chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                            >
                                {stats.chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            </RechartsPieChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                            No subscriber data to display.
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  )
}
