"use client"

import { useState } from "react"
import { Sparkles, MessageCircle, ArrowRight, X, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ConciergeAssistantProps {
    message: string
    actionLink: string | null
    actionText: string | null
}

export function ConciergeAssistant({ message, actionLink, actionText }: ConciergeAssistantProps) {
    const [isOpen, setIsOpen] = useState(true)

    if (!isOpen) {
        return (
            <div className="fixed bottom-10 right-10 z-[500] animate-in fade-in zoom-in duration-500">
                <button 
                    onClick={() => setIsOpen(true)}
                    className="relative bg-[#0066FF] p-6 rounded-[2.2rem] shadow-[0_20px_40px_-10px_rgba(0,102,255,0.6)] text-white hover:bg-[#0052CC] hover:-rotate-6 transition-all active:scale-95 group/mainbtn"
                >
                    <div className="absolute inset-0 rounded-[2.2rem] bg-[#0066FF] animate-ping opacity-20 pointer-events-none" />
                    <div className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-zinc-950">1</div>
                    <MessageCircle className="h-10 w-10 fill-current relative z-10" />
                </button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-10 right-10 z-[500] animate-in slide-in-from-bottom-20 duration-1000">
            <div className="flex flex-col items-end gap-6 relative">
                <div className="absolute -top-4 -left-4 h-full w-full bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="mb-2 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
                    <div className="relative bg-white/40 dark:bg-[#09090B]/60 border border-white/20 dark:border-white/10 backdrop-blur-3xl p-8 rounded-[2.5rem] max-w-[340px] transform transition-transform">
                        
                        {/* Minimize Button */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors bg-white/20 dark:bg-zinc-800/20 rounded-lg"
                        >
                            <Minus className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-4 mb-5">
                            <div className="h-12 w-12 rounded-2xl bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-2xl shadow-blue-500/40">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF]">Fintech Concierge</span>
                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">Active Guidance Mode</span>
                            </div>
                        </div>

                        <p className="text-base font-black italic text-zinc-900 dark:text-zinc-50 leading-relaxed tracking-tight mb-8 pr-6">
                            "{message}"
                        </p>

                        {actionLink && (
                            <Button className="w-full rounded-2xl h-14 bg-[#0066FF] hover:bg-[#0052CC] text-white font-black text-lg tracking-tight shadow-xl shadow-blue-500/20 group/btn" asChild>
                                <Link href={actionLink}>
                                    {actionText}
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* The Pulse Button (Also toggles) */}
                <button 
                    onClick={() => setIsOpen(false)}
                    className="relative bg-[#0066FF] p-6 rounded-[2.2rem] shadow-[0_20px_40px_-10px_rgba(0,102,255,0.6)] text-white hover:bg-[#0052CC] hover:-rotate-6 transition-all active:scale-95 group/mainbtn"
                >
                    <MessageCircle className="h-10 w-10 fill-current relative z-10" />
                </button>
            </div>
        </div>
    )
}
