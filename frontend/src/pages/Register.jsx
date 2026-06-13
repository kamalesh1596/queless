import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, LayoutDashboard } from 'lucide-react';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post(
                'http://localhost:5000/api/users/register',
                {
                    name,
                    email,
                    password,
                }
            );
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userName', res.data.name);
            navigate('/');
            window.location.reload(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <Link to="/" className="flex items-center gap-2 group w-max">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                                <div className="w-4 h-4 rounded-sm bg-brand-400" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">QueLess</h1>
                        </Link>
                    </div>

                    <div className="relative z-10 mt-20">
                        <div className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20 w-max mb-6">
                            <LayoutDashboard className="text-brand-400" size={32} />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Start managing queues like a <span className="text-gradient-brand">pro.</span>
                        </h2>
                        <ul className="space-y-4 text-zinc-400">
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                Real-time analytics and tracking
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                Instant QR code generation
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                Live customer position updates
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white/[0.01]">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-white mb-3">Create an account</h3>
                        <p className="text-zinc-400">Get started with QueLess for free.</p>
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

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    className="w-full glass-input pl-12"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    className="w-full glass-input pl-12"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                <input
                                    className="w-full glass-input pl-12"
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading || !name || !email || !password}
                            className="w-full glass-button-brand py-4 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <>Sign up <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-zinc-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Register;