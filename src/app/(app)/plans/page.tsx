import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Gauge, PlusCircle, Upload, Users } from "lucide-react"
import Link from "next/link"

const plans = [
  { name: "Basic DSL", price: 2499, download: 25, upload: 5, data: "Unlimited", users: "1-2" },
  { name: "Fiber 100", price: 3999, download: 100, upload: 20, data: "Unlimited", users: "3-5" },
  { name: "Fiber 500", price: 5799, download: 500, upload: 100, data: "Unlimited", users: "5-10" },
  { name: "Fiber 1000", price: 7499, download: 1000, upload: 250, data: "Unlimited", users: "10+" },
]

export default function PlansPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Plans</h1>
          <p className="text-muted-foreground">Create, modify, and track various service plans.</p>
        </div>
        <Link href="/plans/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Plan
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</span>
                /month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-accent" />
                  <span><span className="font-medium">{plan.download} Mbps</span> Download</span>
                </li>
                <li className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-accent" />
                  <span><span className="font-medium">{plan.upload} Mbps</span> Upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-accent" />
                  <span>Data: <span className="font-medium">{plan.data}</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>Ideal for <span className="font-medium">{plan.users}</span> users</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Modify Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
