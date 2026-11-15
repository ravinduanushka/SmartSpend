import { useState } from 'react';
import { CheckCircle2, CreditCard, Lock, ShieldCheck, X } from 'lucide-react';

export default function PayHereSandboxModal({ isOpen, onClose, paymentData, onPaymentSuccess }) {
    const [cardNumber, setCardNumber] = useState('4916 2175 0161 1292');
    const [cardName, setCardName] = useState('Ravindu Anushka');
    const [expiry, setExpiry] = useState('12/28');
    const [cvv, setCvv] = useState('123');
    const [processing, setProcessing] = useState(false);

    if (!isOpen || !paymentData) return null;

    const handleSimulatePay = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(async () => {
            await onPaymentSuccess(paymentData.orderId);
            setProcessing(false);
        }, 1200);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-sky-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-white" />
                        <div>
                            <h3 className="font-bold text-white text-base leading-tight">PayHere Sandbox</h3>
                            <p className="text-[11px] text-blue-100">Simulated Payment Gateway</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="text-blue-100 hover:text-white p-1 rounded-lg transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Order & Hash Verification Summary */}
                <div className="bg-slate-950/70 px-6 py-3.5 border-b border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Merchant ID:</span>
                        <span className="font-mono text-slate-200">{paymentData.merchantId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Order ID:</span>
                        <span className="font-mono text-slate-200">{paymentData.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Backend MD5 Hash:</span>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/60">
                            {paymentData.hash.slice(0, 16)}...
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                        <span className="text-slate-300 font-semibold">Total Amount:</span>
                        <span className="text-lg font-bold text-sky-400">
                            {paymentData.currency} {Number(paymentData.amount).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Mock Card Form */}
                <form onSubmit={handleSimulatePay} className="p-6 space-y-4 text-sm">
                    <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg">
                        <span>Test Mode: Dummy Visa Card Pre-filled</span>
                        <span className="text-amber-400 font-semibold">SANDBOX</span>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Card Number</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                            />
                            <CreditCard className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Card Holder Name</label>
                        <input
                            type="text"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Expiry (MM/YY)</label>
                            <input
                                type="text"
                                required
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">CVV</label>
                            <input
                                type="password"
                                required
                                maxLength={4}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                        >
                            {processing ? (
                                <span>Processing Payment...</span>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Pay {paymentData.currency} {Number(paymentData.amount).toLocaleString()}</span>
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1 pt-1">
                        <Lock className="h-3 w-3" />
                        <span>Secured by Spring Boot MD5 Hash Verification</span>
                    </p>
                </form>
            </div>
        </div>
    );
}