"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ShieldAlert, Key, Smartphone, Loader2 } from "lucide-react"
import { updateSecuritySettings } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"

interface SecuritySettingsProps {
    initialMfaEnforced: boolean
    orgName: string
}

export function SecuritySettings({ initialMfaEnforced, orgName }: SecuritySettingsProps) {
    const [mfaEnforced, setMfaEnforced] = useState(initialMfaEnforced)
    const [isPending, startTransition] = useTransition()

    const handleToggleMfa = (checked: boolean) => {
        startTransition(async () => {
            try {
                await updateSecuritySettings(checked)
                setMfaEnforced(checked)
            } catch (error) {
                console.error("Failed to update security settings:", error)
                // Revert on error
                setMfaEnforced(!checked)
            }
        })
    }

    return (
        <div className="space-y-6">
            <Card className="border-primary/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <CardTitle>Organization Security</CardTitle>
                        </div>
                        <Badge variant={mfaEnforced ? "default" : "secondary"}>
                            {mfaEnforced ? "MFA Enforced" : "MFA Optional"}
                        </Badge>
                    </div>
                    <CardDescription>
                        Manage security policies for <strong>{orgName}</strong>. Credit bureaus require these settings for access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="mfa-enforcement" className="text-base">Enforce Multi-Factor Authentication (MFA)</Label>
                            <p className="text-sm text-muted-foreground">
                                Require all users in your organization to use an authenticator app.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                            <Switch
                                id="mfa-enforcement"
                                checked={mfaEnforced}
                                onCheckedChange={handleToggleMfa}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium mb-3">Bureau Compliance Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg border flex items-center gap-3 ${mfaEnforced ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                {mfaEnforced ? (
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                ) : (
                                    <ShieldAlert className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">Experian</p>
                                    <p className="text-xs text-muted-foreground">
                                        {mfaEnforced ? "Passing" : "MFA Required"}
                                    </p>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg border flex items-center gap-3 ${mfaEnforced ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                {mfaEnforced ? (
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                ) : (
                                    <ShieldAlert className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">Equifax</p>
                                    <p className="text-xs text-muted-foreground">
                                        {mfaEnforced ? "M2 Standard" : "MFA Required"}
                                    </p>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg border flex items-center gap-3 ${mfaEnforced ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                {mfaEnforced ? (
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                ) : (
                                    <ShieldAlert className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">D&B</p>
                                    <p className="text-xs text-muted-foreground">
                                        {mfaEnforced ? "Commercial" : "MFA Required"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <CardTitle>Active MFA Enrollment</CardTitle>
                    </div>
                    <CardDescription>
                        Configuration for your personal account's second factor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Authenticator App</p>
                                <p className="text-xs text-muted-foreground">Using Google Authenticator or Authy</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open('https://supabase.com/docs/guides/auth/auth-mfa', '_blank')}>
                            Manage
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 py-3">
                    <p className="text-xs text-muted-foreground italic">
                        MFA enrollment is currently managed via Supabase Auth configuration.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
