"use client"

import { useState } from "react"
import { completeOnboarding } from "@/lib/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, UserPlus } from "lucide-react"

export default function OnboardingProfilePage() {
    const [ein, setEin] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleEinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 9) value = value.slice(0, 9)
        
        if (value.length > 2) {
            value = value.slice(0, 2) + "-" + value.slice(2)
        }
        
        setEin(value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
        setError(null)
        // Since it's a server action, we can use it in a form but here we might want more control
        // However, the user asked for a form submit. 
        // We'll let the standard form action handle it or do it manually.
        // Let's do it manually to handle the state nicely.
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
                    <form action={completeOnboarding} className="space-y-4">
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
                                className="bg-zinc-950 border-zinc-800 focus:ring-red-500 text-white" 
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide mt-4">
                            Finish Setup & Enter Dashboard
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
