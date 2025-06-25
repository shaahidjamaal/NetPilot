"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/hooks/use-toast"
import { type AppSettings, idSuffixOptions, idSuffixLabels } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

const settingsSchema = z.object({
  invoicePrefix: z.string().min(1, "Prefix is required.").max(10, "Prefix is too long."),
  invoiceSuffix: z.enum(idSuffixOptions),
  customerIdPrefix: z.string().min(1, "Prefix is required.").max(10, "Prefix is too long."),
  customerIdSuffix: z.enum(idSuffixOptions),
})

export default function SettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
        invoicePrefix: "",
        invoiceSuffix: "date",
        customerIdPrefix: "",
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
      description: "Your new settings have been applied.",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
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
            <Button type="submit">Save Settings</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
