"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STEPS = [
    { label: "Requirements" },
    { label: "Company Info" },
    { label: "Business Model" },
    { label: "Products & Services" },
    { label: "Submit" },
]

export function StepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-center w-full mb-8">
            {STEPS.map((step, i) => {
                const num = i + 1
                const done = num < currentStep
                const active = num === currentStep
                return (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-all",
                                done && "bg-emerald-600 border-emerald-600 text-white",
                                active && "bg-red-600 border-red-600 text-white",
                                !done && !active && "border-slate-300 text-slate-400 bg-white"
                            )}>
                                {done ? <Check className="h-4 w-4" /> : num}
                            </div>
                            <span className={cn(
                                "text-[10px] font-semibold mt-1 text-center leading-tight whitespace-nowrap",
                                active && "text-red-600",
                                done && "text-emerald-600",
                                !done && !active && "text-slate-400"
                            )}>{step.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "h-0.5 flex-1 mx-2 mb-4 transition-all",
                                num < currentStep ? "bg-emerald-400" : "bg-slate-200"
                            )} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
