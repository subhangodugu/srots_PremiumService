import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CreditCard, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";

/**
 * PremiumRequired Component
 * 
 * This page is shown to students whose accounts are on "HOLD" status 
 * due to inactive or expired premium subscriptions.
 */
const PremiumRequired: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-center relative">
                {/* 🔙 BACK BUTTON */}
                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('role');
                        localStorage.removeItem('premiumActive');
                        window.location.href = '/login';
                    }}
                    className="absolute top-6 left-6 z-10 text-xs font-bold text-white/70 hover:text-white transition-colors flex items-center gap-1"
                >
                    <ArrowLeft size={14} /> Back to Login
                </button>

                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-center relative">
                    <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Lock className="text-white/80" size={18} />
                    </div>
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                        <CreditCard className="text-white" size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Premium Required</h1>
                    <p className="text-blue-100 text-xs font-semibold mt-1 uppercase tracking-widest opacity-80">Activate your account</p>
                </div>

                {/* Action Content */}
                <div className="p-8">
                    <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-8 text-left">
                        <AlertCircle className="text-orange-500 shrink-0" size={20} />
                        <p className="text-sm text-orange-800 font-medium">
                            Your account is currently on <span className="font-bold">HOLD</span>. Premium subscription is required.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Scan to Pay</p>
                            <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200 inline-block mb-4 hover:border-blue-300 transition-colors">
                                <img
                                    src="/qr.png"
                                    alt="Payment QR Code"
                                    className="w-48 h-48 rounded-xl bg-white shadow-sm"
                                    onError={(e) => {
                                        // Fallback if image not found
                                        (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=srots@upi&pn=SROTS&cu=INR';
                                    }}
                                />
                            </div>
                            <p className="text-sm text-slate-600 font-bold">Complete payment via UPI</p>
                        </div>

                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-left">
                            <h3 className="text-xs font-black text-blue-900 mb-2 uppercase tracking-wider">How to activate?</h3>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                After successful payment, please submit your <span className="font-bold">UTR (Transaction ID)</span> in the subscription panel. Our team will verify and activate your account within 24 hours.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.href = '/premium'}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                        >
                            Enter UTR Number <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Information Bottom */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        SROTS PLATFORM SECURITY • EST 2024
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumRequired;
