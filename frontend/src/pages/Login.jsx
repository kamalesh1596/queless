import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password,
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.name);

            navigate('/');
            // Need to reload window to update navbar state since App.jsx isn't fully reactive without a Context provider
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[85vh] w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl grid md:grid-cols-2 overflow-hidden rounded-3xl glass shadow-2xl border border-white/10"
            >
                {/* Left side - Branding */}
                <div className="hidden md:flex flex-col justify-between p-12 bg-black/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-2 group w-max">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                                <div className="w-4 h-4 rounded-sm bg-brand-400" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">QueLess</h1>
                        </Link>
                    </div>

                    <div className="relative z-10 mt-20">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Welcome back to the future of <span className="text-gradient-brand">queueing.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            Manage your lines, serve your customers faster, and grow your business with our enterprise-grade SaaS platform.
                        </p>
                    </div>

                    <div className="relative z-10 mt-20">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold z-${30 - i * 10}`}>
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-zinc-500 font-medium">Trusted by 10,000+ businesses</p>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white/[0.01]">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-white mb-3">Log in</h3>
                        <p className="text-zinc-400">Enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3"
                        >
                            <AlertCircle size={20} />
                            <p className="text-sm">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    className="w-full glass-input pl-20"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-zinc-400">Password</label>
                                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    className="w-full glass-input pl-12"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading || !email || !password}
                            className="w-full glass-button-brand py-4 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <>Sign in <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-zinc-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;

