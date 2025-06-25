import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function PaymentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>View and track customer payments.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Payments history table goes here.</p>
      </CardContent>
    </Card>
  )
}
