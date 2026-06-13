import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQueue from './pages/CreateQueue';
import JoinQueue from './pages/JoinQueue';
import Position from './pages/Position';
import ProtectedRoute from './components/ProtectedRoute';
import QueueBrowser from './pages/QueueBrowser';
import Navbar from './components/Navbar';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-7xl mx-auto"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route
          path="/create-queue"
          element={
            <ProtectedRoute>
              <PageTransition><CreateQueue /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/join-queue"
          element={
            <ProtectedRoute>
              <PageTransition><JoinQueue /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/position"
          element={
            <ProtectedRoute>
              <PageTransition><Position /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/queues"
          element={
            <ProtectedRoute>
              <PageTransition><QueueBrowser /></PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-white overflow-hidden relative">
        <Navbar />
        <main className="p-4 md:p-8 relative z-10">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;