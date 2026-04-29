import React, { useState } from 'react';
import { HeartPulse, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

interface AuthViewProps {
  onLogin: () => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await api.login(email, password);
      } else {
        result = await api.register(name, email, password);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onLogin();
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans text-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
        className="absolute w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl -top-40 -right-40 pointer-events-none" 
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/5 border border-slate-200 overflow-hidden relative z-10"
      >
        {/* Header section */}
        <motion.div variants={itemVariants} className="pt-10 pb-6 px-10 text-center relative">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-100 to-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <HeartPulse className="w-8 h-8 text-indigo-600" />
            </motion.div>
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Welcome to HealthCloud
          </h1>
          <p className="text-sm font-medium text-slate-500">
            {isLogin ? 'Sign in to access your dashboard' : 'Create an account to get started'}
          </p>
        </motion.div>

        {/* Auth Toggle */}
        <motion.div variants={itemVariants} className="px-10 mb-6">
          <div className="flex p-1 bg-slate-100/80 rounded-xl relative">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 relative",
                isLogin ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all z-10 relative",
                !isLogin ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Sign Up
            </button>
            <motion.div 
              className="absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm z-0"
              initial={false}
              animate={{ left: isLogin ? '4px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="px-10 mb-4">
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 font-medium">
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <motion.div whileFocus={{ scale: 1.01 }} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400 hover:bg-white"
                    placeholder="John Doe"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <motion.div whileFocus={{ scale: 1.01 }} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400 hover:bg-white"
                placeholder="name@example.com"
              />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <motion.div whileFocus={{ scale: 1.01 }} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800 placeholder:text-slate-400 hover:bg-white"
                placeholder="••••••••"
              />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-end"
              >
                <motion.a whileHover={{ scale: 1.05 }} href="#" className="text-[12px] font-semibold text-indigo-500 hover:text-indigo-600">
                  Forgot password?
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-md shadow-indigo-200 overflow-hidden relative group disabled:opacity-70"
          >
            <motion.div 
               className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
            />
            <span className="relative z-10">{loading ? 'Please wait...' : (isLogin ? 'Sign In to Dashboard' : 'Create Account')}</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="relative z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
