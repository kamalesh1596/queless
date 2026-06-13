import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Fingerprint, Clock, Activity, AlertCircle, XCircle, ChevronRight } from 'lucide-react';

function Position() {
    const [queueId, setQueueId] = useState('');
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    const fetchPosition = async (idToFetch = queueId) => {
        if (!idToFetch) return;
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(
                `http://localhost:5000/api/queues/${idToFetch}/position`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosition(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch position');
            setPosition(null);
        } finally {
            setLoading(false);
        }
    };

    const checkPosition = async (e) => {
        e.preventDefault();
        fetchPosition();
    };

    const cancelQueue = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/queues/${queueId}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosition(null);
            setQueueId('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel queue');
        }
    };

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on('queueUpdated', () => {
            if (queueId) {
                fetchPosition();
            }
        });
        return () => socket.disconnect();
    }, [queueId]);

    // Progress bar calculations
    const getProgress = () => {
        if (!position) return 0;
        // If currentToken >= my token, progress is 100%
        if (position.currentToken >= position.tokenNumber) return 100;
        // Approximation: assume start at token 1 if no other data
        const startToken = 1;
        const totalSteps = position.tokenNumber - startToken;
        const currentSteps = position.currentToken - startToken;
        if (totalSteps <= 0) return 0;
        return Math.min(Math.max((currentSteps / totalSteps) * 100, 5), 100);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-3">
                        Track Your <span className="text-gradient-brand">Position</span>
                    </h2>
                    <p className="text-zinc-400">Enter your Queue ID to see your live status.</p>
                </div>

                <div className="glass p-2 rounded-2xl mb-8 border border-white/10 shadow-2xl relative z-10 transition-shadow duration-300 hover:shadow-brand-500/10 hover:border-white/20">
                    <form onSubmit={checkPosition} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                            <input
                                className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none focus:ring-0 py-4 pl-12 pr-4 text-lg"
                                type="text"
                                placeholder="Enter Queue ID"
                                value={queueId}
                                onChange={(e) => setQueueId(e.target.value)}
                            />
                        </div>
                        <button 
                            disabled={!queueId || loading}
                            className="glass-button-brand px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                "Check"
                            )}
                        </button>
                    </form>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 overflow-hidden"
                        >
                            <AlertCircle size={20} />
                            <p className="font-medium">{error}</p>
                        </motion.div>
                    )}

                    {!position && !error && !loading && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-panel rounded-3xl p-12 text-center border border-dashed border-white/20 relative overflow-hidden"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl"></div>
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-white/10 shadow-inner">
                                <Search size={32} className="text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">No Queue Selected</h3>
                            <p className="text-zinc-400 relative z-10 max-w-sm mx-auto">
                                Paste the Queue ID shared with you or scan a QR code to start tracking your position live.
                            </p>
                        </motion.div>
                    )}

                    {position && !error && (
                        <motion.div
                            key="position"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-brand-500/20"
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                            
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{position.queueName}</h3>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-semibold text-zinc-300 shadow-inner">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Live Status: {position.status}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 relative z-10">
                                <div className="col-span-2 sm:col-span-1 glass p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 shadow-inner relative overflow-hidden group hover:border-brand-500/50 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent opacity-50" />
                                    <p className="text-sm text-zinc-300 font-medium mb-1 flex items-center gap-2 relative z-10 uppercase tracking-widest">
                                        <Fingerprint size={16} className="text-brand-400" /> Your Token
                                    </p>
                                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 relative z-10 drop-shadow-2xl">
                                        {position.tokenNumber}
                                    </p>
                                </div>
                                <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 transition-transform">
                                    <p className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wider">Now Serving</p>
                                    <p className="text-4xl font-bold text-white">{position.currentToken}</p>
                                </div>
                                <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm hover:-translate-y-1 transition-transform border border-brand-500/10">
                                    <div className="absolute inset-0 bg-brand-500/5" />
                                    <p className="text-xs text-brand-300 font-medium mb-2 uppercase tracking-wider">In Front of You</p>
                                    <p className="text-4xl font-black text-brand-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                        {position.position - 1}
                                    </p>
                                </div>
                            </div>

                            {/* Animated Progress Tracker */}
                            <div className="mb-10 relative z-10">
                                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                    <span>Joined</span>
                                    <span>Your Turn</span>
                                </div>
                                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
                                    <motion.div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-300 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getProgress()}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    >
                                        <div className="absolute top-0 right-0 w-4 h-full bg-white/30 rounded-full blur-[2px]" />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="glass p-5 rounded-2xl flex items-center justify-between mb-8 relative z-10 shadow-lg border border-yellow-500/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20 shadow-inner">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">Estimated Wait Time</p>
                                        <p className="text-2xl font-black text-white tracking-tight">~{position.estimatedWaitTime} <span className="text-base font-medium text-zinc-400">mins</span></p>
                                    </div>
                                </div>
                                <motion.div 
                                    animate={{ 
                                        opacity: [0.5, 1, 0.5],
                                    }} 
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                    Live
                                </motion.div>
                            </div>

                            <button
                                onClick={cancelQueue}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-red-400 font-bold hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all duration-300 relative z-10 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] group"
                            >
                                <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                                Leave Queue
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default Position;