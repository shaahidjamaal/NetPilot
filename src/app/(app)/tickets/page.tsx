import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function TicketsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>Manage customer support tickets.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Support tickets table goes here.</p>
      </CardContent>
    </Card>
  )
}
