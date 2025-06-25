import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin</CardTitle>
        <CardDescription>Manage administrative settings.</CardDescription>
      </CardHeader>
       <CardContent>
        <p>Admin settings and management tools will go here.</p>
      </CardContent>
    </Card>
  )
}
