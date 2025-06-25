
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, MoreHorizontal, Loader2, Eye, EyeOff } from "lucide-react"

import { useUsers } from "@/hooks/use-users"
import { useRoles } from "@/hooks/use-roles"
import { type User, type Role, type Permission, allPermissions, permissionLabels } from "@/lib/types"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

// Schemas
const userBaseSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  userType: z.enum(["Admin Staff", "Office Staff"], { required_error: "Please select a user type." }),
  designation: z.string().min(2, "Designation must be at least 2 characters."),
  roleId: z.string({ required_error: "Please select a role." }),
  enabled: z.boolean().default(true),
})

const newUserSchema = userBaseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters."),
})

const editUserSchema = userBaseSchema.extend({
  password: z.string().min(6, "New password must be at least 6 characters.").optional().or(z.literal('')),
})

type UserFormValues = z.infer<typeof userBaseSchema> & { password?: string }

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters."),
  description: z.string().min(2, "Description must be at least 2 characters."),
  permissions: z.array(z.string()).min(1, "A role must have at least one permission."),
})

// User Form Component
function UserForm({ user, onFormSubmit, closeDialog }: { user?: User, onFormSubmit: (values: UserFormValues) => void, closeDialog: () => void }) {
  const { roles, isLoading: isLoadingRoles } = useRoles()
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(user ? editUserSchema : newUserSchema),
    defaultValues: user ? {
        ...user,
        password: ""
    } : {
      email: "",
      userType: "Office Staff",
      designation: "",
      roleId: undefined,
      enabled: true,
      password: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input placeholder="user@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{user ? 'New Password' : 'Password'}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              {user && <FormDescription>Leave blank to keep the current password.</FormDescription>}
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a user type" /></SelectTrigger></FormControl>
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
                <FormControl><Input placeholder="e.g., Billing Manager" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                <SelectContent>
                  {isLoadingRoles ? <SelectItem value="loading" disabled>Loading roles...</SelectItem> : roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div>
                        <FormLabel>Enable User Account</FormLabel>
                        <FormDescription>Disabled users cannot log in.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
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

// User Management Tab Component
function UserManagementTab() {
  const { users, addUser, updateUser, deleteUser, isLoading: isLoadingUsers } = useUsers()
  const { roles, getRoleById } = useRoles()
  const { toast } = useToast()
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | undefined>(undefined)

  const openDialogForEdit = (user: User) => { setEditingUser(user); setIsUserDialogOpen(true) }
  const openDialogForNew = () => { setEditingUser(undefined); setIsUserDialogOpen(true) }

  const handleFormSubmit = (values: UserFormValues) => {
    if (editingUser) {
        const updateData: Partial<User> = { ...values };
        if (!values.password) {
            delete updateData.password;
        }
        updateUser(editingUser.id, updateData);
        toast({ title: "User Updated", description: `${values.email} has been updated.` })
    } else {
        addUser(values as Omit<User, 'id'>)
        toast({ title: "User Created", description: `${values.email} has been created.` })
    }
    setIsUserDialogOpen(false)
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
              <CardTitle>Users</CardTitle>
              <CardDescription>Add, edit, and manage staff accounts.</CardDescription>
            </div>
            <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
          </div>
        </CardHeader>
        <CardContent>
            {isLoadingUsers ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length > 0 ? users.map((user) => {
                            const role = getRoleById(user.roleId);
                            return (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.designation}</TableCell>
                                <TableCell><Badge variant="secondary">{role?.name || 'N/A'}</Badge></TableCell>
                                <TableCell>
                                    <Badge variant={user.enabled ? 'default' : 'secondary'} className={user.enabled ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}>
                                        {user.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => openDialogForEdit(user)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )}) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>{editingUser ? 'Update the user details below.' : 'Fill in the form to create a new user account.'}</DialogDescription>
            </DialogHeader>
            <UserForm user={editingUser} onFormSubmit={handleFormSubmit} closeDialog={() => setIsUserDialogOpen(false)} />
          </DialogContent>
      </Dialog>
    </>
  )
}

// Role Form Component
function RoleForm({ role, onFormSubmit, closeDialog }: { role?: Role, onFormSubmit: (values: z.infer<typeof roleSchema>) => void, closeDialog: () => void }) {
  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: role || {
      name: "",
      description: "",
      permissions: [],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Role Name</FormLabel><FormControl><Input placeholder="e.g., Billing Manager" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="A short description of what this role can do." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="permissions" render={() => (
            <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormDescription>Select the permissions for this role.</FormDescription>
                <ScrollArea className="h-64 rounded-md border p-4">
                    <div className="grid grid-cols-2 gap-4">
                    {allPermissions.map((permissionId) => (
                        <FormField key={permissionId} control={form.control} name="permissions" render={({ field }) => (
                            <FormItem key={permissionId} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(permissionId)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, permissionId])
                                            : field.onChange(field.value?.filter((value) => value !== permissionId))
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">{permissionLabels[permissionId]}</FormLabel>
                            </FormItem>
                        )} />
                    ))}
                    </div>
                </ScrollArea>
                <FormMessage />
            </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
          <Button type="submit">{role ? 'Save Changes' : 'Create Role'}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// Role Management Tab Component
function RoleManagementTab() {
  const { roles, addRole, updateRole, deleteRole, isLoading: isLoadingRoles } = useRoles()
  const { toast } = useToast()
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<Role | undefined>(undefined)

  const openDialogForEdit = (role: Role) => { setEditingRole(role); setIsRoleDialogOpen(true) }
  const openDialogForNew = () => { setEditingRole(undefined); setIsRoleDialogOpen(true) }

  const handleFormSubmit = (values: z.infer<typeof roleSchema>) => {
    if (editingRole) {
        updateRole(editingRole.id, values as Omit<Role, 'id'>)
        toast({ title: "Role Updated", description: `${values.name} has been updated.` })
    } else {
        addRole(values as Omit<Role, 'id'>)
        toast({ title: "Role Created", description: `${values.name} has been created.` })
    }
    setIsRoleDialogOpen(false)
  }

  const handleDeleteRole = (role: Role) => {
      deleteRole(role.id)
      toast({ title: "Role Deleted", description: `${role.name} has been deleted.`, variant: "destructive" })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles</CardTitle>
              <CardDescription>Define roles and assign permissions to them.</CardDescription>
            </div>
            <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4" /> Add Role</Button>
          </div>
        </CardHeader>
        <CardContent>
            {isLoadingRoles ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.length > 0 ? roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell className="text-muted-foreground">{role.description}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {role.permissions.slice(0, 3).map(p => <Badge key={p} variant="outline">{permissionLabels[p]}</Badge>)}
                                    {role.permissions.length > 3 && <Badge variant="outline">+{role.permissions.length - 3} more</Badge>}
                                  </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => openDialogForEdit(role)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteRole(role)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No roles found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
              <DialogDescription>{editingRole ? 'Update the role details below.' : 'Fill in the form to create a new role.'}</DialogDescription>
            </DialogHeader>
            <RoleForm role={editingRole} onFormSubmit={handleFormSubmit} closeDialog={() => setIsRoleDialogOpen(false)} />
          </DialogContent>
      </Dialog>
    </>
  )
}


export default function AdminPage() {
    return (
        <Tabs defaultValue="users" className="w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Control Center</CardTitle>
                    <CardDescription>
                        Manage staff accounts, roles, and system-wide permissions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="roles">Role Management</TabsTrigger>
                    </TabsList>
                </CardContent>
            </Card>

            <TabsContent value="users" className="mt-6">
                <UserManagementTab />
            </TabsContent>
            <TabsContent value="roles" className="mt-6">
                <RoleManagementTab />
            </TabsContent>
        </Tabs>
    )
}
