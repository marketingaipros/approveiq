"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const ACCOUNT_TYPES = ["Loans", "Lines of Credit", "Leases", "Credit Cards", "Installment Contracts", "Other"]
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]

interface Props { data: any; onChange: (field: string, value: any) => void }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {children}
        </div>
    )
}

export function Step2CompanyInfo({ data, onChange }: Props) {
    const accountTypes: string[] = data.account_types || []
    const otherBureaus: string[] = data.other_bureaus || []

    const toggleArray = (field: string, current: string[], val: string) => {
        const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
        onChange(field, next)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 2: Company Information</h2>
                <p className="text-sm text-slate-500 mt-1">All fields marked * are required by Equifax for contributor eligibility.</p>
            </div>

            {/* Company Basics */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Company Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Company Name" required>
                        <Input placeholder="Acme Lending LLC" value={data.company_name || ""} onChange={e => onChange("company_name", e.target.value)} />
                    </Field>
                    <Field label="Company Phone" required>
                        <Input placeholder="(555) 000-0000" value={data.company_phone || ""} onChange={e => onChange("company_phone", e.target.value)} />
                    </Field>
                    <Field label="Company Website">
                        <Input placeholder="https://www.yourcompany.com" value={data.company_website || ""} onChange={e => onChange("company_website", e.target.value)} />
                    </Field>
                    <Field label="Years in Business" required>
                        <Input placeholder="e.g. 5" value={data.years_in_business || ""} onChange={e => onChange("years_in_business", e.target.value)} />
                    </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Field label="Physical Address" required>
                            <Input placeholder="123 Main St" value={data.company_address || ""} onChange={e => onChange("company_address", e.target.value)} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="City" required>
                            <Input placeholder="Atlanta" value={data.city || ""} onChange={e => onChange("city", e.target.value)} />
                        </Field>
                        <Field label="State" required>
                            <Select value={data.state || ""} onValueChange={v => onChange("state", v)}>
                                <SelectTrigger><SelectValue placeholder="ST" /></SelectTrigger>
                                <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </Field>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Industry" required>
                        <Select value={data.industry || ""} onValueChange={v => onChange("industry", v)}>
                            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                            <SelectContent>
                                {["Finance / Lending", "Leasing", "Healthcare", "Retail", "Real Estate", "Technology", "Professional Services", "Other"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Geographic Area Served" required>
                        <Select value={data.geographic_area || ""} onValueChange={v => onChange("geographic_area", v)}>
                            <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                            <SelectContent>
                                {["National", "Regional (Multi-State)", "Single State", "Local (County / City)"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </div>

            {/* Primary Contact */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Primary Contact</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Full Name" required>
                        <Input placeholder="Jane Smith" value={data.primary_contact_name || ""} onChange={e => onChange("primary_contact_name", e.target.value)} />
                    </Field>
                    <Field label="Email Address" required>
                        <Input type="email" placeholder="jane@company.com" value={data.primary_contact_email || ""} onChange={e => onChange("primary_contact_email", e.target.value)} />
                    </Field>
                    <Field label="Phone Number" required>
                        <Input placeholder="(555) 000-0000" value={data.primary_contact_phone || ""} onChange={e => onChange("primary_contact_phone", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Reporting Context */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Reporting Context</h3>

                <Field label="Types of Accounts to Report" required>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                        {ACCOUNT_TYPES.map(t => (
                            <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox checked={accountTypes.includes(t)} onCheckedChange={() => toggleArray("account_types", accountTypes, t)} />
                                {t}
                            </label>
                        ))}
                    </div>
                </Field>

                <Field label="Primary Reason for Reporting">
                    <Select value={data.reason_for_reporting || ""} onValueChange={v => onChange("reason_for_reporting", v)}>
                        <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                        <SelectContent>
                            {["Reward good payment behavior", "Improve borrower creditworthiness", "Industry compliance", "Reduce defaults", "Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Currently Reporting to Other Bureaus">
                    <div className="flex flex-wrap gap-3 mt-1">
                        {["Experian", "TransUnion", "SBFE", "D&B", "Creditsafe", "None"].map(b => (
                            <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox checked={otherBureaus.includes(b)} onCheckedChange={() => toggleArray("other_bureaus", otherBureaus, b)} />
                                {b}
                            </label>
                        ))}
                    </div>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Data Upload Method" required>
                        <Select value={data.data_upload_method || ""} onValueChange={v => onChange("data_upload_method", v)}>
                            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="direct">Direct Upload</SelectItem>
                                <SelectItem value="third_party">3rd Party Vendor</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    {data.data_upload_method === "third_party" && (
                        <Field label="Vendor Name">
                            <Input placeholder="Vendor company name" value={data.third_party_vendor || ""} onChange={e => onChange("third_party_vendor", e.target.value)} />
                        </Field>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Existing Equifax Member Number(s)">
                        <Input placeholder="Leave blank if none" value={data.existing_member_numbers || ""} onChange={e => onChange("existing_member_numbers", e.target.value)} />
                    </Field>
                    <Field label="Lending License Number">
                        <Input placeholder="Required if < 500 records" value={data.lending_license_number || ""} onChange={e => onChange("lending_license_number", e.target.value)} />
                    </Field>
                </div>
            </div>
        </div>
    )
}
