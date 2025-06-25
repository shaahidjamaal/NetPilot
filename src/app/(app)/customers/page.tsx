"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MoreHorizontal, PlusCircle } from "lucide-react"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialCustomers = [
  { id: "cus_1", name: "John Doe", email: "john.doe@example.com", plan: "Fiber 100", status: "Active", joined: "2023-01-15" },
  { id: "cus_2", name: "Jane Smith", email: "jane.smith@example.com", plan: "Basic DSL", status: "Active", joined: "2022-11-30" },
  { id: "cus_3", name: "Mike Johnson", email: "mike.j@example.com", plan: "Fiber 500", status: "Suspended", joined: "2023-03-20" },
  { id: "cus_4", name: "Emily Davis", email: "emily.d@example.com", plan: "Fiber 1000", status: "Active", joined: "2021-08-10" },
  { id: "cus_5", name: "Chris Wilson", email: "chris.w@example.com", plan: "Basic DSL", status: "Inactive", joined: "2023-05-01" },
  { id: "cus_6", name: "Sarah Brown", email: "sarah.b@example.com", plan: "Fiber 100", status: "Active", joined: "2023-09-22" },
]

const addCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  plan: z.string({ required_error: "Please select a service plan." }),
})

type Customer = typeof initialCustomers[0];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof addCustomerSchema>>({
    resolver: zodResolver(addCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      plan: undefined,
    },
  })

  function onSubmit(values: z.infer<typeof addCustomerSchema>) {
    const newCustomer: Customer = {
      id: `cus_${customers.length + 1}`,
      name: values.name,
      email: values.email,
      plan: values.plan,
      status: "Active",
      joined: new Date().toISOString().split('T')[0],
    }
    setCustomers([newCustomer, ...customers])
    toast({
      title: "Customer Added",
      description: `${values.name} has been successfully added.`,
    })
    form.reset();
    setIsDialogOpen(false);
  }
  
  const plans = ["Basic DSL", "Fiber 100", "Fiber 500", "Fiber 1000"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage your customers and view their details.</CardDescription>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new customer below.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Plan</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {plans.map(plan => (
                                <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Add Customer</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Service Plan</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
                <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'Active' ? 'default' : customer.status === 'Suspended' ? 'destructive' : 'secondary'}
                   className={`${customer.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                   ${customer.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}
                   ${customer.status === 'Inactive' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>{customer.plan}</TableCell>
                <TableCell>{customer.joined}</TableCell>
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
