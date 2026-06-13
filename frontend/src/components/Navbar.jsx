import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  User,
  LayoutDashboard,
  PlusCircle,
  LogIn,
  MapPin,
  List,
  Bell,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const navLinks = token
    ? [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/create-queue', label: 'Create', icon: PlusCircle },
      { path: '/join-queue', label: 'Join', icon: LogIn },
      { path: '/position', label: 'Position', icon: MapPin },
      { path: '/queues', label: 'Browse', icon: List },
    ]
    : [
      { path: '/login', label: 'Login', icon: LogIn },
      { path: '/register', label: 'Register', icon: User },
    ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass border-b border-white/5 px-6 py-4 flex justify-between items-center"
    >
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center border border-brand-500/30 group-hover:bg-brand-500/30 transition-colors">
            <div className="w-4 h-4 rounded-sm bg-brand-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-brand-300 transition-colors">
            QueLess
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-1 items-center bg-black/20 p-1 rounded-full border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {token && (
          <div className="hidden md:flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full border border-black shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden xl:block">
                <span className="text-sm font-medium text-white block">{userName}</span>
                <span className="text-xs text-zinc-500 block -mt-1">Admin</span>
              </div>
              <button
                onClick={logout}
                className="ml-2 p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 active:scale-95 border border-transparent hover:border-red-500/20"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
        
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-[72px] left-0 w-full glass-panel border-b border-white/5 p-4 flex flex-col gap-2 lg:hidden shadow-2xl"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            {token && (
              <>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{userName}</span>
                    <span className="text-xs text-zinc-400 block">Administrator</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full text-left border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={18} />
                  Log out of QueLess
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
