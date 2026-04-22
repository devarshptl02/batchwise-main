import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    Lock,
    Mail,
    Loader,
    AlertCircle,
    X,
    Phone,
    MessageCircle,
    Clock,
    Layers
} from 'lucide-react';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for the Support Popup
    const [showSupport, setShowSupport] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Authenticate User
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // 2. Fetch Institute Details
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role, institute_id, institutes(name, logo_url)')
                .eq('id', authData.user.id)
                .single();

            if (profileError) {
                console.warn("Profile not found, using default.");
            } else if (profileData?.institutes) {
                // 3. Save Institute Info
                localStorage.setItem('institute_name', profileData.institutes.name);
                localStorage.setItem('institute_logo', profileData.institutes.logo_url || '');
                localStorage.setItem('user_role', profileData.role);
            }

            // 4. Redirect
            navigate('/admin/dashboard');

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10">

                {/* Header Section */}
                <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/50 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                    <div className="relative z-10">
                        {/* Logo Icon */}
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-lg shadow-indigo-900/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Layers size={32} strokeWidth={2.5} />
                        </div>

                        {/* Title & Tagline */}
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            Batchwise
                        </h1>
                        <p className="text-indigo-100 text-xs font-medium uppercase tracking-widest mt-2 opacity-80">
                            Institute Manager
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Admin Login</h2>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2 mb-6 border border-rose-100">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                    placeholder="admin@institute.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setShowSupport(true)}
                                className="text-indigo-600 font-bold cursor-pointer hover:underline outline-none"
                            >
                                Contact Support
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SUPPORT MODAL POPUP --- */}
            {showSupport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Contact Support</h3>
                            <button
                                onClick={() => setShowSupport(false)}
                                className="p-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                Need help creating an account or resetting your password? Reach out to us directly.
                            </p>

                            {/* Email */}
                            <a
                                href="mailto:vraj175patel@gmail.com"
                                className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Email Us</p>
                                    <p className="text-sm font-bold text-slate-700">vraj175patel@gmail.com</p>
                                </div>
                            </a>

                            {/* Phone */}
                            <a
                                href="tel:+917990860931"
                                className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Call Us</p>
                                    <p className="text-sm font-bold text-slate-700">+91 79908 60931</p>
                                </div>
                            </a>

                            {/* WhatsApp Button */}
                            <a
                                href="https://wa.me/917990860931?text=Hi,%20I%20need%20help%20with%20TuitionPro%20account."
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-md transition-transform active:scale-95"
                            >
                                <MessageCircle size={20} />
                                Chat on WhatsApp
                            </a>

                            {/* Footer Note */}
                            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                <Clock size={12} />
                                <span>Available Mon-Sat, 9AM - 6PM</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}