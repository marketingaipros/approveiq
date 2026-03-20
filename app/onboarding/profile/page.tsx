"use client"

import { useState, useActionState } from "react"
import { completeOnboarding } from "@/lib/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from "lucide-react"

export default function OnboardingProfilePage() {
    const [ein, setEin] = useState("")
    const [state, formAction, isPending] = useActionState(completeOnboarding, null)

    const handleEinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 9) value = value.slice(0, 9)
        
        if (value.length > 2) {
            value = value.slice(0, 2) + "-" + value.slice(2)
        }
        
        setEin(value)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-6">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/20">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Complete Your Profile</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Help us personalize your ApproveIQ experience.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
                            <Input 
                                id="fullName" 
                                name="fullName" 
                                placeholder="John Doe" 
                                required 
                                className="bg-zinc-950 border-zinc-800 focus:ring-red-500 text-white" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-zinc-300">Company Name</Label>
                            <Input 
                                id="companyName" 
                                name="companyName" 
                                placeholder="Acme Corp" 
                                required 
                                className="bg-zinc-950 border-zinc-800 focus:ring-red-500 text-white" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ein" className="text-zinc-300">Tax ID (EIN)</Label>
                            <Input 
                                id="ein" 
                                name="ein" 
                                value={ein}
                                onChange={handleEinChange}
                                placeholder="00-0000000" 
                                required 
                                pattern="\d{2}-\d{7}"
                                title="EIN must be in the format 00-0000000"
                                className="bg-zinc-950 border-zinc-800 focus:ring-red-500 text-white" 
                            />
                        </div>

                        {state?.error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-medium">
                                {state.error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide mt-4"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                "Finish Setup & Enter Dashboard"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest leading-loose">
                            Secure Data Encryption • HIPAA & SOC2 Compliant<br />
                            Your data is guarded by military-grade security
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
