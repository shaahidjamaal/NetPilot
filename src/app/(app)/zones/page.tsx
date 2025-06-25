
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, MapPin, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useZones } from "@/hooks/use-zones"
import { useToast } from "@/hooks/use-toast"

export default function ZonesPage() {
  const { zones, addZone, deleteZone, isLoading } = useZones();
  const [newZoneName, setNewZoneName] = useState("");
  const { toast } = useToast();

  const handleAddZone = () => {
    if (newZoneName.trim() === "") {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Zone name cannot be empty.",
        })
        return;
    };
    addZone(newZoneName.trim());
    setNewZoneName("");
    toast({
        title: "Zone Added",
        description: `"${newZoneName.trim()}" has been added.`,
    })
  };

  const handleDeleteZone = (id: string, name: string) => {
    deleteZone(id);
    toast({
        title: "Zone Deleted",
        description: `"${name}" has been deleted.`,
    })
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Zones</CardTitle>
            <CardDescription>
              View, add, and manage service coverage zones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteZone(zone.id, zone.name)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
            { !isLoading && zones.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No zones have been created yet.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Add New Zone</CardTitle>
            <CardDescription>
              Create a new service area.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zone-name">Zone Name</Label>
              <Input 
                id="zone-name" 
                placeholder="e.g., Downtown, South Sector"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddZone()}
              />
            </div>
            <Button onClick={handleAddZone} className="w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Add Zone
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
