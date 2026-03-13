"use client"

import { CheckCircle2, Building2, User, Globe, Phone, Mail, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
    const address = [org.address, org.city, org.state, org.zip].filter(Boolean).join(", ")

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
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Auto-Populated
                    </Badge>
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
