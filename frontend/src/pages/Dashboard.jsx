import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ArrowDownCircle, ArrowUpCircle, DollarSign, PlusCircle, Trash2 } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netSavings: 0, categoryBreakdown: [] });
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: '',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const [summaryRes, transRes, catRes] = await Promise.all([
                api.get(`/analytics/summary/${user.userId}?month=${month}&year=${year}`),
                api.get(`/transactions/user/${user.userId}`),
                api.get('/categories'),
            ]);

            setSummary(summaryRes.data);
            setTransactions(transRes.data);
            setCategories(catRes.data);
            if (catRes.data.length > 0 && !formData.categoryId) {
                setFormData((prev) => ({ ...prev, categoryId: catRes.data[0].id }));
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.userId) {
            fetchData();
        }
    }, [user]);

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
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
                categoryId: categories[0]?.id || '',
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add transaction');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this transaction?')) {
            try {
                await api.delete(`/transactions/${id}`);
                fetchData();
            } catch (err) {
                alert('Failed to delete transaction');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold">Total Income</span>
                            <ArrowUpCircle className="text-emerald-400 h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">
                            Rs. {Number(summary.totalIncome || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow">
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                            <span className="text-xs uppercase tracking-wider font-semibold">Total Expense</span>
                            <ArrowDownCircle className="text-rose-400 h-5 w-5" />
                        </div>
                        <p className="text-2xl font-bold text-rose-400">
                            Rs. {Number(summary.totalExpense || 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow">
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
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-fit">
                        <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                            <PlusCircle className="h-5 w-5 text-emerald-400" />
                            <span>Add Transaction</span>
                        </h3>

                        <form onSubmit={handleCreateTransaction} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Category</label>
                                <select
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="Dinner, salary, etc."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                                    value={formData.transactionDate}
                                    onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition"
                            >
                                Record Transaction
                            </button>
                        </form>
                    </div>

                    {/* Transactions List */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
                        {loading ? (
                            <p className="text-slate-400 text-sm">Loading transactions...</p>
                        ) : transactions.length === 0 ? (
                            <p className="text-slate-500 text-sm">No transactions yet. Add your first one!</p>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm">{t.description || t.categoryName}</p>
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
                                                className="text-slate-500 hover:text-rose-400 transition"
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
        </div>
    );
}