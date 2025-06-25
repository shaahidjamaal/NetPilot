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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const newPackageSchema = z.object({
  name: z.string().min(3, "Package name must be at least 3 characters."),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be a positive number."),
  validity: z.coerce.number().int().positive("Validity must be a positive number of days."),
  downloadSpeed: z.coerce.number().positive("Download speed must be positive."),
  uploadSpeed: z.coerce.number().positive("Upload speed must be positive."),
  dataLimit: z.string().min(1, "Data limit is required (e.g., 'Unlimited' or '1000 GB')."),
  
  burstEnabled: z.boolean().default(false).optional(),
  burstDownloadSpeed: z.coerce.number().optional(),
  burstUploadSpeed: z.coerce.number().optional(),
  burstThresholdDownload: z.coerce.number().optional(),
  burstThresholdUpload: z.coerce.number().optional(),
  burstTime: z.coerce.number().int().optional(),
}).refine(data => {
    if (data.burstEnabled) {
        return data.burstDownloadSpeed && data.burstUploadSpeed && data.burstThresholdDownload && data.burstThresholdUpload && data.burstTime;
    }
    return true;
}, {
    message: "All burst fields are required when burst is enabled.",
    path: ["burstEnabled"],
});


export default function AddPackagePage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof newPackageSchema>>({
    resolver: zodResolver(newPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      validity: 30,
      downloadSpeed: undefined,
      uploadSpeed: undefined,
      dataLimit: "Unlimited",
      burstEnabled: false,
    },
  })

  const burstEnabled = form.watch("burstEnabled");

  function onSubmit(values: z.infer<typeof newPackageSchema>) {
    console.log(values)
    toast({
      title: "Package Created Successfully",
      description: `${values.name} has been created.`,
    })
    router.push("/plans")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/plans">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
              <CardTitle>Create New Service Package</CardTitle>
              <CardDescription>Fill out the form below to add a new package.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Package Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Fiber 100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="A short description of the package" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (per month)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="3999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validity (days)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                           <FormDescription>Duration of the package in days.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Speed & Data</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="downloadSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download Speed (Mbps)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="uploadSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Speed (Mbps)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="dataLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Limit</FormLabel>
                          <FormControl>
                            <Input placeholder="Unlimited" {...field} />
                          </FormControl>
                          <FormDescription>e.g., "Unlimited" or "1000 GB"</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </div>

            <Separator />

             <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="burstEnabled"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                        <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                        <FormLabel className="text-lg font-medium">
                            Enable Burst Speeds
                        </FormLabel>
                        <FormDescription>
                            Allow temporary speed boosts when the network is not congested.
                        </FormDescription>
                         <FormMessage />
                        </div>
                    </FormItem>
                    )}
                />

                {burstEnabled && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pl-7 border-l-2 ml-2">
                     <FormField
                      control={form.control}
                      name="burstDownloadSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Download (Burst)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="burstUploadSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Upload (Burst)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="burstTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Burst Time (seconds)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="8" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="burstThresholdDownload"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Download Threshold</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="75" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="burstThresholdUpload"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Threshold</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
            </div>
            
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Create Package</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
