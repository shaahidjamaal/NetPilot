"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { PlusCircle, MoreHorizontal, Loader2, Trash2 } from "lucide-react"

import { useLeads, type AddLeadInput, type UpdateLeadInput } from "@/hooks/use-leads"
import { useUsers } from "@/hooks/use-users"
import { useToast } from "@/hooks/use-toast"
import { type Lead, leadStatuses, leadSources, type LeadStatus, type LeadSource } from "@/lib/types"

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
const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  address: z.string().min(5, "Address must be at least 5 characters long."),
  source: z.enum(leadSources, { required_error: "Please select a source." }),
  status: z.enum(leadStatuses, { required_error: "Please select a status." }),
  assigneeId: z.string().optional(),
  notes: z.string().optional(),
})

// Item Form Component
function LeadForm({ lead, onFormSubmit, closeDialog }: { lead?: Lead, onFormSubmit: (values: z.infer<typeof leadSchema>) => void, closeDialog: () => void }) {
  const { users, isLoading: isLoadingUsers } = useUsers();

  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead ? {
        ...lead,
        assigneeId: lead.assigneeId || undefined,
    } : {
      name: "",
      email: "",
      mobile: "",
      address: "",
      source: undefined,
      status: "New",
      assigneeId: undefined,
      notes: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="mobile" render={({ field }) => (
                <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="123 Main St, Anytown" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                  <SelectContent>{leadStatuses.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
           <FormField control={form.control} name="source" render={({ field }) => (
              <FormItem><FormLabel>Source</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger></FormControl>
                  <SelectContent>{leadSources.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
           <FormField control={form.control} name="assigneeId" render={({ field }) => (
              <FormItem><FormLabel>Assign To</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingUsers}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map(user => (<SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>))}
                    </SelectContent>
                </Select><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Add any relevant notes about the lead..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button type="submit">{lead ? 'Save Changes' : 'Create Lead'}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// Main Page Component
export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, isLoading } = useLeads()
  const { users, isLoading: isLoadingUsers } = useUsers()
  const { toast } = useToast()
  
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingLead, setEditingLead] = React.useState<Lead | undefined>(undefined)
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null)

  const openDialogForEdit = (lead: Lead) => { setEditingLead(lead); setIsFormOpen(true) }
  const openDialogForNew = () => { setEditingLead(undefined); setIsFormOpen(true) }
  
  const handleFormSubmit = (values: z.infer<typeof leadSchema>) => {
    const submissionData = { ...values, assigneeId: values.assigneeId === 'unassigned' ? undefined : values.assigneeId };

    if (editingLead) {
        updateLead(editingLead.id, submissionData);
        toast({ title: "Lead Updated", description: `${values.name} has been updated.` })
    } else {
        addLead(submissionData)
        toast({ title: "Lead Created", description: `${values.name} has been added.` })
    }
    setIsFormOpen(false)
  }

  const handleDeleteLead = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id)
      toast({ title: "Lead Deleted", description: `${leadToDelete.name} has been deleted.`, variant: "destructive" })
      setLeadToDelete(null)
    }
  }

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
        case 'Lost': return 'destructive'
        case 'New': return 'secondary'
        case 'Converted': return 'default'
        default: return 'outline'
    }
  }

  const getStatusBadgeClass = (status: LeadStatus) => {
     switch (status) {
        case 'Contacted': return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
        case 'Qualified': return 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400'
        default: return ''
    }
  }
  
  const pageIsLoading = isLoading || isLoadingUsers;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads Management</CardTitle>
              <CardDescription>Track and manage potential new customers.</CardDescription>
            </div>
            <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4" /> Add Lead</Button>
          </div>
        </CardHeader>
        <CardContent>
          {pageIsLoading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const assignee = users.find(u => u.id === lead.assigneeId);
                  return (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                            <div>{lead.email}</div>
                            <div className="text-sm text-muted-foreground">{lead.mobile}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{lead.source}</Badge></TableCell>
                        <TableCell>
                            {assignee ? (<Badge variant="secondary">{assignee.email}</Badge>) : (<span className="text-muted-foreground text-sm">Unassigned</span>)}
                        </TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(lead.status)} className={getStatusBadgeClass(lead.status)}>{lead.status}</Badge></TableCell>
                        <TableCell>{format(new Date(lead.updatedAt), "PP")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openDialogForEdit(lead)}>View / Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setLeadToDelete(lead)}>
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
           {!pageIsLoading && leads.length === 0 && (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
                  No leads found. Create one to get started.
              </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLead ? `Edit Lead: ${editingLead.name}` : 'Create New Lead'}</DialogTitle>
              <DialogDescription>{editingLead ? 'Update the lead details below.' : 'Fill in the form to create a new lead.'}</DialogDescription>
            </DialogHeader>
            <LeadForm lead={editingLead} onFormSubmit={handleFormSubmit} closeDialog={() => setIsFormOpen(false)} />
          </DialogContent>
      </Dialog>

      {leadToDelete && (
        <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete the lead for {leadToDelete.name}. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteLead} variant="destructive">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
