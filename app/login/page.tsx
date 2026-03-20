"use client"

import { useActionState, useState } from "react"
import { login, signup } from "@/lib/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock, UserPlus, ArrowLeft, Loader2 } from "lucide-react"

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [ein, setEin] = useState("")

    // Use useActionState with our revised actions
    // Since we now have two possible actions, we can track them. 
    // For simplicity, we'll wrap the chosen one.
    const [loginState, loginAction, loginPending] = useActionState(login, null)
    const [signupState, signupAction, signupPending] = useActionState(signup, null)

    const handleEinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 9) value = value.slice(0, 9)
        if (value.length > 2) value = value.slice(0, 2) + "-" + value.slice(2)
        setEin(value)
    }

    const state = isSignUp ? signupState : loginState
    const isPending = isSignUp ? signupPending : loginPending

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-6 leading-relaxed">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl transition-all duration-300">
                <CardHeader className="space-y-2 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-900/40">
                            {isSignUp ? <UserPlus className="h-8 w-8 text-white" /> : <ShieldCheck className="h-8 w-8 text-white" />}
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight">
                        {isSignUp ? "Create Your Portal" : "Secure System Access"}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-sm max-w-[280px] mx-auto">
                        {isSignUp 
                            ? "Complete the secure authorization to initialize your organization's environment." 
                            : "Enter your verified credentials to access the secure administrative portal."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={isSignUp ? signupAction : loginAction} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    className="h-11 bg-zinc-950 border-zinc-800 focus:ring-red-600 text-zinc-100 placeholder:text-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="Password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="h-11 bg-zinc-950 border-zinc-800 focus:ring-red-600 text-zinc-100 placeholder:text-zinc-700"
                                />
                            </div>

                            {/* Extra fields only for signup - "The rest" after clicking Create Account */}
                            {isSignUp && (
                                <div className="space-y-4 pt-2 border-t border-zinc-800 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Full Name
                                        </Label>
                                        <Input 
                                            id="fullName" 
                                            name="fullName" 
                                            placeholder="John Doe" 
                                            required 
                                            className="h-11 bg-zinc-950 border-zinc-800 focus:ring-red-600 text-zinc-100" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Legal Entity Name
                                        </Label>
                                        <Input 
                                            id="companyName" 
                                            name="companyName" 
                                            placeholder="Acme Corp LLC" 
                                            required 
                                            className="h-11 bg-zinc-950 border-zinc-800 focus:ring-red-600 text-zinc-100" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ein" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                            Tax ID (EIN)
                                        </Label>
                                        <Input 
                                            id="ein" 
                                            name="ein" 
                                            value={ein}
                                            onChange={handleEinChange}
                                            placeholder="00-0000000" 
                                            required 
                                            pattern="\d{2}-\d{7}"
                                            className="h-11 bg-zinc-950 border-zinc-800 focus:ring-red-600 text-zinc-100" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {(state as any)?.message && (
                            <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs font-medium animate-in fade-in zoom-in duration-300">
                                {(state as any).message}
                            </div>
                        )}

                        {(state as any)?.error && (
                            <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-lg text-red-500 text-xs font-medium animate-pulse">
                                {(state as any).error}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <Button 
                                type="submit" 
                                disabled={isPending}
                                className="h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
                            >
                                {isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : isSignUp ? (
                                    <>Initialize Portal <UserPlus className="h-4 w-4 ml-2" /></>
                                ) : (
                                    <>Authorize Entry <Lock className="h-4 w-4 ml-2" /></>
                                )}
                            </Button>
                            
                            <Button 
                                type="button"
                                variant="ghost" 
                                disabled={isPending}
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                {isSignUp ? (
                                    <>Already have access? <span className="text-red-500 ml-1">Sign In</span></>
                                ) : (
                                    <>New organization? <span className="text-red-500 ml-1">Create Account</span></>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-10 pt-6 border-t border-zinc-800/50">
                        <p className="text-[10px] text-zinc-600 text-center uppercase tracking-[0.2em] font-medium leading-relaxed">
                            Secured by Multi-Layer Encryption<br />
                            Authorized Users Session Protected
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
