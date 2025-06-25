"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  recommendServicePackage,
  type RecommendServicePackageOutput,
} from "@/ai/flows/recommend-service-plan";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, CheckCircle, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  customerUsageData: z.string().min(50, {
    message: "Usage data must be at least 50 characters long.",
  }),
  currentServicePackage: z.string().min(2, {
    message: "Current package must be at least 2 characters.",
  }),
  availableServicePackages: z.string().min(2, {
    message: "Please list available packages.",
  }),
});

const exampleUsage = "Data usage: 850GB/month, mostly streaming 4K video and online gaming. Peak bandwidth reaches 90Mbps in the evenings. Occasional large file downloads (50-100GB). Two users working from home with frequent video calls.";
const exampleCurrentPackage = "Fiber 100";
const exampleAvailablePackages = "Basic DSL, Fiber 100, Fiber 500, Fiber 1000";

export default function RecommendationsPage() {
  const [recommendation, setRecommendation] = useState<RecommendServicePackageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerUsageData: "",
      currentServicePackage: "",
      availableServicePackages: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await recommendServicePackage({
        ...values,
        availableServicePackages: values.availableServicePackages.split(",").map((s) => s.trim()),
      });
      setRecommendation(result);
    } catch (error) {
      console.error("Failed to get recommendation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a recommendation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleUseExample() {
    form.reset({
      customerUsageData: exampleUsage,
      currentServicePackage: exampleCurrentPackage,
      availableServicePackages: exampleAvailablePackages,
    });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold tracking-tight">Smart Package Recommendations</h1>
        <p className="mt-2 text-muted-foreground">
          Leverage AI to suggest optimized service packages based on customer usage patterns.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="customerUsageData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Usage Data</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Data usage: 850GB/month, peak bandwidth 90Mbps..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentServicePackage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Service Package</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fiber 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableServicePackages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Service Packages</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Basic DSL, Fiber 100, Fiber 500" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a comma-separated list of packages.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendation
              </Button>
              <Button type="button" variant="outline" onClick={handleUseExample} disabled={isLoading} className="w-full sm:w-auto">
                Use Example Data
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="lg:col-span-3">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>AI Recommendation</CardTitle>
            <CardDescription>The suggested package will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing usage data and finding the best package...</p>
              </div>
            )}
            {recommendation && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-secondary/50 p-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">Recommended Package</p>
                    <p className="text-4xl font-bold text-primary mt-1">{recommendation.recommendedServicePackage}</p>
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent"/>Reasoning</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{recommendation.reasoning}</p>
                </div>
                <Separator />
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-accent"/>Potential Benefits</h3>
                    <p className="text-muted-foreground mt-2 text-sm">{recommendation.potentialBenefits}</p>
                </div>
              </div>
            )}
             {!isLoading && !recommendation && (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border-dashed border-2 rounded-lg">
                <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Your recommendation will be displayed here once generated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
