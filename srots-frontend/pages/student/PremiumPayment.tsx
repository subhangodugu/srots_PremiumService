import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CreditCard, ShieldCheck, ChevronRight, AlertCircle, Loader2, CheckCircle2, Lock, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PremiumPayment Component
 * 
 * Standardized premium activation page with premium glassmorphic aesthetic.
 */
export default function PremiumPayment() {
    const [utr, setUtr] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleActivate = async () => {
        if (!utr || utr.length < 6) {
            setError("Please enter a valid 12-digit UTR number");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await axios.post("/api/v1/premium/subscribe", {
                utrNumber: utr,
            });

            setSuccess(true);
            localStorage.setItem("premiumActive", "true");

            setTimeout(() => {
                navigate("/student-dashboard");
            }, 2000);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || "Activation failed. Please check your UTR and try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-6 font-sans selection:bg-blue-500/30">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl relative"
            >
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from),_transparent_70%)] from-white/20"></div>
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner"
                            >
                                <CreditCard className="text-white" size={40} />
                            </motion.div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Unlock Premium</h1>
                            <p className="text-blue-100/70 text-xs font-bold uppercase tracking-[0.3em]">Full Professional Access</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('role');
                                localStorage.removeItem('premiumActive');
                                window.location.href = '/login';
                            }}
                            className="absolute top-6 left-6 z-20 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white/50 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    <div className="p-10 space-y-10">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10 space-y-6"
                            >
                                <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                                    <CheckCircle2 size={48} className="animate-bounce" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Success!</h2>
                                    <p className="text-slate-400 font-medium mt-2">Your premium access has been activated.</p>
                                </div>
                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">
                                    Finalizing configuration...
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {/* Payment Instructions */}
                                <div className="flex flex-col md:flex-row gap-10 items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 shrink-0">
                                                <QrCode size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Step 1: Scan & Pay</h3>
                                                <p className="text-xs text-slate-400 font-medium leading-relaxed">Pay via GPay, PhonePe, or any UPI app using the QR code.</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400 shrink-0">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">Step 2: Submit UTR</h3>
                                                <p className="text-xs text-slate-400 font-medium leading-relaxed">Enter the 12-digit UTR number from your transaction details.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative bg-[#0a0a1a] p-4 rounded-3xl border border-white/10">
                                            <img
                                                src="/payment-qr.png"
                                                alt="Payment QR"
                                                className="w-40 h-40 rounded-xl"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=srots@upi&pn=SROTS&cu=INR';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Activation Form */}
                                <div className="space-y-6 pt-4 border-t border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Transaction Identity (UTR)</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                                            <input
                                                type="text"
                                                value={utr}
                                                onChange={(e) => setUtr(e.target.value)}
                                                placeholder="Enter 12-digit UTR number"
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-white placeholder:text-slate-600"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400"
                                            >
                                                <AlertCircle size={20} className="shrink-0" />
                                                <p className="text-xs font-bold leading-tight">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={handleActivate}
                                        disabled={loading || !utr}
                                        className="w-full py-5 bg-white text-black hover:bg-blue-50 text-base font-black rounded-2xl shadow-xl shadow-black/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" /> Verifying...
                                            </>
                                        ) : (
                                            <>
                                                Activate Securely <ChevronRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-8 bg-black/20 border-t border-white/5 text-center">
                        <div className="flex items-center justify-center gap-6 opacity-40">
                            <ShieldCheck size={16} />
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                                SROTS ENCRYPTED GATEWAY • EST 2024
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-8 text-slate-600 font-bold uppercase tracking-widest text-[9px]">
                    <span className="hover:text-blue-400 cursor-pointer transition-colors">Safety Protocol</span>
                    <span className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Shield</span>
                    <span className="hover:text-blue-400 cursor-pointer transition-colors">Contact Support</span>
                </div>
            </motion.div>
        </div>
    );
}
