"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, PlusCircle, Trash2, Loader2 } from "lucide-react"
import { usePackages } from "@/hooks/use-packages"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useToast } from "@/hooks/use-toast"
import { type Package } from "@/lib/types"

export default function PackagesPage() {
  const router = useRouter();
  const { packages, isLoading, deletePackage } = usePackages()
  const [packageToDelete, setPackageToDelete] = React.useState<Package | null>(null);
  const { toast } = useToast()

  const handleDelete = () => {
      if (packageToDelete) {
          deletePackage(packageToDelete.name);
          toast({
              title: "Package Deleted",
              description: `The package "${packageToDelete.name}" has been deleted.`,
              variant: "destructive"
          });
          setPackageToDelete(null);
      }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Service Packages</h1>
              <p className="text-muted-foreground">Create, modify, and track various service packages.</p>
            </div>
            <Link href="/plans/new" passHref>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Package
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Speed (Down/Up)</TableHead>
                  <TableHead>Data Limit</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length > 0 ? packages.map((pkg) => (
                  <TableRow key={pkg.name}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pkg.packageType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {pkg.downloadSpeed} / {pkg.uploadSpeed} Mbps
                    </TableCell>
                    <TableCell>{pkg.dataLimit}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/plans/edit/${encodeURIComponent(pkg.name)}`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setPackageToDelete(pkg)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No service packages found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {packageToDelete && (
        <AlertDialog open={!!packageToDelete} onOpenChange={() => setPackageToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the package "{packageToDelete.name}". This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} variant="destructive">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
