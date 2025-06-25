"use client";

import { useState } from "react";
import { testConnectionAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Server, Terminal } from "lucide-react";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    async function handleTestConnection() {
        setIsLoading(true);
        const result = await testConnectionAction();
        setIsLoading(false);

        if (result.success) {
            toast({
                title: "Success",
                description: result.message,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: result.message,
            });
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Mikrotik Router Connection</CardTitle>
                    <CardDescription>
                        Configure and test the connection to your Mikrotik router for AAA services.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Configuration Instructions</AlertTitle>
                        <AlertDescription>
                            <p>To enable Mikrotik integration, add your router's credentials to the <code>.env</code> file in the project root.</p>
                            <pre className="mt-2 rounded-md bg-muted p-4 text-sm font-mono">
                                {`MIKROTIK_HOST=your_router_ip\nMIKROTIK_USER=your_api_user\nMIKROTIK_PASSWORD=your_password`}
                            </pre>
                            <p className="mt-2">Ensure the API service (port 8728) is enabled on your router under <strong>IP &gt; Services</strong>.</p>
                            <p className="mt-2">In the next step, we will use this connection to sync customers from the Customers page.</p>
                        </AlertDescription>
                    </Alert>

                    <div>
                        <Button onClick={handleTestConnection} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Server className="mr-2 h-4 w-4" />}
                            Test .env Connection
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            This tests the connection using the credentials from your <code>.env</code> file.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
