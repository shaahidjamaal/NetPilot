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
import { ArrowLeft } from "lucide-react"

const newCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  email: z.string().email("Please enter a valid email address."),
  plan: z.string({ required_error: "Please select a service plan." }),
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
  
  const plans = ["Basic DSL", "Fiber 100", "Fiber 500", "Fiber 1000"];

  const form = useForm<z.infer<typeof newCustomerSchema>>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      plan: undefined,
      permanentAddress: "",
      installationAddress: "",
      sameAsPermanent: false,
      aadharNumber: "",
    },
  })
  
  const sameAsPermanent = form.watch("sameAsPermanent");
  const permanentAddress = form.watch("permanentAddress");

  React.useEffect(() => {
    if (sameAsPermanent && permanentAddress) {
      form.setValue("installationAddress", permanentAddress, { shouldValidate: true });
    }
  }, [sameAsPermanent, permanentAddress, form]);


  function onSubmit(values: z.infer<typeof newCustomerSchema>) {
    // In a real app, you'd send this data to your server
    console.log(values)
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
            <Link href="/customers" passHref>
                 <Button variant="outline" size="icon" asChild>
                    <a><ArrowLeft className="h-4 w-4" /></a>
                 </Button>
            </Link>
            <div>
              <CardTitle>Add New Customer</CardTitle>
              <CardDescription>Fill out the form below to add a new customer.</CardDescription>
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
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Plan</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map(plan => (
                            <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Create Customer</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
