"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function PricingTable() {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* FREE */}
            <Card>
                <CardHeader>
                    <CardTitle>Starter</CardTitle>
                    <CardDescription>For small teams getting started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">$0</div>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 1 Active Project</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Basic Templates</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Current Plan</Button>
                </CardFooter>
            </Card>

            {/* PRO */}
            <Card className="border-primary shadow-lg scale-105">
                <CardHeader>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>For growing enterprises.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Unlimited Projects</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> AI Document Verification</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Audit Logs</li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Upgrade Now</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
