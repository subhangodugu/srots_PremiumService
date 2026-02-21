import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Diamond,
    CheckCircle2,
    CreditCard,
    Zap,
    Rocket,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PremiumService } from '../../services/premiumService';
import { AuthService } from '../../services/authService';
import { updateUser, loginFailure } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

const PremiumPage: React.FC = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [selectedPlan, setSelectedPlan] = useState<{ months: number; price: number } | null>(null);
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Select Plan, 2: Payment, 3: Verification

    const plans = [
        { months: 3, price: 199, label: 'Standard', icon: <Zap className="w-6 h-6" /> },
        { months: 6, price: 349, label: 'Professional', icon: <Rocket className="w-6 h-6" />, recommended: true },
        { months: 12, price: 599, label: 'Ultimate', icon: <Diamond className="w-6 h-6" /> },
    ];

    const handleSubscribe = async () => {
        if (!selectedPlan || !utr || !user) return;

        setIsSubmitting(true);
        try {
            const response = await PremiumService.subscribe({
                utrNumber: utr.trim()
            });

            toast.success(response.message);
            setStep(4); // Success Step
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to activate premium. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 mb-4">
                        Level Up Your Career
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Unlock exclusive job opportunities, advanced analytics, and premium placement tools tailored for success.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.months}
                            whileHover={{ scale: 1.02, translateY: -5 }}
                            className={`relative p-8 rounded-3xl border ${plan.recommended ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/5'
                                } backdrop-blur-xl overflow-hidden group`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                    RECOMMENDED
                                </div>
                            )}

                            <div className={`p-3 rounded-2xl mb-6 inline-block ${plan.recommended ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'
                                }`}>
                                {plan.icon}
                            </div>

                            <h3 className="text-2xl font-bold mb-2">{plan.label}</h3>
                            <p className="text-gray-400 mb-6">{plan.months} Months Duration</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold">₹{plan.price}</span>
                                <span className="text-gray-500">/period</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {[
                                    'Priority Job Applications',
                                    'Placement Analytics Dashboard',
                                    'Exclusive Mock Interviews',
                                    'Resume Builder Pro'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => {
                                    setSelectedPlan(plan);
                                    setStep(2);
                                }}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${plan.recommended
                                    ? 'bg-blue-600 hover:bg-blue-500'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                Choose Plan
                            </button>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {step > 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        >
                            <div className="bg-[#0A0A1F] border border-white/10 p-8 rounded-3xl max-w-xl w-full">
                                {step === 2 && (
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-blue-400">
                                            <CreditCard className="w-6 h-6" /> Complete Payment
                                        </h2>
                                        <p className="text-gray-400 mb-8">
                                            Scan the QR code below to pay <span className="text-white font-bold">₹{selectedPlan?.price}</span> for <span className="text-white font-bold">{selectedPlan?.months} Months</span>
                                        </p>

                                        <div className="bg-white p-6 rounded-2xl inline-block mb-8 mx-auto shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                            <img
                                                src="/qr.png"
                                                alt="Payment QR"
                                                className="w-48 h-48 md:w-64 md:h-64 rounded-xl"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SROTS_PREMIUM_PAYMENT";
                                                }}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => setStep(3)}
                                                className="flex-[2] py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-lg shadow-blue-500/20"
                                            >
                                                Continue to Verification
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-400">
                                            <ShieldCheck className="w-6 h-6" /> Verify Payment
                                        </h2>
                                        <p className="text-gray-400 mb-8">
                                            Enter the 10+ character UTR / Transaction ID from your payment confirmation.
                                        </p>

                                        <div className="space-y-6 mb-8">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Transaction ID (UTR)</label>
                                                <input
                                                    type="text"
                                                    value={utr}
                                                    onChange={(e) => setUtr(e.target.value)}
                                                    placeholder="Ex: 123456789012"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 transition-all text-xl tracking-widest uppercase"
                                                />
                                            </div>

                                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 text-sm text-blue-300">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <p>Our team will verify this UTR. Your account will be activated instantly upon submission.</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={isSubmitting}
                                                className="flex-1 py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold transition-all disabled:opacity-50"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSubscribe}
                                                disabled={isSubmitting || utr.length < 10}
                                                className="flex-[2] py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : 'Activate Premium'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="text-center py-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 10 }}
                                            className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <CheckCircle2 className="w-10 h-10" />
                                        </motion.div>
                                        <h2 className="text-3xl font-bold mb-4">Request Submitted!</h2>
                                        <p className="text-gray-400 mb-10 leading-relaxed">
                                            Your premium recharge request has been submitted with UTR <span className="text-white font-mono">{utr}</span>.
                                            <br /><br />
                                            Once verified, your account will be activated. <b>Please log in again in a few minutes</b> to access all features.
                                        </p>
                                        <button
                                            onClick={() => {
                                                dispatch(loginFailure('Please log in again to verify premium activation.'));
                                                window.location.href = '/login';
                                            }}
                                            className="w-full py-4 rounded-xl bg-white text-black font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                        >
                                            Finish & Back to Login
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PremiumPage;
