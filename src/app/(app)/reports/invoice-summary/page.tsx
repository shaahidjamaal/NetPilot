
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function InvoiceSummaryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Summary</CardTitle>
        <CardDescription>Track paid, unpaid, and overdue invoices.</CardDescription>
      </CardHeader>
       <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-dashed border-2 rounded-lg h-64">
            <Construction className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">This report is under construction and will be available soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}
