import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PayHereSandboxModal from '../components/PayHereSandboxModal';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    CreditCard,
    DollarSign,
    PlusCircle,
    Trash2,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Food & Dining', type: 'EXPENSE' },
    { id: 2, name: 'Freelance', type: 'INCOME' },
    { id: 4, name: 'Transport', type: 'EXPENSE' },
    { id: 5, name: 'Utilities', type: 'EXPENSE' },
    { id: 6, name: 'Entertainment', type: 'EXPENSE' },
];

const PAYMENT_SERVICES = [
    {
        id: 'hotel',
        label: 'Hotel Booking',
        description: 'Pay hotel reservation & stay bills',
        defaultAmount: '5000',
        categoryKeywords: ['entertainment', 'hotel', 'travel', 'food'],
    },
    {
        id: 'restaurant',
        label: 'Restaurant',
        description: 'Pay dining & food delivery bills',
        defaultAmount: '1500',
        categoryKeywords: ['food', 'dining', 'restaurant'],
    },
    {
        id: 'utilities',
        label: 'Utility Bills',
        description: 'Electricity, water & internet bills',
        defaultAmount: '2500',
        categoryKeywords: ['utilities', 'utility', 'bill'],
    },
    {
        id: 'transport',
        label: 'Transport',
        description: 'Cab rides, fuel & transit tickets',
        defaultAmount: '800',
        categoryKeywords: ['transport', 'travel', 'fuel'],
    },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netSavings: 0 });
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paying, setPaying] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [selectedService, setSelectedService] = useState(null);
    const [serviceAmount, setServiceAmount] = useState('');
    const [serviceNote, setServiceNote] = useState('');

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: 1,
    });

    useEffect(() => {
        if (!user?.userId) return;

        let active = true;

        async function loadData() {
            try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();

                const [summaryRes, transRes, catRes] = await Promise.allSettled([
                    api.get(`/analytics/summary/${user.userId}?month=${month}&year=${year}`),
                    api.get(`/transactions/user/${user.userId}`),
                    api.get('/categories'),
                ]);

                if (!active) return;

                if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
                    setSummary(summaryRes.value.data);
                }

                if (transRes.status === 'fulfilled' && Array.isArray(transRes.value?.data)) {
                    setTransactions(transRes.value.data);
                }

                if (catRes.status === 'fulfilled' && Array.isArray(catRes.value?.data) && catRes.value.data.length > 0) {
                    setCategories(catRes.value.data);
                    setFormData((prev) => ({
                        ...prev,
                        categoryId: prev.categoryId || catRes.value.data[0].id,
                    }));
                }
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            active = false;
        };
    }, [user?.userId, refreshKey]);

    const handleSelectService = (service) => {
        if (selectedService?.id === service.id) {
            setSelectedService(null);
            return;
        }
        setSelectedService(service);
        setServiceAmount(service.defaultAmount);
        setServiceNote('');
    };

    const resolveExpenseCategoryId = (service) => {
        const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
        if (service && expenseCategories.length > 0) {
            const matched = expenseCategories.find((cat) =>
                service.categoryKeywords.some((kw) => cat.name.toLowerCase().includes(kw))
            );
            if (matched) return matched.id;
            return expenseCategories[0].id;
        }
        return 1;
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.categoryId || !user?.userId) return;

        setSubmitting(true);
        try {
            await api.post('/transactions', {
                userId: user.userId,
                categoryId: Number(formData.categoryId),
                amount: parseFloat(formData.amount),
                description: formData.description,
                transactionDate: formData.transactionDate,
            });

            setFormData({
                amount: '',
                description: '',
                transactionDate: new Date().toISOString().split('T')[0],
                categoryId: categories[0]?.id || 1,
            });

            setRefreshKey((k) => k + 1);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartServicePayment = async () => {
        if (!selectedService) return;
        const parsedAmount = parseFloat(serviceAmount);
        if (!parsedAmount || parsedAmount <= 0 || !user?.userId) {
            alert('Please enter a valid payment amount.');
            return;
        }

        setPaying(true);
        try {
            const orderId = `PAY_${selectedService.id.toUpperCase()}_${Date.now()}`;

            const hashRes = await api.post('/payment/generate-hash', {
                orderId: orderId,
                amount: parsedAmount,
                currency: 'LKR',
            });

            setPaymentData(hashRes.data);
            setIsPayModalOpen(true);
        } catch (err) {
            console.error('PayHere hash generation failed:', err);
            alert('Failed to initialize payment gateway.');
        } finally {
            setPaying(false);
        }
    };

    const handleSimulatedPaymentSuccess = async (completedOrderId) => {
        try {
            const parsedAmount = parseFloat(paymentData.amount);

            await api.post('/payment/notify', null, {
                params: {
                    merchant_id: paymentData.merchantId,
                    order_id: completedOrderId,
                    payhere_amount: paymentData.amount,
                    payhere_currency: paymentData.currency,
                    status_code: '2',
                    md5sig: paymentData.hash,
                },
            });

            const expenseCategoryId = resolveExpenseCategoryId(selectedService);
            const label = selectedService ? selectedService.label : 'Service Payment';
            const finalDescription = serviceNote.trim()
                ? `${label}: ${serviceNote.trim()} (PayHere)`
                : `${label} Payment (PayHere)`;

            await api.post('/transactions', {
                userId: user.userId,
                categoryId: expenseCategoryId,
                amount: parsedAmount,
                description: finalDescription,
                transactionDate: new Date().toISOString().split('T')[0],
            });

            setIsPayModalOpen(false);
            setPaymentData(null);
            setSelectedService(null);
            setServiceAmount('');
            setServiceNote('');
            setRefreshKey((k) => k + 1);
        } catch (err) {
            console.error('Failed to record PayHere expense:', err);
            alert('Payment succeeded, but failed to save transaction record.');
        }
    };

    const handleDelete = async (id) => {
        if (!user?.userId) return;
        if (window.confirm('Delete this transaction?')) {
            try {
                await api.delete(`/transactions/${id}`);
                setRefreshKey((k) => k + 1);
            } catch (err) {
                console.error('Delete error:', err);
                alert('Failed to delete transaction');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Quick Services & Bill Payments */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg space-y-5">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-sky-400" />
                            <span>Pay Bills & Services</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Select a service below to pay directly via PayHere and automatically record the expense.
                        </p>
                    </div>

                    {/* Service Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {PAYMENT_SERVICES.map((service) => {
                            const isSelected = selectedService?.id === service.id;
                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => handleSelectService(service)}
                                    className={`text-left p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                                        isSelected
                                            ? 'bg-sky-950/50 border-sky-500 shadow-md shadow-sky-950/40'
                                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-sm text-white">{service.label}</p>
                                        {isSelected && (
                                            <span className="text-[10px] font-bold uppercase text-sky-400">Selected</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400">{service.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Revealed Payment Box when a Service is Clicked */}
                    {selectedService && (
                        <div className="bg-slate-950 border border-sky-800/60 rounded-xl p-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        {selectedService.label} Amount (LKR)
                                    </label>
                                    <input
                                        type="number"
                                        min="100"
                                        step="50"
                                        value={serviceAmount}
                                        onChange={(e) => setServiceAmount(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                                        placeholder="1500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Merchant / Note (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceNote}
                                        onChange={(e) => setServiceNote(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                                        placeholder={`e.g., ${selectedService.label} bill`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setSelectedService(null)}
                                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartServicePayment}
                                    disabled={paying}
                                    className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer shadow flex items-center gap-2"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    <span>{paying ? 'Initializing...' : `Pay Rs. ${Number(serviceAmount || 0).toLocaleString()} with PayHere`}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold">Total Income</span>
                            <ArrowUpCircle className="text-emerald-400 h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">
                            Rs. {Number(summary.totalIncome || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold">Total Expense</span>
                            <ArrowDownCircle className="text-rose-400 h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-rose-400">
                            Rs. {Number(summary.totalExpense || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold">Net Balance</span>
                            <DollarSign className="text-sky-400 h-5 w-5" />
                        </div>
                        <p className={`text-2xl font-bold ${summary.netSavings >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                            Rs. {Number(summary.netSavings || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Action + Transaction Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Transaction Form */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-fit shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2 text-white">
                            <PlusCircle className="h-5 w-5 text-emerald-400" />
                            <span>Add Transaction</span>
                        </h3>

                        <form onSubmit={handleCreateTransaction} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.amount}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                                <select
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: Number(e.target.value) }))}
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
                                            {c.name} ({c.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="Grocery, Freelance work, etc."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                                    value={formData.transactionDate}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, transactionDate: e.target.value }))}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 cursor-pointer shadow"
                            >
                                {submitting ? 'Recording...' : 'Record Transaction'}
                            </button>
                        </form>
                    </div>

                    {/* Transactions List */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-white">Recent Transactions</h3>
                        {loading ? (
                            <p className="text-slate-400 text-sm">Loading transactions...</p>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                                <p className="text-slate-400 text-sm">No transactions found.</p>
                                <p className="text-slate-600 text-xs mt-1">Record your first income or expense from the form.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-slate-100">{t.description || t.categoryName}</p>
                                            <p className="text-xs text-slate-400">
                                                {t.categoryName} • {t.transactionDate}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span
                                                className={`text-sm font-bold ${
                                                    t.categoryType === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                                                }`}
                                            >
                                                {t.categoryType === 'INCOME' ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                                                title="Delete transaction"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <PayHereSandboxModal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                paymentData={paymentData}
                onPaymentSuccess={handleSimulatedPaymentSuccess}
            />
        </div>
    );
}