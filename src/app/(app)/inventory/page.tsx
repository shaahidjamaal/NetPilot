
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, MoreHorizontal, Loader2, Trash2 } from "lucide-react"

import { useInventory, type AddItemInput } from "@/hooks/use-inventory"
import { useToast } from "@/hooks/use-toast"
import { type InventoryItem, inventoryCategories } from "@/lib/types"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Schema for the form
const inventoryItemSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters."),
  category: z.enum(inventoryCategories, { required_error: "Please select a category." }),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
})

// Item Form Component
function InventoryForm({ item, onFormSubmit, closeDialog }: { item?: InventoryItem, onFormSubmit: (values: AddItemInput) => void, closeDialog: () => void }) {
  const form = useForm<z.infer<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: item ? item : {
      name: "",
      category: undefined,
      stock: 0,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl><Input placeholder="e.g., MikroTik hAP ac3" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {inventoryCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button type="submit">{item ? 'Save Changes' : 'Add Item'}</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// Main Page Component
export default function InventoryPage() {
  const { inventory, addItem, updateItem, deleteItem, isLoading } = useInventory()
  const { toast } = useToast()
  
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<InventoryItem | undefined>(undefined)
  const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | null>(null)

  const openDialogForEdit = (item: InventoryItem) => { setEditingItem(item); setIsFormOpen(true) }
  const openDialogForNew = () => { setEditingItem(undefined); setIsFormOpen(true) }
  
  const handleFormSubmit = (values: z.infer<typeof inventoryItemSchema>) => {
    if (editingItem) {
        updateItem(editingItem.id, values);
        toast({ title: "Item Updated", description: `${values.name} has been updated.` })
    } else {
        addItem(values)
        toast({ title: "Item Added", description: `${values.name} has been added to inventory.` })
    }
    setIsFormOpen(false)
  }

  const handleDeleteItem = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id)
      toast({ title: "Item Deleted", description: `${itemToDelete.name} has been deleted.`, variant: "destructive" })
      setItemToDelete(null)
    }
  }

  const getStatusBadgeVariant = (status: InventoryItem['status']) => {
    switch (status) {
        case 'In Stock': return 'default'
        case 'Low Stock': return 'secondary'
        case 'Out of Stock': return 'destructive'
    }
  }

  const getStatusBadgeClass = (status: InventoryItem['status']) => {
    switch (status) {
        case 'In Stock': return 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400'
        case 'Low Stock': return 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
        case 'Out of Stock': return 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400'
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Track and manage your hardware and equipment.</CardDescription>
            </div>
            <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)} className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => openDialogForEdit(item)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(item)}>
                             <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && inventory.length === 0 && (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg mt-4">
                  Your inventory is empty. Add a new item to get started.
              </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              <DialogDescription>{editingItem ? 'Update the item details below.' : 'Fill in the form to add a new item to your inventory.'}</DialogDescription>
            </DialogHeader>
            <InventoryForm item={editingItem} onFormSubmit={handleFormSubmit} closeDialog={() => setIsFormOpen(false)} />
          </DialogContent>
      </Dialog>

      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the item from your inventory. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteItem} variant="destructive">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
