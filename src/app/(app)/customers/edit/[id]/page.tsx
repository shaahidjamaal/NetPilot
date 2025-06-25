
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useParams } from "next/navigation"
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
import { ArrowLeft, Loader2 } from "lucide-react"
import { usePackages } from "@/hooks/use-packages"
import { useCustomers } from "@/hooks/use-customers"
import { Skeleton } from "@/components/ui/skeleton"
import { useZones } from "@/hooks/use-zones"
import { type Customer } from "@/lib/types"

const editCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  email: z.string().email("Please enter a valid email address."),
  servicePackage: z.string({ required_error: "Please select a service package." }),
  zone: z.string().optional(),
  permanentAddress: z.string().min(10, "Address must be at least 10 characters."),
  installationAddress: z.string().min(10, "Address must be at least 10 characters."),
  sameAsPermanent: z.boolean().default(false).optional(),
  aadharNumber: z.string().regex(/^\d{12}$/, "Please enter a valid 12-digit Aadhar number."),
  aadharUpload: z.any().optional(),
}).refine(data => {
    if (data.sameAsPermanent) {
        return true
    }
    return data.installationAddress?.length >= 10
}, {
    message: "Installation address must be at least 10 characters.",
    path: ["installationAddress"],
})


export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { packages, isLoading: isLoadingPackages } = usePackages()
  const { zones, isLoading: isLoadingZones } = useZones()
  const { getCustomerById, updateCustomer, isLoading: isLoadingCustomers } = useCustomers()
  
  const id = params.id as string
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined)

  const form = useForm<z.infer<typeof editCustomerSchema>>({
    resolver: zodResolver(editCustomerSchema),
  })
  
  React.useEffect(() => {
    if (!isLoadingCustomers && id) {
      const foundCustomer = getCustomerById(id)
      if (foundCustomer) {
        setCustomer(foundCustomer)
        form.reset(foundCustomer)
      } else {
        toast({
            variant: "destructive",
            title: "Customer not found",
            description: `Could not find a customer with ID "${id}".`,
        })
        router.push("/customers")
      }
    }
  }, [isLoadingCustomers, id, getCustomerById, form, router, toast])

  const sameAsPermanent = form.watch("sameAsPermanent");
  const permanentAddress = form.watch("permanentAddress");

  React.useEffect(() => {
    if (sameAsPermanent && permanentAddress) {
      form.setValue("installationAddress", permanentAddress, { shouldValidate: true });
    }
  }, [sameAsPermanent, permanentAddress, form]);


  function onSubmit(values: z.infer<typeof editCustomerSchema>) {
    const { aadharUpload, sameAsPermanent, ...customerData } = values;
    updateCustomer(id, customerData);
    toast({
      title: "Customer Updated Successfully",
      description: `${values.name} has been updated.`,
    })
    router.push("/customers")
  }

  if (isLoadingCustomers || !customer) {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
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
              <CardTitle>Edit Customer: {customer.name}</CardTitle>
              <CardDescription>Update the details for this customer.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6 py-6">
            <div className="grid md:grid-cols-2 gap-6">
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
                  name="servicePackage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Package</FormLabel>
                       {isLoadingPackages ? (
                         <Skeleton className="h-10 w-full" />
                       ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
            <div className="grid md:grid-cols-1 gap-6">
                 <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone</FormLabel>
                       {isLoadingZones ? (
                         <Skeleton className="h-10 w-full" />
                       ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Upload New Aadhar Card</FormLabel>
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
                      Only upload a new file if you want to replace the existing one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
