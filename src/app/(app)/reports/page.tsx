
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Users,
  UserCheck,
  Network,
  BarChartHorizontal,
  FileText,
  CreditCard,
  ShoppingCart,
  Ticket
} from "lucide-react"

const reportItems = [
  {
    title: "All Subscribers",
    description: "View a complete list of all subscribers.",
    icon: <Users className="h-8 w-8 text-primary" />,
    href: "/reports/all-subscribers",
  },
  {
    title: "Active Subscribers",
    description: "Report on currently active subscribers.",
    icon: <UserCheck className="h-8 w-8 text-primary" />,
    href: "/reports/active-subscribers",
  },
  {
    title: "Static IP Subscribers",
    description: "List of subscribers with static IP addresses.",
    icon: <Network className="h-8 w-8 text-primary" />,
    href: "/reports/static-ip-subscribers",
  },
  {
    title: "Data Usage",
    description: "Analyze data consumption by subscribers.",
    icon: <BarChartHorizontal className="h-8 w-8 text-primary" />,
    href: "/reports/data-usage",
  },
  {
    title: "Invoices",
    description: "Generate and review invoice reports.",
    icon: <FileText className="h-8 w-8 text-primary" />,
    href: "/reports/invoices",
  },
  {
    title: "Payments",
    description: "Track and report on all payments received.",
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    href: "/reports/payments",
  },
  {
    title: "Package Sales",
    description: "View sales reports for service packages.",
    icon: <ShoppingCart className="h-8 w-8 text-primary" />,
    href: "/reports/package-sales",
  },
  {
    title: "Tickets",
    description: "Report on support ticket volume and status.",
    icon: <Ticket className="h-8 w-8 text-primary" />,
    href: "/reports/tickets",
  },
];


export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View and generate system reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reportItems.map((item) => (
          <Link href={item.href} key={item.title} className="flex">
            <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col w-full">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                {item.icon}
                <div>
                    <CardTitle>{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
