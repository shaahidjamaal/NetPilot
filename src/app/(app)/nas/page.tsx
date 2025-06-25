
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
import { MoreHorizontal, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NasDevice = {
  id: string;
  name: string;
  ip: string;
  status: "Online" | "Offline";
};

const initialNasDevices: NasDevice[] = [
  { id: "nas-1", name: "Main Router", ip: "192.168.88.1", status: "Online" },
  { id: "nas-2", name: "Backup Router", ip: "192.168.88.2", status: "Offline" },
];

export default function NasPage() {
  const [devices, setDevices] = useState<NasDevice[]>(initialNasDevices);
  const [newIp, setNewIp] = useState("");

  const handleAddDevice = () => {
    if (newIp.trim() === "") return;
    const newDevice: NasDevice = {
      id: `nas-${devices.length + 1}`,
      name: `Router ${devices.length + 1}`,
      ip: newIp,
      status: "Offline",
    };
    setDevices([...devices, newDevice]);
    setNewIp("");
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>NAS Devices</CardTitle>
            <CardDescription>
              Manage your Network Access Servers (Mikrotik Routers).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.ip}</TableCell>
                    <TableCell>
                      <Badge variant={device.status === 'Online' ? 'default' : 'destructive'}
                       className={`${device.status === 'Online' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                       ${device.status === 'Offline' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Test Connection</DropdownMenuItem>
                          <DropdownMenuItem>Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Add New Device</CardTitle>
            <CardDescription>
              Enter the IP address of the Mikrotik router to add it as a NAS device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nas-ip">NAS IP Address</Label>
              <Input 
                id="nas-ip" 
                placeholder="e.g., 192.168.88.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
              />
            </div>
            <Button onClick={handleAddDevice} className="w-full">
              <Server className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
