import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-slate-900 border-b border-slate-800 text-white">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Wallet className="h-6 w-6 text-emerald-400" />
                    <span className="font-bold text-lg tracking-tight">SmartSpend</span>
                </div>

                {user && (
                    <div className="flex items-center space-x-6">
            <span className="text-sm text-slate-400">
              Welcome, <strong className="text-white">{user.name}</strong>
            </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1.5 text-xs font-semibold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded transition cursor-pointer"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}