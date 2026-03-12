"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, UploadCloud, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateTemplateFromGuidelines } from "@/lib/actions"

export function UploadTemplateButton() {
    const [open, setOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    async function handleUpload(formData: FormData) {
        setIsUploading(true)
        try {
            await generateTemplateFromGuidelines(formData)
            setOpen(false)
        } catch (error) {
            console.error(error)
            alert("Failed to generate template.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] h-9 gap-2 shadow-md shadow-red-500/10">
                    <Plus className="h-4 w-4" /> AI AI Generation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleUpload}>
                    <DialogHeader>
                        <DialogTitle>Generate AI Template</DialogTitle>
                        <DialogDescription>
                            Upload bureau guidelines to dynamically extract Checklist Items and generate a reusable template.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Template Name</Label>
                            <Input id="title" name="title" placeholder="e.g. SBA Compliance Checklist" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bureau">Bureau</Label>
                            <Select name="bureau" defaultValue="experian">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select bureau" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="experian">Experian</SelectItem>
                                    <SelectItem value="equifax">Equifax</SelectItem>
                                    <SelectItem value="transunion">TransUnion</SelectItem>
                                    <SelectItem value="dnb">Dun & Bradstreet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="file">Guideline Document</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                                <Input 
                                    id="file" 
                                    name="file" 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    className="hidden" 
                                    required
                                />
                                <Label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-full">
                                        <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">Click to select a file</span>
                                </Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isUploading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    AI Parsing Document...
                                </>
                            ) : (
                                "Generate Template"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
