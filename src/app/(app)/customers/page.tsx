
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCustomers } from "@/hooks/use-customers"
import { useZones } from "@/hooks/use-zones"
import { type Customer } from "@/lib/types"

export default function CustomersPage() {
  const router = useRouter()
  const { customers, deleteCustomer, topUpCustomer, isLoading } = useCustomers()
  const { zones, isLoading: isLoadingZones } = useZones()
  const { toast } = useToast()
  
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToTopUp, setCustomerToTopUp] = useState<Customer | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>("");

  const [zoneFilter, setZoneFilter] = useState<string>('all');


  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = () => {
      if (customerToDelete) {
          deleteCustomer(customerToDelete.id);
          toast({
              title: "Customer Deleted",
              description: `${customerToDelete.name} has been removed.`,
          });
          setCustomerToDelete(null);
      }
  };

  const handleConfirmTopUp = () => {
    if (customerToTopUp && topUpAmount) {
        const amount = parseInt(topUpAmount, 10);
        if (!isNaN(amount) && amount > 0) {
            topUpCustomer(customerToTopUp.id, amount);
            toast({
                title: "Top-up Successful",
                description: `${amount}GB has been added to ${customerToTopUp.name}.`,
            });
            setCustomerToTopUp(null);
            setTopUpAmount("");
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid positive number for the top-up amount.",
            });
        }
    }
  };
  
  const filteredCustomers = customers.filter(customer => {
    if (zoneFilter === 'all') return true;
    return customer.zone === zoneFilter;
  });

  if (isLoading) {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }
  
  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage your customers and view their details.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Select value={zoneFilter} onValueChange={setZoneFilter} disabled={isLoadingZones}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by zone" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Zones</SelectItem>
                        {zones.map(zone => (
                            <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Link href="/customers/new" passHref>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Customer
                    </Button>
                </Link>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Service Info</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                <TableCell>
                  <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">{customer.name}</Link>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </TableCell>
                <TableCell>{customer.customerType}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'Active' ? 'default' : customer.status === 'Suspended' ? 'destructive' : 'secondary'}
                   className={`${customer.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                   ${customer.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}
                   ${customer.status === 'Inactive' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{customer.servicePackage}</div>
                  <div className="text-sm text-muted-foreground">{customer.zone || 'No Zone'}</div>
                  {customer.dataTopUp && customer.dataTopUp > 0 ? (
                    <div className="text-sm text-accent">Top-up: {customer.dataTopUp} GB</div>
                  ): null}
                </TableCell>
                <TableCell>{format(new Date(customer.joined), 'yyyy-MM-dd')}</TableCell>
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
                      <DropdownMenuItem onClick={() => router.push(`/customers/edit/${customer.id}`)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCustomerToTopUp(customer)}>Top-up Data</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(customer)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
     {customerToDelete && (
        <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the customer account for {customerToDelete.name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} variant="destructive">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
     <Dialog open={!!customerToTopUp} onOpenChange={(isOpen) => { if(!isOpen) setCustomerToTopUp(null) }}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Add Data Top-up for {customerToTopUp?.name}</DialogTitle>
                <DialogDescription>
                    Enter the amount of data to add (in GB). This will be added to their current top-up balance.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="top-up-amount" className="text-right">Amount (GB)</Label>
                    <Input
                        id="top-up-amount"
                        type="number"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g., 50"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setCustomerToTopUp(null)}>Cancel</Button>
                <Button onClick={handleConfirmTopUp}>Add Top-up</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  )
}
