"use client"

import { useState } from "react"
import Papa from "papaparse"
import { UploadCloud, Download, AlertCircle, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { requiredFields, validateTranslatorData, ValidationError, UploadRow } from "@/lib/translator/validators"
import { transformToAgedAR, transformToCFN, transformToMetro2 } from "@/lib/translator/transformers"

type TargetFormat = "Equifax" | "Experian" | "SBFE" | "D&B" | "Creditsafe" | ""

export default function BureauTranslatorPage() {
    const [targetFormat, setTargetFormat] = useState<TargetFormat>("")
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<UploadRow[]>([])
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
    const [isTranslating, setIsTranslating] = useState(false)

    // Example fixed member number (in reality this would be dynamic per org)
    const memberNumber = "242FZ00693"

    // 1. Download Universal Template
    const handleDownloadTemplate = () => {
        const csvContent = requiredFields.join(",") + "\n";
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "Universal_Onboarding_Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 2. Parse and Validate Uploaded CSV
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return;

        setOriginalFile(file)
        
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as UploadRow[];
                setParsedData(data);
                
                const errors = validateTranslatorData(data);
                setValidationErrors(errors);
            }
        });
    }

    // 3. Process the Translation Output
    const handleTranslate = async () => {
        if (validationErrors.length > 0) return;
        setIsTranslating(true)

        try {
            await new Promise(res => setTimeout(res, 800)) // simulated processing
            let translatedString = "";
            let fileExt = ".txt"

            switch (targetFormat) {
                case "Equifax":
                    translatedString = transformToCFN(parsedData, memberNumber)
                    break;
                case "Experian":
                case "SBFE":
                    translatedString = transformToMetro2(parsedData)
                    break;
                case "D&B":
                case "Creditsafe":
                    translatedString = transformToAgedAR(parsedData)
                    fileExt = ".csv"
                    break;
            }

            const blob = new Blob([translatedString], { type: "text/plain;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `${targetFormat}_Onboarding_Extract_${new Date().getTime()}${fileExt}`
            link.click()

        } finally {
            setIsTranslating(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bureau Translator</h1>
                <p className="text-slate-500 mt-2">Convert the Universal 3-Month Historical Load CSV into bureau-specific compliance formats (CFN, Metro 2, Aged A/R).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SETTINGS COL */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Universal Template</CardTitle>
                            <CardDescription>Download the standard format.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" onClick={handleDownloadTemplate}>
                                <Download className="h-4 w-4 mr-2" /> Download CSV Template
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Target Format</CardTitle>
                            <CardDescription>Select intended bureau layout.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Bureau Output Mode</Label>
                                <Select value={targetFormat} onValueChange={(val: TargetFormat) => setTargetFormat(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select target..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Equifax">Equifax (CFN + Member#)</SelectItem>
                                        <SelectItem value="Experian">Experian (Metro 2)</SelectItem>
                                        <SelectItem value="SBFE">SBFE (Metro 2)</SelectItem>
                                        <SelectItem value="D&B">D&B (Aged A/R Summary)</SelectItem>
                                        <SelectItem value="Creditsafe">Creditsafe (Aged A/R Summary)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* MAIN TRANSLATOR COL */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-indigo-600">
                        <CardHeader>
                            <CardTitle>3. Upload & Translate</CardTitle>
                            <CardDescription>Drop your populated CSV to automatically map layouts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {!originalFile ? (
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                    />
                                    <FileSpreadsheet className="h-10 w-10 text-indigo-400 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-slate-700">Click or drag a CSV file to begin parsing</p>
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded shadow-sm">
                                            <FileSpreadsheet className="h-6 w-6 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{originalFile.name}</p>
                                            <p className="text-xs text-slate-500">{parsedData.length} total rows parsed</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setOriginalFile(null)}>Remove</Button>
                                </div>
                            )}

                            {/* VALIDATION BLOCKS */}
                            {validationErrors.length > 0 && (
                                <Alert variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="font-bold">Validation Errors Detected</AlertTitle>
                                    <AlertDescription className="mt-2">
                                        Found {validationErrors.length} rows missing required critical fields (like `EIN` or `OpenDate`). Submission is blocked.
                                        
                                        <div className="mt-4 max-h-48 overflow-y-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-red-100 text-red-900 sticky top-0">
                                                    <tr>
                                                        <th className="p-2 font-bold">Row Index</th>
                                                        <th className="p-2 font-bold">Account context</th>
                                                        <th className="p-2 font-bold">Missing Required Fields</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {validationErrors.map((err, i) => (
                                                        <tr key={i} className="border-b border-red-100 last:border-0 hover:bg-red-100/50">
                                                            <td className="p-2">{err.rowIndex}</td>
                                                            <td className="p-2 font-medium">{err.accountName}</td>
                                                            <td className="p-2 text-red-600 font-bold">{err.missingFields.join(", ")}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {parsedData.length > 0 && validationErrors.length === 0 && (
                                <Alert className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <AlertTitle className="font-bold text-emerald-800">Perfect Validation</AlertTitle>
                                    <AlertDescription>All {parsedData.length} records possess the required identifiers for translation.</AlertDescription>
                                </Alert>
                            )}

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <Button 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    disabled={!originalFile || !targetFormat || validationErrors.length > 0 || isTranslating}
                                    onClick={handleTranslate}
                                >
                                    {isTranslating ? "Translating..." : "Translate & Download Extract"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
