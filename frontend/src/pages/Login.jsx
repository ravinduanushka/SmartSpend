import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', formData);
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h2>
                <p className="text-center text-slate-400 text-sm mb-6">Track your finances smartly</p>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-emerald-400 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}