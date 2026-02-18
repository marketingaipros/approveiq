import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Headphones, Mail, MessageSquare, LifeBuoy } from "lucide-react"

export default function SupportPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customer Success & Support</h1>
                <p className="text-slate-500 mt-1">We're here to help you reach bureau readiness at scale.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <CardTitle>Live Concierge</CardTitle>
                        <CardDescription>Average response time: 4 minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-slate-900 hover:bg-black text-white">Start New Conversation</Button>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-2">
                            <Mail className="h-6 w-6" />
                        </div>
                        <CardTitle>Email Support</CardTitle>
                        <CardDescription>For long-form technical requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full border-slate-200">Create Support Ticket</Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm bg-slate-50 border-dashed">
                <CardContent className="p-8 text-center flex flex-col items-center">
                    <LifeBuoy className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Knowledge Base</h3>
                    <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">Explore our curated documentation on bureau requirements, compliance best practices, and more.</p>
                    <Button variant="outline" className="bg-white border-slate-200 shadow-sm px-8">Visit Help Center</Button>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center p-6 border border-slate-200 rounded-xl bg-white shadow-sm gap-4">
                <Headphones className="h-6 w-6 text-slate-400" />
                <p className="text-xs font-medium text-slate-600 italic">24/7 Priority Monitoring active for Enterprise accounts.</p>
            </div>
        </div>
    )
}
