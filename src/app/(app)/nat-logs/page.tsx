import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function NatLogsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NAT Logs</CardTitle>
        <CardDescription>Review network address translation logs.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>NAT logs table goes here.</p>
      </CardContent>
    </Card>
  )
}
