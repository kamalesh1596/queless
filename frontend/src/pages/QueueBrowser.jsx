import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LogIn, Hash, LayoutList, Users, Clock, QrCode, Filter, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

function QueueBrowser() {
    const [queues, setQueues] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All'); // All, Active, Paused
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQueues();
    }, []);

    const fetchQueues = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(
                'http://localhost:5000/api/queues',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQueues(res.data);
        } catch (err) {
            console.error('Failed to fetch queues', err);
        } finally {
            setLoading(false);
        }
    };

    const joinQueue = async (queueId) => {
        navigate(`/join-queue?queueId=${queueId}`);
    };

    const filteredQueues = queues.filter(queue => {
        const matchesSearch = queue.queueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              queue._id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' ? true : queue.status.toLowerCase() === filter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const filterOptions = ['All', 'Active', 'Paused'];

    return (
        <div className="space-y-8 pb-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
            >
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <LayoutList className="text-brand-400" size={32} />
                        Browse <span className="text-gradient-brand">Queues</span>
                    </h2>
                    <p className="text-zinc-400">Discover and join active queues in the system.</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5 shadow-lg">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            className="w-full bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/20 transition-all duration-300 rounded-xl py-3 pl-12 pr-4"
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="flex items-center gap-2 px-3 text-zinc-500 border-r border-white/10 mr-2">
                            <Filter size={16} />
                            <span className="text-sm font-medium">Filter</span>
                        </div>
                        {filterOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => setFilter(option)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                    filter === option 
                                    ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-brand-400' 
                                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="show" 
                className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {loading ? (
                    // Skeleton loaders
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="skeleton-loader h-64 border border-white/5 shadow-lg" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredQueues.map((queue) => (
                            <motion.div
                                key={queue._id}
                                layout
                                variants={itemVariants}
                                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group flex flex-col h-full border border-white/5 hover:border-brand-500/30 shadow-lg hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/20 transition-colors" />
                                
                                <div className="flex justify-between items-start mb-5 relative z-10">
                                    <div className="p-3 bg-gradient-to-br from-brand-500/20 to-purple-500/10 rounded-xl text-brand-400 border border-brand-500/20 shadow-inner">
                                        <Hash size={20} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                                        queue.status.toLowerCase() === 'active' 
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                        {queue.status.toLowerCase() === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                        {queue.status}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 relative z-10">
                                    {queue.queueName}
                                </h3>
                                <p className="text-xs text-zinc-500 mb-6 font-mono truncate relative z-10">ID: {queue._id}</p>

                                <div className="grid grid-cols-2 gap-3 mb-6 flex-1 relative z-10">
                                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 shadow-inner">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5"><Users size={12} className="text-brand-400"/> Current</p>
                                        <p className="text-2xl font-black text-white">{queue.currentToken}</p>
                                    </div>
                                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 shadow-inner">
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5"><Clock size={12} className="text-yellow-400"/> Issued</p>
                                        <p className="text-2xl font-bold text-zinc-400">{queue.lastToken}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => joinQueue(queue._id)}
                                    className="w-full glass-button-brand py-3 flex items-center justify-center gap-2 mt-auto relative z-10 group/btn"
                                >
                                    <LogIn size={18} className="group-hover/btn:translate-x-1 transition-transform" /> Join Queue
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredQueues.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="col-span-full glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center text-zinc-400 border border-dashed border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl"></div>
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 relative z-10 shadow-inner">
                            <Sparkles size={32} className="text-zinc-500" />
                        </div>
                        <p className="text-2xl font-bold text-white mb-2 relative z-10">No queues found</p>
                        <p className="max-w-md relative z-10">We couldn't find any queues matching your current filters and search terms.</p>
                        {(searchTerm || filter !== 'All') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setFilter('All'); }}
                                className="mt-6 px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                            >
                                Clear Filters
                            </button>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default QueueBrowser;