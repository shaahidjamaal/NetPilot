
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StaticIpSubscribersReportPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/reports">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
              <CardTitle>Static IP Subscribers Report</CardTitle>
              <CardDescription>A list of subscribers with static IP addresses.</CardDescription>
            </div>
        </div>
      </CardHeader>
       <CardContent>
        <p>Report content goes here.</p>
      </CardContent>
    </Card>
  )
}
