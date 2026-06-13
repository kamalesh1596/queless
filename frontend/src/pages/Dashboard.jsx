import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import { motion, useInView, useAnimation, useIsPresent } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, Copy, ChevronRight, BarChart3, QrCode, LayoutList } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

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

// CountUp Component for animated numbers
function CountUp({ end, duration = 1.5 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const stepTime = Math.abs(Math.floor(duration * 1000 / end)) || 10;
            const timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start >= end) {
                    clearInterval(timer);
                    setCount(end);
                }
            }, stepTime);
            return () => clearInterval(timer);
        }
    }, [end, duration, inView]);

    return <span ref={ref}>{end === 0 ? 0 : count}</span>;
}

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-2xl">
                <p className="text-sm text-zinc-400 mb-1">{label}</p>
                <p className="text-xl font-bold" style={{ color: payload[0].payload.color }}>
                    {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

function Dashboard() {
    const [queues, setQueues] = useState([]);
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');

    const fetchQueues = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/queues/my-queues', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setQueues(res.data);
            
            // Prefetch details for all queues to prevent jank
            res.data.forEach(q => fetchDetails(q._id));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (queueId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/queues/${queueId}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDetails((prev) => ({ ...prev, [queueId]: res.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleNextCustomer = async (queueId) => {
        try {
            await axios.put(
                'http://localhost:5000/api/queues/next',
                { queueId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchQueues();
            fetchDetails(queueId);
        } catch (err) {
            console.error(err);
        }
    };

    const copyQueueId = (queueId) => {
        navigator.clipboard.writeText(queueId);
    };

    useEffect(() => {
        fetchQueues();
        const socket = io('http://localhost:5000');
        socket.on('queueUpdated', () => {
            fetchQueues();
        });
        return () => socket.disconnect();
    }, []);

    const totalQueues = queues.length;
    const totalWaiting = Object.values(details).reduce((sum, item) => sum + (item?.waitingCount || 0), 0);
    const totalServed = Object.values(details).reduce((sum, item) => sum + (item?.servedCount || 0), 0);
    const totalCancelled = Object.values(details).reduce((sum, item) => sum + (item?.cancelledCount || 0), 0);

    const chartData = [
        { name: 'Waiting', value: totalWaiting, color: '#eab308', fillId: 'colorWaiting' },
        { name: 'Served', value: totalServed, color: '#22c55e', fillId: 'colorServed' },
        { name: 'Cancelled', value: totalCancelled, color: '#ef4444', fillId: 'colorCancelled' },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12">
            <motion.div variants={itemVariants} className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Welcome back, <span className="text-gradient-brand">{userName}</span>
                    </h2>
                    <p className="text-zinc-400">Here's what's happening with your queues today.</p>
                </div>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div variants={itemVariants} className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg hover:shadow-brand-500/10 border border-white/5 hover:border-brand-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                            <Users size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-400 mb-1 relative z-10">Total Queues</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">
                        <CountUp end={totalQueues} />
                    </h3>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg hover:shadow-yellow-500/10 border border-white/5 hover:border-yellow-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                            <Clock size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-400 mb-1 relative z-10">Total Waiting</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">
                        <CountUp end={totalWaiting} />
                    </h3>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg hover:shadow-green-500/10 border border-white/5 hover:border-green-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-400 mb-1 relative z-10">Total Served</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">
                        <CountUp end={totalServed} />
                    </h3>
                </motion.div>

                <motion.div variants={itemVariants} className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-lg hover:shadow-red-500/10 border border-white/5 hover:border-red-500/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                            <XCircle size={20} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-400 mb-1 relative z-10">Total Cancelled</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">
                        <CountUp end={totalCancelled} />
                    </h3>
                </motion.div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <LayoutList className="text-brand-400" size={24} />
                            Active Queues
                        </h3>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {loading ? (
                            <>
                                <div className="skeleton-loader h-64" />
                                <div className="skeleton-loader h-64" />
                            </>
                        ) : queues.length > 0 ? (
                            queues.map((queue) => (
                                <motion.div
                                    key={queue._id}
                                    layoutId={`queue-${queue._id}`}
                                    className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">{queue.queueName}</h4>
                                            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 w-max">
                                                {queue._id.slice(0, 8)}...
                                                <button onClick={() => copyQueueId(queue._id)} className="hover:text-white transition-colors" title="Copy ID">
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold border border-green-500/20">
                                            {queue.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                                            <p className="text-xs text-zinc-400 mb-1">Current Token</p>
                                            <p className="text-3xl font-bold text-brand-400">{queue.currentToken}</p>
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                                            <p className="text-xs text-zinc-400 mb-1">Total Issued</p>
                                            <p className="text-3xl font-bold text-white">{queue.lastToken}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => handleNextCustomer(queue._id)}
                                            className="flex-1 glass-button-brand py-3 flex justify-center items-center gap-2"
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => fetchDetails(queue._id)}
                                            className="glass-button px-5 py-3 text-sm font-semibold"
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    {details[queue._id] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-6 pt-6 border-t border-white/10"
                                        >
                                            <div className="grid grid-cols-3 gap-3 text-center">
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl py-3 shadow-sm">
                                                    <p className="text-yellow-400 font-bold text-lg">{details[queue._id].waitingCount}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mt-1">Wait</p>
                                                </div>
                                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl py-3 shadow-sm">
                                                    <p className="text-green-400 font-bold text-lg">{details[queue._id].servedCount}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mt-1">Served</p>
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl py-3 shadow-sm">
                                                    <p className="text-red-400 font-bold text-lg">{details[queue._id].cancelledCount}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium mt-1">Cancel</p>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex flex-col items-center justify-center bg-white p-4 rounded-xl w-max mx-auto shadow-xl">
                                                <QRCodeCanvas
                                                    value={`http://localhost:5173/join-queue?queueId=${queue._id}`}
                                                    size={120}
                                                />
                                                <p className="text-black font-semibold text-xs mt-3 opacity-60">Scan to join</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-2 glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center text-zinc-400 border border-dashed border-white/20 relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
                                <QrCode size={64} className="mb-6 text-brand-400/50 relative z-10" />
                                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">No queues yet</h3>
                                <p className="mb-8 max-w-md relative z-10">You haven't created any queues yet. Start managing your lines by creating your first queue.</p>
                                <a href="/create-queue" className="glass-button-brand px-6 py-3 relative z-10 inline-flex items-center gap-2">
                                    Create a Queue <ChevronRight size={16} />
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="text-brand-400" size={24} />
                        Analytics
                    </h3>
                    <div className="glass p-6 rounded-3xl h-[420px] flex flex-col border border-white/5 shadow-xl">
                        <p className="text-sm font-medium text-zinc-400 mb-8">Performance Overview</p>
                        <div className="flex-1 w-full min-h-0 relative">
                            {/* SVG Defs for gradients */}
                            <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                                <defs>
                                    <linearGradient id="colorWaiting" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorServed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                            </svg>
                            
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 13, fontWeight: 500 }} dy={16} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)', radius: 8 }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1500}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#${entry.fillId})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Dashboard;

