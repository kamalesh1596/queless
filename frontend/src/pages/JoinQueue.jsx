import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Hash, CheckCircle2, AlertCircle, ArrowRight, Clock, Users, Info } from 'lucide-react';

function JoinQueue() {
    const [queueId, setQueueId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const idFromUrl = searchParams.get('queueId');
        if (idFromUrl) {
            setQueueId(idFromUrl);
        }
    }, [searchParams]);

    const handleJoinQueue = async (e) => {
        e.preventDefault();
        if (!queueId) return;
        
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                'http://localhost:5000/api/queues/join',
                { queueId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join queue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-500/30 shadow-inner">
                        <LogIn className="text-brand-400" size={32} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-3">
                        Join a <span className="text-gradient-brand">Queue</span>
                    </h2>
                    <p className="text-zinc-400">Enter a Queue ID or scan a QR code to join.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-white/5"
                        >
                            <AnimatePresence>
                                {queueId && searchParams.get('queueId') && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="px-4 py-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-start gap-3 overflow-hidden shadow-sm"
                                    >
                                        <Info className="text-brand-400 mt-0.5 shrink-0" size={18} />
                                        <p className="text-sm text-brand-100 font-medium">Queue ID detected from link. Click Join to enter.</p>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 overflow-hidden shadow-sm"
                                    >
                                        <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
                                        <p className="text-sm text-red-200 font-medium">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleJoinQueue} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">Queue ID</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                        <input
                                            className="w-full glass-input pl-12 font-mono"
                                            type="text"
                                            placeholder="e.g. 64abc123..."
                                            value={queueId}
                                            onChange={(e) => setQueueId(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={!queueId || loading}
                                    className="w-full glass-button-brand py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-lg"
                                >
                                    {loading ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <>Join Queue <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-8 rounded-3xl relative overflow-hidden text-center shadow-2xl border border-green-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent" />
                            
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-green-500/30 shadow-inner"
                            >
                                <CheckCircle2 className="text-green-400" size={40} />
                            </motion.div>

                            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Successfully Joined!</h3>
                            <p className="text-zinc-400 mb-8 relative z-10">You are now in the queue.</p>

                            <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5 relative z-10 shadow-inner">
                                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Your Token Number</p>
                                <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 mb-6 drop-shadow-lg">
                                    {result.tokenNumber}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 text-left border-t border-white/10 pt-6">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5"><Users size={12} className="text-brand-400"/> Position</p>
                                        <p className="font-bold text-white text-xl">{result.position}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5"><Clock size={12} className="text-yellow-400"/> Est. Wait</p>
                                        <p className="font-bold text-white text-xl">{result.estimatedWaitTime}m</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/position')}
                                className="w-full glass-button py-4 relative z-10 font-bold"
                            >
                                View Live Position Tracker
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default JoinQueue;