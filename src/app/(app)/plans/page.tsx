
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Gauge, PlusCircle, Upload, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePackages } from "@/hooks/use-packages"

export default function PackagesPage() {
  const { packages, isLoading } = usePackages()

  return (
    <div className="flex flex-col gap-8">
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <Card key={pkg.name} className="flex flex-col">
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-primary">₹{pkg.price.toLocaleString('en-IN')}</span>
                  /month
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-accent" />
                    <span><span className="font-medium">{pkg.downloadSpeed} Mbps</span> Download</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-accent" />
                    <span><span className="font-medium">{pkg.uploadSpeed} Mbps</span> Upload</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-accent" />
                    <span>Data: <span className="font-medium">{pkg.dataLimit}</span></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span>Ideal for <span className="font-medium">{pkg.users}</span> users</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full">
                  <Link href={`/plans/edit/${encodeURIComponent(pkg.name)}`}>Modify Package</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
