
"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, PlusCircle, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Search, Download, FileUp, ChevronDown } from "lucide-react"
import { format, isBefore } from "date-fns"
import * as XLSX from 'xlsx';

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCustomers, type AddCustomerInput } from "@/hooks/use-customers"
import { useZones } from "@/hooks/use-zones"
import { type Customer } from "@/lib/types"

type SortableColumn = keyof Pick<Customer, 'id' | 'pppoeUsername' | 'name' | 'servicePackage' | 'lastRechargeDate' | 'expiryDate'>;

export default function CustomersPage() {
  const router = useRouter()
  const { customers, deleteCustomer, topUpCustomer, addMultipleCustomers, isLoading } = useCustomers()
  const { zones, isLoading: isLoadingZones } = useZones()
  const { toast } = useToast()
  
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToTopUp, setCustomerToTopUp] = useState<Customer | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableColumn; direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'ascending' });

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])


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
  
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
        const searchLower = searchQuery.toLowerCase();
        
        const inZone = zoneFilter === 'all' || customer.zone === zoneFilter;

        if (!inZone) return false;

        if (searchQuery.trim() === '') return true;

        return (
            customer.name.toLowerCase().includes(searchLower) ||
            customer.id.toLowerCase().includes(searchLower) ||
            (customer.pppoeUsername || '').toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.mobile.includes(searchLower)
        );
    });
  }, [customers, searchQuery, zoneFilter]);


  const requestSort = (key: SortableColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedCustomers = useMemo(() => {
    let sortableItems = [...filteredCustomers];
    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        let comparison = 0;
        if (['lastRechargeDate', 'expiryDate'].includes(sortConfig.key)) {
            const dateA = new Date(aValue as string).getTime();
            const dateB = new Date(bValue as string).getTime();
            if (dateA > dateB) comparison = 1;
            if (dateA < dateB) comparison = -1;
        } else {
            comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
        }

        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [filteredCustomers, sortConfig]);

  const getSortIcon = (name: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== name) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const getPackageStatus = (customer: Customer) => {
    if (customer.status === 'Inactive') {
        return { text: 'Terminated', variant: 'destructive' as const, className: 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' };
    }
    if (isClient && customer.expiryDate && isBefore(new Date(customer.expiryDate), new Date())) {
        return { text: 'Expired', variant: 'secondary' as const, className: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' };
    }
    return { text: 'Active', variant: 'default' as const, className: 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' };
  };

  const handleExport = useCallback((format: 'csv' | 'xlsx') => {
    if (sortedCustomers.length === 0) {
      toast({ variant: 'destructive', title: 'No Data', description: 'There is no data to export.' });
      return;
    }
    
    const dataToExport = sortedCustomers.map(c => ({
      'ID': c.id,
      'Username': c.pppoeUsername || '',
      'Name': c.name,
      'Mobile': c.mobile,
      'Email': c.email,
      'Package': c.servicePackage,
      'Renewed At': c.lastRechargeDate ? format(new Date(c.lastRechargeDate), 'yyyy-MM-dd') : '',
      'Expires At': c.expiryDate ? format(new Date(c.expiryDate), 'yyyy-MM-dd') : '',
      'Status': getPackageStatus(c).text,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, `customers.${format}`);
    
    toast({ title: 'Export Complete', description: `Customer list has been exported as a ${format.toUpperCase()} file.` });
  }, [sortedCustomers, toast, getPackageStatus]);


  const handleImport = async () => {
    if (!importFile) {
        toast({ variant: 'destructive', title: 'No File', description: 'Please select a file to import.' });
        return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];

            const newCustomers: AddCustomerInput[] = json.map(row => ({
                id: String(row.ID || ''),
                name: String(row.Name || ''),
                mobile: String(row.Mobile || ''),
                email: String(row.Email || ''),
                pppoeUsername: String(row.Username || ''),
                pppoePassword: String(row.Password || 'password'), // Default password for import
                customerType: String(row['Customer Type'] || 'Home User') as any,
                servicePackage: String(row.Package || ''),
                permanentAddress: String(row['Address'] || 'N/A'),
                installationAddress: String(row['Address'] || 'N/A'),
                aadharNumber: String(row['Aadhar Number'] || ''),
            })).filter(c => c.id && c.name && c.email && c.mobile);

            if (newCustomers.length > 0) {
              addMultipleCustomers(newCustomers);
              toast({ title: 'Import Successful', description: `${newCustomers.length} customers have been imported.` });
              setIsImportOpen(false);
              setImportFile(null);
            } else {
              toast({ variant: 'destructive', title: 'Import Failed', description: 'No valid customer data found in the file. Check column headers.' });
            }

        } catch (error) {
            console.error('Import error:', error);
            toast({ variant: 'destructive', title: 'Import Error', description: 'Failed to parse the file. Please ensure it is a valid CSV or Excel file.' });
        } finally {
            setIsImporting(false);
        }
    };
    reader.readAsBinaryString(importFile);
  };

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage your customers and view their details.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}><FileUp className="mr-2 h-4 w-4"/> Import</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export <ChevronDown className="ml-2 h-4 w-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>Export as Excel (.xlsx)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/customers/new" passHref>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search customers..."
                    className="w-full rounded-lg bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Select value={zoneFilter} onValueChange={setZoneFilter} disabled={isLoadingZones}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by zone" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {zones.map(zone => (
                        <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('id')} className="-ml-4">
                  ID {getSortIcon('id')}
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort('pppoeUsername')} className="-ml-4">
                  Username {getSortIcon('pppoeUsername')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('name')} className="-ml-4">
                  Name {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Mobile</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('servicePackage')} className="-ml-4">
                  Package {getSortIcon('servicePackage')}
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <Button variant="ghost" onClick={() => requestSort('lastRechargeDate')} className="-ml-4">
                  Renewed At {getSortIcon('lastRechargeDate')}
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <Button variant="ghost" onClick={() => requestSort('expiryDate')} className="-ml-4">
                  Expires At {getSortIcon('expiryDate')}
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.map((customer) => {
                const packageStatus = getPackageStatus(customer);
                return (
                    <TableRow key={customer.id}>
                    <TableCell className="font-mono text-xs">{customer.id}</TableCell>
                    <TableCell>{customer.pppoeUsername || 'N/A'}</TableCell>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">{customer.name}</Link>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.mobile}</TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.email}</TableCell>
                    <TableCell>{customer.servicePackage}</TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.lastRechargeDate ? format(new Date(customer.lastRechargeDate), "PP") : 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{customer.expiryDate ? format(new Date(customer.expiryDate), "PP") : 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant={packageStatus.variant} className={packageStatus.className}>
                            {packageStatus.text}
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
                          <DropdownMenuItem onClick={() => router.push(`/customers/edit/${customer.id}`)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCustomerToTopUp(customer)}>Top-up Data</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(customer)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
            })}
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
    <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add new customers in bulk.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Your file should have the following columns: `ID`, `Name`, `Mobile`, `Email`, `Username`, `Password`, `Customer Type`, `Package`, `Address`, `Aadhar Number`.</p>
            </div>
            <Input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)}
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={!importFile || isImporting}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import Customers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

    
