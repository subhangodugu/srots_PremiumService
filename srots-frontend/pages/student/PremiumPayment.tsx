import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    ShieldCheck,
    QrCode,
    Loader2
} from 'lucide-react';
import { PremiumService } from '../../services/premiumService';

const PremiumPayment: React.FC = () => {
    const [utrNumber, setUtrNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (utrNumber.trim().length < 6) {
            setError('UTR must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            await PremiumService.subscribe({ utrNumber });
            setSuccess(true);
            setTimeout(() => {
                alert("Premium Activated!");
                window.location.href = "/student-dashboard";
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate premium. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Premium Activated!</h2>
                    <p className="text-slate-500 font-medium">Your account is now ACTIVE. Redirecting you to your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white relative">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
                        <CreditCard size={32} />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Activate Premium</h1>
                    <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">One-year access to all features</p>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Step 1: Scan & Pay</p>
                        <div className="bg-slate-50 p-4 rounded-3xl border-2 border-dashed border-slate-200 inline-block mb-4">
                            <img
                                src="/qr.png"
                                alt="Payment QR"
                                className="w-48 h-48 rounded-xl bg-white"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SROTS_PREMIUM_PAYMENT';
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-center gap-2 text-slate-600 font-bold text-sm">
                            <QrCode size={16} />
                            <span>Scan with GPay / PhonePe / Paytm</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-8">
                        <div className="flex gap-3">
                            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                            <div>
                                <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">Instant Activation</h3>
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    Enter your UTR number below after payment. Our system will activate your premium features immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Step 2: Enter UTR</p>
                            <div className="relative group">
                                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    placeholder="Enter 12-digit UTR Number"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 uppercase tracking-widest text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Verify & Activate <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                        SECURE PAYMENT GATEWAY • SROTS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumPayment;
