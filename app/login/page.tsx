import { login, signup } from "@/lib/auth-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Lock } from "lucide-react"

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string; message?: string }
}) {
    const error = searchParams?.error
    const message = searchParams?.message

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-6">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-red-600 p-2 rounded-lg shadow-lg shadow-red-900/20">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">ApproveIQ Access</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Enter your credentials to access the secure portal.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="bg-zinc-950 border-zinc-800 focus:ring-red-500 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" title="Password" className="text-zinc-300">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-zinc-950 border-zinc-800 focus:ring-red-500 text-white"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-medium">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-500 text-xs font-medium">
                                {message}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Button formAction={login} className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide">
                                <Lock className="h-4 w-4 mr-2" /> Sign In
                            </Button>
                            <Button formAction={signup} variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800">
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest leading-loose">
                            Internal System Access • Authorized Users Only<br />
                            All login attempts are logged for audit compliance
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
