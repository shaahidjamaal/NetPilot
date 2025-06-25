
"use client"

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Users, FileText, IndianRupee } from 'lucide-react';

const reportLinks = [
    {
        href: '/reports/package-sales',
        icon: BarChart2,
        title: 'Package Sales Report',
        description: 'Analyze revenue from different service packages.',
    },
    {
        href: '/reports/subscriber-stats',
        icon: Users,
        title: 'Subscriber Statistics',
        description: 'View active, inactive, and new customer data.',
    },
    {
        href: '/reports/invoice-summary',
        icon: FileText,
        title: 'Invoice Summary',
        description: 'Track paid, unpaid, and overdue invoices.',
    },
    {
        href: '/reports/payment-history',
        icon: IndianRupee,
        title: 'Payment History',
        description: 'Review a detailed log of all transactions.',
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
                <p className="text-muted-foreground">
                    Select a report to view detailed analytics and data summaries.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reportLinks.map((report) => (
                    <Link key={report.href} href={report.href} className="flex">
                        <Card className="hover:bg-muted/50 transition-colors w-full flex flex-col">
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <report.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle>{report.title}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {report.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
