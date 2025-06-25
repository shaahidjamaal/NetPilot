
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function OnlineSubscribersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Subscribers</CardTitle>
        <CardDescription>View currently online subscribers.</CardDescription>
      </CardHeader>
       <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-dashed border-2 rounded-lg h-64">
            <Construction className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">This feature is under construction and will be available soon.</p>
        </div>
      </CardContent>
    </Card>
  )
}
