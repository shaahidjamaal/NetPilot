import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function LeadsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads</CardTitle>
        <CardDescription>Manage potential customer leads.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Leads management table goes here.</p>
      </CardContent>
    </Card>
  )
}
