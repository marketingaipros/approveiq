"use client"

import { useState } from "react"
import { CheckCircle2, Building2, User, Globe, Phone, Mail, MapPin, Pencil, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateOrganizationProfile } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface Props {
    org: any
    profile: any
}

function ProfileRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <Icon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 w-32 font-medium">{label}</span>
            <span className="text-sm text-slate-800 font-semibold flex-1">
                {value || <span className="text-slate-300 italic font-normal">Not on file</span>}
            </span>
        </div>
    )
}

export function ExperianStep2Profile({ org, profile }: Props) {
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const address = [org.address, org.city, org.state, org.zip].filter(Boolean).join(", ")

    async function handleSave(formData: FormData) {
        setIsSaving(true)
        try {
            await updateOrganizationProfile(formData)
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 2: Confirm Company Profile</h2>
                <p className="text-sm text-slate-500 mt-1">
                    The following information was pulled from your client record. Review for accuracy — no re-entry required.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Details</h3>
                    <div className="flex items-center gap-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tight text-[#0066FF] hover:text-[#0052CC] hover:bg-blue-50">
                                    <Pencil className="h-3 w-3 mr-1" /> Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Company Details</DialogTitle>
                                    <DialogDescription>
                                        Update your business record. These changes will reflect across your applications.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleSave} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right text-xs">Name</Label>
                                        <Input id="name" name="name" defaultValue={org.name} className="col-span-3 h-9" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="address" className="text-right text-xs">Address</Label>
                                        <Input id="address" name="address" defaultValue={org.address} className="col-span-3 h-9" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 ml-[25%]">
                                        <Input id="city" name="city" placeholder="City" defaultValue={org.city} className="h-9" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input id="state" name="state" placeholder="ST" defaultValue={org.state} maxLength={2} className="h-9 uppercase" />
                                            <Input id="zip" name="zip" placeholder="Zip" defaultValue={org.zip} className="h-9" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="website" className="text-right text-xs">Website</Label>
                                        <Input id="website" name="website" defaultValue={org.website} className="col-span-3 h-9" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-right text-xs">Phone</Label>
                                        <Input id="phone" name="phone" defaultValue={org.phone} className="col-span-3 h-9" />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isSaving} className="bg-[#0066FF] hover:bg-[#0052CC] font-bold uppercase tracking-wider text-xs">
                                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-Populated
                        </Badge>
                    </div>
                </div>

                <ProfileRow icon={Building2} label="Company Name" value={org.name} />
                <ProfileRow icon={MapPin} label="Address" value={address} />
                <ProfileRow icon={Globe} label="Website" value={org.website} />
                <ProfileRow icon={Phone} label="Phone" value={org.phone} />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Contact</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-Populated
                    </Badge>
                </div>

                <ProfileRow icon={User} label="Full Name" value={profile.fullName} />
                <ProfileRow icon={Mail} label="Email" value={profile.email} />
                <ProfileRow icon={Phone} label="Phone" value={profile.phone} />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                <span className="font-bold">Need to update this information?</span> Go to{" "}
                <a href="/settings" className="underline font-semibold">Settings → Profile</a> to edit your company record.
                Changes will automatically reflect here.
            </div>
        </div>
    )
}
