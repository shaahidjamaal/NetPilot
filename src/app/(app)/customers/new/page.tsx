
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { usePackages } from "@/hooks/use-packages"
import { useCustomers } from "@/hooks/use-customers"
import { Skeleton } from "@/components/ui/skeleton"
import { useZones } from "@/hooks/use-zones"
import { Separator } from "@/components/ui/separator"

const newCustomerSchema = z.object({
  id: z.string().min(1, "Customer ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  email: z.string().email("Please enter a valid email address."),
  pppoeUsername: z.string().min(3, "PPPoE username must be at least 3 characters."),
  pppoePassword: z.string().min(6, "Password must be at least 6 characters."),
  customerType: z.enum(["Home User", "Business User", "Wireless User"], { required_error: "Please select a customer type." }),
  gstNumber: z.string().optional(),
  servicePackage: z.string({ required_error: "Please select a service package." }),
  zone: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  permanentAddress: z.string().min(10, "Address must be at least 10 characters."),
  installationAddress: z.string().min(10, "Address must be at least 10 characters."),
  sameAsPermanent: z.boolean().default(false).optional(),
  aadharNumber: z.string().regex(/^\d{12}$/, "Please enter a valid 12-digit Aadhar number."),
  aadharUpload: z.any()
    .refine((files) => files?.length == 1, "Aadhar card upload is required.")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (files) => ["image/jpeg", "image/png", "application/pdf"].includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .pdf files are accepted."
    ),
}).refine(data => {
    if (data.customerType === 'Business User') {
        return !!data.gstNumber && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber);
    }
    return true;
}, {
    message: "A valid GST number is required for Business users",
    path: ["gstNumber"],
}).refine(data => {
    if (data.sameAsPermanent) {
        return true
    }
    return data.installationAddress?.length >= 10
}, {
    message: "Installation address must be at least 10 characters.",
    path: ["installationAddress"],
})


export default function AddCustomerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { packages, isLoading: isLoadingPackages } = usePackages()
  const { zones, isLoading: isLoadingZones } = useZones()
  const { addCustomer } = useCustomers()
  const [showPassword, setShowPassword] = React.useState(false);
  
  const form = useForm<z.infer<typeof newCustomerSchema>>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      id: "",
      name: "",
      mobile: "",
      email: "",
      pppoeUsername: "",
      pppoePassword: "",
      customerType: undefined,
      gstNumber: "",
      servicePackage: undefined,
      zone: undefined,
      discount: 0,
      permanentAddress: "",
      installationAddress: "",
      sameAsPermanent: false,
      aadharNumber: "",
    },
  })
  
  const sameAsPermanent = form.watch("sameAsPermanent");
  const permanentAddress = form.watch("permanentAddress");
  const customerType = form.watch("customerType");

  React.useEffect(() => {
    if (sameAsPermanent && permanentAddress) {
      form.setValue("installationAddress", permanentAddress, { shouldValidate: true });
    }
  }, [sameAsPermanent, permanentAddress, form]);


  function onSubmit(values: z.infer<typeof newCustomerSchema>) {
    const { aadharUpload, sameAsPermanent, ...customerData } = values;
    addCustomer(customerData);
    toast({
      title: "Customer Added Successfully",
      description: `${values.name} has been added to the customer list.`,
    })
    router.push("/customers")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/customers">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>Fill out the form below to add a new customer.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6 py-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CUST001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                            <Input placeholder="9876543210" {...field} />
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
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="customerType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a customer type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Home User">Home User</SelectItem>
                            <SelectItem value="Business User">Business User</SelectItem>
                            <SelectItem value="Wireless User">Wireless User</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     {customerType === 'Business User' && (
                        <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 29AAAAA0000A1Z5" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    )}
                </div>
            </div>
            
            <Separator/>
            
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Service & Package Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="servicePackage"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Service Package</FormLabel>
                        {isLoadingPackages ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {packages.map(pkg => (
                                <SelectItem key={pkg.name} value={pkg.name}>{pkg.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Zone</FormLabel>
                        {isLoadingZones ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a zone for the customer" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {zones.map(zone => (
                                <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        )}
                        <FormDescription>Assign this customer to a service zone for easy sorting and management.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <Separator/>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication & Billing</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pppoeUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PPPoE Username</FormLabel>
                          <FormControl>
                            <Input placeholder="customer.username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pppoePassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PPPoE Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••" 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" placeholder="0" {...field} className="pr-8" onChange={event => field.onChange(event.target.value === '' ? undefined : +event.target.value)} />
                              <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                            </div>
                          </FormControl>
                          <FormDescription>Enter a discount percentage (0-100).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </div>

            <Separator/>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Address & KYC</h3>
                <div className="grid gap-2">
                <FormField
                    control={form.control}
                    name="permanentAddress"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Permanent Address</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Enter the customer's permanent address" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <div className="grid gap-2">
                <FormField
                    control={form.control}
                    name="installationAddress"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Installation Address</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Enter the installation address" {...field} disabled={sameAsPermanent}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sameAsPermanent"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Installation address is the same as permanent address.
                          </FormLabel>
                        </div>
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="aadharNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Aadhar Card Number</FormLabel>
                        <FormControl>
                        <Input placeholder="1234 5678 9012" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="aadharUpload"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                        <FormLabel>Upload Aadhar Card</FormLabel>
                        <FormControl>
                        <Input 
                            type="file" 
                            accept=".jpg, .jpeg, .png, .pdf"
                            onChange={(event) => {
                            onChange(event.target.files);
                            }}
                            {...fieldProps} 
                        />
                        </FormControl>
                        <FormDescription>
                        Upload a scan of the Aadhar card (PDF, JPG, PNG).
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Create Customer</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
