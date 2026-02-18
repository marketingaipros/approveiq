"use client"

import Link from "next/link"
import { ShieldCheck, Cpu, Database, ArrowRight, Zap, Lock, Globe } from "lucide-react"

export default function PreviewPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 font-sans antialiased overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                            <ShieldCheck className="w-5 h-5 text-slate-900" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 italic">
                            ApproveIQ
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#features" className="hover:text-cyan-400 transition-colors">Technology</a>
                        <a href="#security" className="hover:text-cyan-400 transition-colors">Security</a>
                        <a href="#demo" className="hover:text-cyan-400 transition-colors">Live Demo</a>
                    </div>
                    <Link href="/dashboard" className="px-5 py-2 rounded-full bg-white text-slate-950 text-sm font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform active:scale-95 group flex items-center gap-2">
                        Enter Platform
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in">
                        <Zap className="w-3 h-3" />
                        v2.5 Enterprise Release
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 leading-tight">
                        The Future of Credit Bureau <br className="hidden md:block" /> Intake, Automated.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed capitalize">
                        Industrial-grade AI recognition meets hardened enterprise security. Streamline your entire bureau readiness flow with sub-second precision.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-lg hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                            Launch Dynamic Preview
                            <Cpu className="w-5 h-5" />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            Explore Artifacts
                        </a>
                    </div>
                </div>

                {/* Dashboard Mockup/Visual */}
                <div className="mt-20 max-w-6xl mx-auto relative group">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden glassmorphism">
                        <div className="h-10 bg-white/5 border-b border-white/5 flex items-center gap-2 px-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </div>
                        <div className="p-8 aspect-video bg-gradient-to-tr from-slate-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-8 opacity-20">
                                {[...Array(24)].map((_, i) => (
                                    <div key={i} className="bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-cyan-500/20 border border-cyan-500/40">
                                    <Cpu className="w-12 h-12 text-cyan-400 animate-spin-slow" />
                                </div>
                                <div className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase animate-pulse">
                                    Smart Recognition Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors group">
                            <Database className="w-10 h-10 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-3 italic">Smart Recognition</h3>
                            <p className="text-slate-400 line-clamp-3">
                                Advanced entity memory system that recognizes relationship patterns and automates extraction with high confidence.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
                            <Lock className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-3 italic">Hardened Security</h3>
                            <p className="text-slate-400 line-clamp-3">
                                Tenant isolation enforced at the database level with RLS and immutable audit logging for every system action.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors group">
                            <Globe className="w-10 h-10 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold mb-3 italic">Bureau Ready</h3>
                            <p className="text-slate-400 line-clamp-3">
                                Native templates for Experian, Equifax, and D&B with built-in compliance guardrails and progress telemetry.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 text-center relative overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)]">
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Experience the Evolution</h2>
                        <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                            Jump straight into the live environment and see how ApproveIQ is redefining the standards of data furnishing.
                        </p>
                        <Link href="/dashboard" className="px-10 py-5 rounded-xl bg-white text-slate-950 font-bold text-xl hover:bg-slate-50 transition-all shadow-xl inline-flex items-center gap-3 active:scale-95 uppercase tracking-wide">
                            Begin Final Evaluation
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/20 blur-[60px] rounded-full -translate-x-1/2 translate-y-1/2" />
                </div>
            </section>

            <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-xs font-mono tracking-widest uppercase italic">
                ApproveIQ • Enterprise Grade Credit Intake • All Actions Logged Permanently
            </footer>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                .glassmorphism {
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
