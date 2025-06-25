import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function InventoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>Manage hardware and equipment inventory.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Inventory management table goes here.</p>
      </CardContent>
    </Card>
  )
}
