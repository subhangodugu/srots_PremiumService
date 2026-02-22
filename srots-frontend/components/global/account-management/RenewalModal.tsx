import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Diamond,
    CreditCard,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { PremiumService } from '../../../services/premiumService';
import { AuthService } from '../../../services/authService';
import { updateUser } from '../../../store/slices/authSlice';
import { toast } from 'react-hot-toast';

interface RenewalModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Optional admin-side props (used in ManagingStudentAccounts)
    student?: { id: string; name: string } | null;
    extensionMonths?: string;
    setExtensionMonths?: (v: string) => void;
    onConfirm?: () => void;
}

const RenewalModal: React.FC<RenewalModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
    const [utr, setUtr] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Info/Select, 2: Payment, 3: Verification

    if (!isOpen) return null;

    const handleRenew = async () => {
        if (!selectedMonths || !utr) return;

        setIsSubmitting(true);
        try {
            const response = await PremiumService.subscribe({
                months: selectedMonths,
                utrNumber: utr.trim()
            });

            toast.success(response.message);

            // Refresh Session
            if (user) {
                const updatedUser = await AuthService.getFullProfile(user.id);
                dispatch(updateUser(updatedUser));
            }

            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to renew premium.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const plans = [
        { months: 3, price: 199 },
        { months: 6, price: 349 },
        { months: 12, price: 599 }
    ];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-[#0A0A1F] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Diamond className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Extend Premium</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            <p className="text-gray-400 text-sm">Choose a plan to extend your premium membership and keep your exclusive features active.</p>

                            <div className="grid grid-cols-1 gap-3">
                                {plans.map((p) => (
                                    <button
                                        key={p.months}
                                        onClick={() => setSelectedMonths(p.months)}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${selectedMonths === p.months
                                            ? 'bg-blue-600/10 border-blue-500 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <div className="font-bold">{p.months} Months</div>
                                            <div className="text-xs text-gray-500">Full Access</div>
                                        </div>
                                        <div className="text-xl font-bold">₹{p.price}</div>
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={!selectedMonths}
                                onClick={() => setStep(2)}
                                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center">
                            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg shadow-blue-500/10">
                                <img
                                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SROTS_PREMIUM_RENEWAL"
                                    alt="QR"
                                    className="w-40 h-40"
                                />
                            </div>
                            <p className="text-gray-400 text-sm mb-6">Scan to pay for <strong>{selectedMonths} Months</strong> extension.</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white border border-white/10"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-bold"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">UTR / Transaction ID</label>
                                <input
                                    type="text"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                    placeholder="Ex: 123456789012"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white tracking-widest uppercase"
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 text-xs text-blue-300">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>Activation will be instant upon submission. Please double check the UTR.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 text-white border border-white/10"
                                >
                                    Back
                                </button>
                                <button
                                    disabled={isSubmitting || utr.length < 10}
                                    onClick={handleRenew}
                                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Extend Validity'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default RenewalModal;
