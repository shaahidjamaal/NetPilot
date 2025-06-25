
"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useCustomers } from "@/hooks/use-customers"
import { usePackages } from "@/hooks/use-packages"
import { useToast } from "@/hooks/use-toast"
import { type Customer } from "@/lib/types"
import { useInvoices } from "@/hooks/use-invoices"
import { usePayments } from "@/hooks/use-payments"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Loader2, User, Wifi, FileText, History, Repeat, Replace, PlusCircle, CalendarOff, CircleSlash } from "lucide-react"
import { format, addDays } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="font-medium">{value || "-"}</div>
        </div>
    )
}

export default function CustomerDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const { getCustomerById, customers, isLoading: isLoadingCustomers, topUpCustomer, terminateCustomer, updateCustomer } = useCustomers()
    const { packages } = usePackages()
    const { addInvoice, markAsPaid } = useInvoices()
    const { addPayment } = usePayments()

    const id = params.id as string
    const [customer, setCustomer] = React.useState<Customer | undefined>(undefined)
    const [isTopUpOpen, setIsTopUpOpen] = React.useState(false)
    const [topUpAmount, setTopUpAmount] = React.useState("")
    const [isTerminateOpen, setIsTerminateOpen] = React.useState(false)

    React.useEffect(() => {
        if (!isLoadingCustomers && id) {
            const foundCustomer = getCustomerById(id)
            if (foundCustomer) {
                setCustomer(foundCustomer)
            } else {
                toast({
                    variant: "destructive",
                    title: "Customer not found",
                    description: `Could not find a customer with ID "${id}".`,
                })
                router.push("/customers")
            }
        }
    }, [isLoadingCustomers, id, getCustomerById, router, toast, customers])
    
    const currentPackage = packages.find(p => p.name === customer?.servicePackage);

    const handleRenewPackage = () => {
        if (!customer || !currentPackage) {
            toast({ variant: "destructive", title: "Error", description: "Customer or package information is missing." });
            return;
        }

        // 1. Create a new invoice
        const newInvoice = addInvoice({
            customerId: customer.id,
            packageName: currentPackage.name,
        });
        
        if (newInvoice) {
            // 2. Mark as paid
            markAsPaid(newInvoice.id);

            // 3. Create payment record
            addPayment({
                invoiceId: newInvoice.id,
                customerId: customer.id,
                customerName: customer.name,
                amount: newInvoice.amount,
                method: "Admin Renewal",
                status: "Completed",
                transactionId: `renew-${new Date().getTime()}`,
            });

            // 4. Update customer dates and status
            const today = new Date();
            updateCustomer(customer.id, {
                lastRechargeDate: today.toISOString(),
                expiryDate: addDays(today, currentPackage.validity || 30).toISOString(),
                status: 'Active'
            });

            // 5. Toast
            toast({
                title: "Package Renewed",
                description: `${customer.name}'s package has been renewed successfully.`,
            });
        } else {
             toast({ variant: "destructive", title: "Error", description: "Failed to create an invoice for renewal." });
        }
    }


    const handleConfirmTopUp = () => {
        if (customer && topUpAmount) {
            const amount = parseInt(topUpAmount, 10);
            if (!isNaN(amount) && amount > 0) {
                topUpCustomer(customer.id, amount);
                toast({
                    title: "Top-up Successful",
                    description: `${amount}GB has been added to ${customer.name}.`,
                });
                setIsTopUpOpen(false);
                setTopUpAmount("");
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid Amount",
                    description: "Please enter a valid positive number.",
                });
            }
        }
    };
    
    const handleConfirmTerminate = () => {
        if (customer) {
            terminateCustomer(customer.id);
            toast({
                title: "Customer Terminated",
                description: `${customer.name}'s status has been set to Inactive.`,
            });
            setIsTerminateOpen(false);
        }
    }

    if (isLoadingCustomers || !customer) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }


    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/customers">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {customer.name}
                                    <Badge variant={customer.status === 'Active' ? 'default' : customer.status === 'Suspended' ? 'destructive' : 'secondary'}
                                        className={`${customer.status === 'Active' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                                        ${customer.status === 'Suspended' ? 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}
                                        ${customer.status === 'Inactive' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                                        {customer.status}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>Account No: {customer.id}</CardDescription>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href={`/customers/edit/${customer.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Customer
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general"><User className="mr-2 h-4 w-4" />General Details</TabsTrigger>
                    <TabsTrigger value="connection"><Wifi className="mr-2 h-4 w-4" />Connection Details</TabsTrigger>
                    <TabsTrigger value="kyc"><FileText className="mr-2 h-4 w-4" />KYC Documents</TabsTrigger>
                    <TabsTrigger value="audit"><History className="mr-2 h-4 w-4" />Audit Trail</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <DetailItem label="Full Name" value={customer.name} />
                            <DetailItem label="Email Address" value={customer.email} />
                            <DetailItem label="Mobile Number" value={customer.mobile} />
                            <DetailItem label="Customer Type" value={customer.customerType} />
                            {customer.customerType === 'Business User' && (
                                <DetailItem label="GST Number" value={customer.gstNumber} />
                            )}
                            <DetailItem label="Zone" value={customer.zone} />
                            <DetailItem label="Joined On" value={format(new Date(customer.joined), "PPP")} />
                            <DetailItem label="Permanent Address" value={<p className="whitespace-pre-wrap">{customer.permanentAddress}</p>} />
                            <DetailItem label="Installation Address" value={<p className="whitespace-pre-wrap">{customer.installationAddress}</p>} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="connection">
                     <div className="grid gap-6 md:grid-cols-3">
                         <div className="md:col-span-2">
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Package, Usage & Authentication</CardTitle>
                                 </CardHeader>
                                 <CardContent className="grid gap-6 md:grid-cols-2">
                                     <DetailItem label="Current Package" value={customer.servicePackage} />
                                     <DetailItem label="Data Limit" value={currentPackage?.dataLimit || "N/A"} />
                                     <DetailItem label="Download Speed" value={`${currentPackage?.downloadSpeed || 'N/A'} Mbps`} />
                                     <DetailItem label="Upload Speed" value={`${currentPackage?.uploadSpeed || 'N/A'} Mbps`} />
                                     <DetailItem label="PPPoE Username" value={customer.pppoeUsername} />
                                     <DetailItem label="Discount" value={customer.discount ? `${customer.discount}%` : 'N/A'} />
                                     <DetailItem label="Last Recharge" value={customer.lastRechargeDate ? format(new Date(customer.lastRechargeDate), "PPP") : 'N/A'} />
                                     <DetailItem label="Expires At" value={customer.expiryDate ? format(new Date(customer.expiryDate), "PPP") : 'N/A'} />
                                     <DetailItem label="Data Top-up Balance" value={`${customer.dataTopUp || 0} GB`} />
                                     <DetailItem label="Package Used" value="Data usage info will be here." />
                                 </CardContent>
                             </Card>
                         </div>
                         <div>
                             <Card>
                                 <CardHeader>
                                     <CardTitle>Actions</CardTitle>
                                 </CardHeader>
                                 <CardContent className="flex flex-col gap-3">
                                     <Button onClick={handleRenewPackage}><Repeat className="mr-2 h-4 w-4" />Renew Package</Button>
                                     <Button variant="secondary" disabled><Replace className="mr-2 h-4 w-4" />Change Package</Button>
                                     <Button variant="secondary" onClick={() => setIsTopUpOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Top-up Data</Button>
                                     <Button variant="secondary" disabled><CalendarOff className="mr-2 h-4 w-4" />Change Expiry</Button>
                                     <Button variant="destructive" onClick={() => setIsTerminateOpen(true)}><CircleSlash className="mr-2 h-4 w-4" />Terminate</Button>
                                 </CardContent>
                             </Card>
                         </div>
                     </div>
                </TabsContent>
                <TabsContent value="kyc">
                    <Card>
                        <CardHeader>
                            <CardTitle>KYC Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                           <DetailItem label="Aadhar Card Number" value={customer.aadharNumber} />
                           <div className="flex items-center justify-center text-muted-foreground col-span-full h-48 border-2 border-dashed rounded-lg">
                                (KYC Document viewer will be implemented here)
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="audit">
                     <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="flex items-center justify-center text-muted-foreground h-48 border-2 border-dashed rounded-lg">
                                (Customer event log will be implemented here)
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Data Top-up for {customer?.name}</DialogTitle>
                        <DialogDescription>
                            Enter the amount of data to add (in GB).
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
                        <Button variant="outline" onClick={() => setIsTopUpOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmTopUp}>Add Top-up</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isTerminateOpen} onOpenChange={setIsTerminateOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will terminate the customer's service and change their status to 'Inactive'. This can be reverted later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmTerminate} variant="destructive">
                            Terminate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
