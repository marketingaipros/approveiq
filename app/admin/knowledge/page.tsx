"use client"

import { useState } from "react"
import { uploadBureauGuidelines } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadCloud, FileText, CheckCircle2, Loader2 } from "lucide-react"

export default function AdminKnowledgeBase() {
    const [isUploading, setIsUploading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleUpload(formData: FormData) {
        setIsUploading(true)
        setSuccess(false)
        try {
            await uploadBureauGuidelines(formData)
            setSuccess(true)
            // Reset the form manually here if using standard form, but with action we might need to reset via ref
        } catch (error) {
            console.error(error)
            alert("Failed to upload guidelines.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Base Management</h1>
                <p className="text-slate-500">Upload new credit bureau guidelines to automatically parse and add them to the system.</p>
            </div>

            <Card className="max-w-2xl bg-white border-slate-200">
                <CardHeader>
                    <CardTitle>Upload Guidelines</CardTitle>
                    <CardDescription>
                        Upload a PDF or Word document containing credit bureau guidelines. The system will extract the rules and add them to the Knowledge Base.
                    </CardDescription>
                </CardHeader>
                <form action={handleUpload}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic / Guideline Name</Label>
                            <Input id="topic" name="topic" placeholder="e.g. Identity Verification Standards" required />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="bureau">Bureau / Entity</Label>
                            <Select name="bureau" defaultValue="general">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bureau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General / Master</SelectItem>
                                    <SelectItem value="experian">Experian</SelectItem>
                                    <SelectItem value="equifax">Equifax</SelectItem>
                                    <SelectItem value="transunion">TransUnion</SelectItem>
                                    <SelectItem value="dnb">Dun & Bradstreet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="file">Guideline Document</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                                <Input 
                                    id="file" 
                                    name="file" 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    className="hidden" 
                                    required
                                />
                                <Label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                                        <UploadCloud className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium">Click to select a file</span>
                                    <span className="text-xs text-slate-500">PDF, DOC up to 10MB</span>
                                </Label>
                            </div>
                        </div>

                        {success && (
                            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Document processed and added to Knowledge Base successfully.
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 px-6 flex justify-end">
                        <Button type="submit" disabled={isUploading} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Extract & Upload"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
