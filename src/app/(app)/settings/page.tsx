
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"

import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import { type AppSettings, idSuffixOptions, idSuffixLabels, type BillingProfile } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, Settings as SettingsIcon, CreditCard, MessageSquare, Mail, Network, Info, Server, MoreHorizontal, MapPin, Briefcase } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBillingProfile } from "@/hooks/use-billing-profile"


// General Settings Tab Content
const settingsSchema = z.object({
  invoicePrefix: z.string().min(1, "Prefix is required.").max(10, "Prefix is too long."),
  invoiceSuffix: z.enum(idSuffixOptions),
  customerIdPrefix: z.string().min(1, "Prefix is required.").max(10, "Prefix is too long."),
  customerIdSuffix: z.enum(idSuffixOptions),
})

function GeneralSettingsTab() {
  const { settings, updateSettings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
        invoicePrefix: "INV-",
        invoiceSuffix: "date",
        customerIdPrefix: "CUS-",
        customerIdSuffix: "timestamp",
    }
  })

  React.useEffect(() => {
    if (!isLoading && settings) {
      form.reset(settings)
    }
  }, [isLoading, settings, form])

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    updateSettings(values)
    toast({
      title: "Settings Saved",
      description: "Your new general settings have been applied.",
    })
  }

  if (isLoading) {
      return (
          <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage application-wide settings, such as ID generation formats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer ID Generation</h3>
                <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg">
                     <FormField
                        control={form.control}
                        name="customerIdPrefix"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Customer ID Prefix</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., CUS-" {...field} />
                            </FormControl>
                            <FormDescription>The static text that appears at the start of every new customer ID.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="customerIdSuffix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer ID Suffix Format</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a suffix type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {idSuffixOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{idSuffixLabels[opt]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The dynamic part that follows the prefix to ensure uniqueness.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Invoice ID Generation</h3>
                 <div className="grid md:grid-cols-2 gap-6 p-4 border rounded-lg">
                     <FormField
                        control={form.control}
                        name="invoicePrefix"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Invoice ID Prefix</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., INV-" {...field} />
                            </FormControl>
                            <FormDescription>The static text that appears at the start of every new invoice ID.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="invoiceSuffix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice ID Suffix Format</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a suffix type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {idSuffixOptions.map(opt => (
                                        <SelectItem key={opt} value={opt}>{idSuffixLabels[opt]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>The dynamic part that follows the prefix to ensure uniqueness.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save General Settings</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

// Billing Profile Tab
const billingProfileSchema = z.object({
  profileName: z.string().min(1, "Profile name is required."),
  companyName: z.string().min(1, "Company name is required."),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  zip: z.string().min(1, "Zip code is required."),
  phone: z.string().min(1, "Phone number is required."),
  gstNumber: z.string().optional(),
  cgstRate: z.coerce.number().min(0).max(100),
  sgstRate: z.coerce.number().min(0).max(100),
  invoiceTerms: z.string().optional(),
});

function BillingProfileTab() {
  const { profile, updateProfile, isLoading } = useBillingProfile();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof billingProfileSchema>>({
    resolver: zodResolver(billingProfileSchema),
    defaultValues: profile
  });

  React.useEffect(() => {
    if (!isLoading && profile) {
      form.reset(profile);
    }
  }, [isLoading, profile, form]);

  const cgst = form.watch("cgstRate") || 0;
  const sgst = form.watch("sgstRate") || 0;
  const totalGst = cgst + sgst;

  const onSubmit = (values: z.infer<typeof billingProfileSchema>) => {
    updateProfile(values);
    toast({
      title: "Billing Profile Saved",
      description: "Your billing profile has been updated.",
    });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Billing Profile</CardTitle>
            <CardDescription>Manage your company's information for invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="profileName" render={({ field }) => (
                  <FormItem><FormLabel>Profile Name</FormLabel><FormControl><Input placeholder="Main Billing Profile" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Your Company LLC" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
            
            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Address & Contact</h3>
              <div className="grid gap-6">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="123 Business Rd" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Businesstown" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="zip" render={({ field }) => (
                  <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <div className="grid md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <FormField control={form.control} name="gstNumber" render={({ field }) => (
                  <FormItem><FormLabel>GST Number</FormLabel><FormControl><Input placeholder="27ABCDE1234F1Z5" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tax Information</h3>
              <div className="grid md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="cgstRate" render={({ field }) => (
                    <FormItem><FormLabel>CGST Rate</FormLabel><FormControl><div className="relative"><Input type="number" placeholder="9" {...field} /><span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span></div></FormControl><FormMessage /></FormItem>
                  )} />
                 <FormField control={form.control} name="sgstRate" render={({ field }) => (
                    <FormItem><FormLabel>SGST Rate</FormLabel><FormControl><div className="relative"><Input type="number" placeholder="9" {...field} /><span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span></div></FormControl><FormMessage /></FormItem>
                  )} />
                <FormItem>
                  <FormLabel>Total GST Rate</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input value={totalGst} disabled /><span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                </FormItem>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Invoice Terms</h3>
              <FormField control={form.control} name="invoiceTerms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Payment is due within 30 days." className="min-h-24" {...field} /></FormControl>
                  <FormDescription>This will appear on all generated invoices.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Billing Profile</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}


// NAS & IP Pool Tab Content
type NasDevice = { id: string; name: string; ip: string; status: "Online" | "Offline"; };
const initialNasDevices: NasDevice[] = [
  { id: "nas-1", name: "Main Router", ip: "192.168.88.1", status: "Online" },
  { id: "nas-2", name: "Backup Router", ip: "192.168.88.2", status: "Offline" },
];

type IpPool = { id: string; name: string; range: string; };
const initialIpPools: IpPool[] = [
    { id: 'pool-1', name: 'Main Pool', range: '10.10.0.0/24' },
    { id: 'pool-2', name: 'Guest Pool', range: '192.168.88.0/24' },
];

function NasAndIpPoolTab() {
  const [devices, setDevices] = React.useState<NasDevice[]>(initialNasDevices);
  const [newNasIp, setNewNasIp] = React.useState("");
  
  const [pools, setPools] = React.useState<IpPool[]>(initialIpPools)
  const [newPoolName, setNewPoolName] = React.useState("");
  const [newPoolRange, setNewPoolRange] = React.useState("");

  const handleAddDevice = () => {
    if (newNasIp.trim() === "") return;
    const newDevice: NasDevice = {
      id: `nas-${devices.length + 1}`,
      name: `Router ${devices.length + 1}`,
      ip: newNasIp,
      status: "Offline",
    };
    setDevices([...devices, newDevice]);
    setNewNasIp("");
  };

  const handleAddPool = () => {
    if (newPoolName.trim() === "" || newPoolRange.trim() === "") return;
    const newPool: IpPool = {
      id: `pool-${pools.length + 1}`,
      name: newPoolName,
      range: newPoolRange,
    };
    setPools([...pools, newPool]);
    setNewPoolName("");
    setNewPoolRange("");
  };
  
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
          <CardHeader>
            <CardTitle>NAS Devices</CardTitle>
            <CardDescription>Manage your Network Access Servers (e.g., Mikrotik Routers).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.ip}</TableCell>
                    <TableCell>
                      <Badge variant={device.status === 'Online' ? 'default' : 'destructive'}
                       className={`${device.status === 'Online' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
                       ${device.status === 'Offline' ? 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}`}>
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem>Test Connection</DropdownMenuItem><DropdownMenuItem>Remove</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t p-6">
            <div className="flex w-full items-end gap-2">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="nas-ip">Add New NAS Device</Label>
                    <Input id="nas-ip" placeholder="e.g., 192.168.88.1" value={newNasIp} onChange={(e) => setNewNasIp(e.target.value)} />
                </div>
                <Button onClick={handleAddDevice}><Server className="mr-2 h-4 w-4"/> Add</Button>
            </div>
          </CardFooter>
      </Card>
      <Card>
          <CardHeader>
            <CardTitle>IP Pools</CardTitle>
            <CardDescription>Manage IP address pools for assignment.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool Name</TableHead>
                  <TableHead>Range (CIDR)</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pools.map((pool) => (
                  <TableRow key={pool.id}>
                    <TableCell className="font-medium">{pool.name}</TableCell>
                    <TableCell>{pool.range}</TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Remove</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t p-6">
             <div className="flex w-full items-end gap-2">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="pool-name">Pool Name</Label>
                    <Input id="pool-name" placeholder="e.g., Downtown Pool" value={newPoolName} onChange={(e) => setNewPoolName(e.target.value)} />
                </div>
                 <div className="grid w-full gap-1.5">
                    <Label htmlFor="pool-range">Pool Range</Label>
                    <Input id="pool-range" placeholder="e.g., 10.20.30.0/24" value={newPoolRange} onChange={(e) => setNewPoolRange(e.target.value)} />
                </div>
                <Button onClick={handleAddPool}><MapPin className="mr-2 h-4 w-4"/> Add</Button>
            </div>
          </CardFooter>
      </Card>
    </div>
  )
}

function PlaceholderTab({ title, description, content }: { title: string, description: string, content: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">{content}</p>
                </div>
            </CardContent>
        </Card>
    )
}


function AboutTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About NetPilot</CardTitle>
        <CardDescription>ISP Management Suite</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>
          <span className="font-semibold">Version:</span> 1.0.0
        </p>
        <p>
          NetPilot is a comprehensive web application designed to streamline Internet Service Provider (ISP) operations. It integrates with Mikrotik for AAA (Authentication, Authorization, and Accounting) services and provides a suite of tools for customer management, billing, inventory tracking, and more.
        </p>
        <p>
          This application is built with modern technologies including Next.js, React, ShadCN UI, Tailwind CSS, and Genkit for AI-powered features.
        </p>
      </CardContent>
    </Card>
  )
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "general"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your NetPilot application.</p>
      </div>
      <Tabs defaultValue={tab} className="w-full">
        <div className="w-full overflow-x-auto pb-2">
            <TabsList className="w-max">
              <TabsTrigger value="general"><SettingsIcon className="mr-2 h-4 w-4" />General</TabsTrigger>
              <TabsTrigger value="billing"><Briefcase className="mr-2 h-4 w-4" />Billing Profile</TabsTrigger>
              <TabsTrigger value="payment"><CreditCard className="mr-2 h-4 w-4" />Payment</TabsTrigger>
              <TabsTrigger value="sms"><MessageSquare className="mr-2 h-4 w-4" />SMS</TabsTrigger>
              <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" />Email</TabsTrigger>
              <TabsTrigger value="nas"><Network className="mr-2 h-4 w-4" />NAS & IP Pool</TabsTrigger>
              <TabsTrigger value="about"><Info className="mr-2 h-4 w-4" />About</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="general" className="mt-6">
          <GeneralSettingsTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <BillingProfileTab />
        </TabsContent>
        <TabsContent value="payment" className="mt-6">
          <PlaceholderTab 
            title="Payment Gateway Integration" 
            description="Configure settings for your payment provider (e.g., Stripe, Razorpay)." 
            content="Payment gateway settings will be configured here."
          />
        </TabsContent>
        <TabsContent value="sms" className="mt-6">
           <PlaceholderTab 
            title="SMS Gateway Integration" 
            description="Configure your SMS provider to send alerts and notifications." 
            content="SMS gateway settings will be configured here."
          />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
           <PlaceholderTab 
            title="Email Gateway Integration" 
            description="Set up your email service for sending invoices and communications." 
            content="Email gateway settings will be configured here."
          />
        </TabsContent>
        <TabsContent value="nas" className="mt-6">
          <NasAndIpPoolTab />
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <AboutTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Using Suspense for client-side components that use searchParams
export default function SettingsPage() {
    return (
        <React.Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <SettingsPageContent />
        </React.Suspense>
    )
}
