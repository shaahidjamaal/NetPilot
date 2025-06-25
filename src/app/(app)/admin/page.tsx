"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, MoreHorizontal } from "lucide-react"

import { useUsers } from "@/hooks/use-users"
import { type User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const userSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  userType: z.enum(["Admin Staff", "Office Staff"], { required_error: "Please select a user type." }),
  designation: z.string().min(2, "Designation must be at least 2 characters."),
  canViewInvoice: z.boolean().default(false),
  canReceivePayment: z.boolean().default(false),
  enabled: z.boolean().default(true),
})

function UserForm({ user, onFormSubmit, closeDialog }: { user?: User, onFormSubmit: (values: z.infer<typeof userSchema>) => void, closeDialog: () => void }) {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      email: "",
      userType: "Office Staff",
      designation: "",
      canViewInvoice: false,
      canReceivePayment: false,
      enabled: true,
    },
  })

  function onSubmit(values: z.infer<typeof userSchema>) {
    onFormSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Admin Staff">Admin Staff</SelectItem>
                    <SelectItem value="Office Staff">Office Staff</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Billing Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">Permissions</h4>
            <FormField
                control={form.control}
                name="canViewInvoice"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel>Can View Invoices</FormLabel>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="canReceivePayment"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel>Can Receive Payments</FormLabel>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
         <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div>
                        <FormLabel>Enable User Account</FormLabel>
                        <FormDescription>Disabled users cannot log in.</FormDescription>
                    </div>
                    <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
        <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}


export default function AdminPage() {
  const { users, addUser, updateUser, deleteUser, isLoading } = useUsers()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined)

  const openDialogForEdit = (user: User) => {
      setEditingUser(user)
      setIsDialogOpen(true)
  }
  
  const openDialogForNew = () => {
      setEditingUser(undefined)
      setIsDialogOpen(true)
  }

  const handleFormSubmit = (values: z.infer<typeof userSchema>) => {
    if (editingUser) {
        updateUser(editingUser.id, values)
        toast({ title: "User Updated", description: `${values.email} has been updated.` })
    } else {
        addUser(values)
        toast({ title: "User Created", description: `${values.email} has been created.` })
    }
    setIsDialogOpen(false)
  }

  const handleDeleteUser = (user: User) => {
      deleteUser(user.id)
      toast({ title: "User Deleted", description: `${user.email} has been deleted.`, variant: "destructive" })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Add, edit, and manage staff accounts.</CardDescription>
            </div>
            <Button onClick={openDialogForNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.userType}</TableCell>
                                <TableCell>{user.designation}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {user.canViewInvoice && <Badge variant="secondary">Invoices</Badge>}
                                        {user.canReceivePayment && <Badge variant="secondary">Payments</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.enabled ? 'default' : 'secondary'}
                                        className={user.enabled ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}>
                                        {user.enabled ? 'Enabled' : 'Disabled'}
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
                                        <DropdownMenuItem onClick={() => openDialogForEdit(user)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update the user details below.' : 'Fill in the form to create a new user account.'}
              </DialogDescription>
            </DialogHeader>
            <UserForm 
                user={editingUser}
                onFormSubmit={handleFormSubmit}
                closeDialog={() => setIsDialogOpen(false)}
            />
          </DialogContent>
      </Dialog>
    </>
  )
}
