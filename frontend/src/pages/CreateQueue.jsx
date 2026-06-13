import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Link as LinkIcon, CheckCircle2, Copy, Sparkles, QrCode, AlertCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

function CreateQueue() {
    const [queueName, setQueueName] = useState('');
    const [createdQueue, setCreatedQueue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCreateQueue = async (e) => {
        e.preventDefault();
        if (!queueName) return;

        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            const res = await axios.post(
                'http://localhost:5000/api/queues',
                { queueName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCreatedQueue(res.data);
            setQueueName('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create queue');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const joinLink = createdQueue ? `http://localhost:5173/join-queue?queueId=${createdQueue._id}` : '';

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-500/30 shadow-inner">
                        <PlusCircle className="text-brand-400" size={32} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-3">
                        Create a <span className="text-gradient-brand">Queue</span>
                    </h2>
                    <p className="text-zinc-400">Set up a new queue and start managing your line.</p>
                </div>

                <AnimatePresence mode="wait">
                    {!createdQueue ? (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-white/5"
                        >
                            <AnimatePresence>
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

                            <form onSubmit={handleCreateQueue} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">Queue Name</label>
                                    <div className="relative">
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                                        <input
                                            className="w-full glass-input pl-12"
                                            type="text"
                                            placeholder="e.g. Support Desk, Doctor Visit"
                                            value={queueName}
                                            onChange={(e) => setQueueName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={!queueName || loading}
                                    className="w-full glass-button-brand py-4 flex items-center justify-center gap-2 disabled:opacity-50 text-base shadow-lg"
                                >
                                    {loading ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <>Create Queue <PlusCircle size={18} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-brand-500/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />
                            
                            <div className="text-center relative z-10 mb-8">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-inner"
                                >
                                    <CheckCircle2 className="text-green-400" size={40} />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">Queue Created!</h3>
                                <p className="text-zinc-400">Share the link or QR code below.</p>
                            </div>

                            <div className="bg-black/40 rounded-2xl p-6 mb-6 border border-white/5 relative z-10 space-y-4 shadow-inner">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Queue Name</p>
                                    <p className="font-bold text-white text-lg">{createdQueue.queueName}</p>
                                </div>
                                
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Queue ID</p>
                                    <div className="flex items-center justify-between gap-2 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                                        <p className="font-mono text-sm text-brand-300 truncate">{createdQueue._id}</p>
                                        <button 
                                            onClick={() => copyToClipboard(createdQueue._id)}
                                            className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                                        >
                                            {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Join Link</p>
                                    <div className="flex items-center justify-between gap-2 bg-black/40 p-3 rounded-xl border border-white/5 shadow-inner">
                                        <p className="font-mono text-sm text-brand-300 truncate">{joinLink}</p>
                                        <button 
                                            onClick={() => copyToClipboard(joinLink)}
                                            className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                                        >
                                            {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <LinkIcon size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl mx-auto w-max relative z-10 shadow-lg border border-white/20 hover:scale-105 transition-transform duration-300 cursor-pointer">
                                <QRCodeCanvas value={joinLink} size={150} />
                                <p className="text-black text-xs font-bold mt-4 flex items-center gap-1"><QrCode size={14}/> Scan to Join</p>
                            </div>
                            
                            <button 
                                onClick={() => setCreatedQueue(null)}
                                className="mt-8 w-full glass-button py-4 relative z-10 font-bold"
                            >
                                Create Another Queue
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export default CreateQueue;