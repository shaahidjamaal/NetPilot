
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { PlusCircle, MoreHorizontal, Loader2, Trash2 } from "lucide-react"

import { useTickets, type AddTicketInput, type UpdateTicketInput } from "@/hooks/use-tickets"
import { useCustomers } from "@/hooks/use-customers"
import { useUsers } from "@/hooks/use-users"
import { useToast } from "@/hooks/use-toast"
import { type Ticket, ticketStatuses, ticketPriorities, type TicketStatus, type TicketPriority } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Schema for the form
const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  customerId: z.string({ required_error: "Please select a customer." }),
  priority: z.enum(ticketPriorities, { required_error: "Please select a priority." }),
  status: z.enum(ticketStatuses, { required_error: "Please select a status." }),
  assigneeId: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters long."),
})

// Item Form Component
function TicketForm({ ticket, onFormSubmit, closeDialog }: { ticket?: Ticket, onFormSubmit: (values: z.infer<typeof ticketSchema>) => void, closeDialog: () => void }) {
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  const { users, isLoading: isLoadingUsers } = useUsers();

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket ? {
        ...ticket,
        assigneeId: ticket.assigneeId || undefined,
    } : {
      subject: "",
      customerId: undefined,
      priority: "Medium",
      status: "Open",
      assigneeId: undefined,
      description: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl><Input placeholder="e.g., Internet Connection Down" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCustomers}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>{customer.name} ({customer.id})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ticketStatuses.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a priority" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {ticketPriorities.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingUsers}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Textarea
                    placeholder="Provide a detailed description of the issue."
                    className="min-h-[120px]"
                    {...field}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button type="submit">{ticket ? 'Save Changes' : 'Create Ticket'}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// Main Page Component
export default function TicketsPage() {
  const { tickets, addTicket, updateTicket, deleteTicket, isLoading } = useTickets()
  const { users, isLoading: isLoadingUsers } = useUsers()
  const { customers, isLoading: isLoadingCustomers } = useCustomers();
  const { toast } = useToast()
  
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingTicket, setEditingTicket] = React.useState<Ticket | undefined>(undefined)
  const [ticketToDelete, setTicketToDelete] = React.useState<Ticket | null>(null)

  const openDialogForEdit = (ticket: Ticket) => { setEditingTicket(ticket); setIsFormOpen(true) }
  const openDialogForNew = () => { setEditingTicket(undefined); setIsFormOpen(true) }
  
  const handleFormSubmit = (values: z.infer<typeof ticketSchema>) => {
    const customer = customers.find(c => c.id === values.customerId)
    if (!customer) {
        toast({ variant: "destructive", title: "Error", description: "Selected customer not found."})
        return;
    }

    const submissionData = {
        ...values,
        assigneeId: values.assigneeId === 'unassigned' ? undefined : values.assigneeId
    };

    if (editingTicket) {
        updateTicket(editingTicket.id, submissionData, customer.name);
        toast({ title: "Ticket Updated", description: `Ticket #${editingTicket.id} has been updated.` })
    } else {
        const newTicket = addTicket(submissionData, customer.name)
        toast({ title: "Ticket Created", description: `Ticket #${newTicket.id} has been created.` })
    }
    setIsFormOpen(false)
  }

  const handleDeleteTicket = () => {
    if (ticketToDelete) {
      deleteTicket(ticketToDelete.id)
      toast({ title: "Ticket Deleted", description: `Ticket #${ticketToDelete.id} has been deleted.`, variant: "destructive" })
      setTicketToDelete(null)
    }
  }
  
  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
        case 'Open': return 'destructive'
        case 'In Progress': return 'secondary'
        case 'Closed': return 'default'
    }
  }

  const getStatusBadgeClass = (status: TicketStatus) => {
     switch (status) {
        case 'Open': return 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400'
        case 'In Progress': return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
        case 'Closed': return 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400'
    }
  }
  
  const getPriorityBadgeVariant = (priority: TicketPriority) => {
    switch (priority) {
        case 'High': return 'destructive'
        case 'Medium': return 'secondary'
        case 'Low': return 'outline'
    }
  }
  
  const pageIsLoading = isLoading || isLoadingUsers || isLoadingCustomers;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Track and manage customer support tickets.</CardDescription>
            </div>
            <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4" /> Create Ticket</Button>
          </div>
        </CardHeader>
        <CardContent>
          {pageIsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => {
                  const assignee = users.find(u => u.id === ticket.assigneeId);
                  return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-xs text-muted-foreground">{ticket.id}</div>
                        </TableCell>
                        <TableCell>{ticket.customerName}</TableCell>
                        <TableCell>
                            {assignee ? (
                                <Badge variant="outline">{assignee.email}</Badge>
                            ) : (
                                <span className="text-muted-foreground text-sm">Unassigned</span>
                            )}
                        </TableCell>
                        <TableCell>
                            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                                {ticket.priority}
                            </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(ticket.status)} className={getStatusBadgeClass(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(ticket.updatedAt), "PPp")}</TableCell>
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
                              <DropdownMenuItem onClick={() => openDialogForEdit(ticket)}>View / Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setTicketToDelete(ticket)}>
                                 <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
           {!pageIsLoading && tickets.length === 0 && (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
                  No support tickets found. Create one to get started.
              </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTicket ? `Edit Ticket #${editingTicket.id}` : 'Create New Support Ticket'}</DialogTitle>
              <DialogDescription>{editingTicket ? 'Update the ticket details below.' : 'Fill in the form to create a new support ticket.'}</DialogDescription>
            </DialogHeader>
            <TicketForm ticket={editingTicket} onFormSubmit={handleFormSubmit} closeDialog={() => setIsFormOpen(false)} />
          </DialogContent>
      </Dialog>

      {ticketToDelete && (
        <AlertDialog open={!!ticketToDelete} onOpenChange={() => setTicketToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete ticket #{ticketToDelete.id}. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTicket} variant="destructive">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
