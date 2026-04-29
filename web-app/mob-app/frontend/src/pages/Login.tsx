import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { HeartPulse, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email.endsWith('.edu')) {
      useAuthStore.setState({ error: 'Please use a valid college email address (.edu)' });
      return;
    }
    
    if (password.length < 6) {
      useAuthStore.setState({ error: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error is already set in the store
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: 'blur(10px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="mobile-container w-full h-full flex flex-col relative bg-black text-white px-6 py-12 justify-center overflow-hidden">
      {/* Abstract Background for Login */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-[-10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-teal-600/30 blur-[100px] mix-blend-screen pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-emerald-600/30 blur-[100px] mix-blend-screen pointer-events-none" 
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full"
      >
        <motion.div variants={itemVariants} className="flex flex-col mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center text-teal-400 mb-6 border border-white/20 shadow-[0_0_30px_rgba(45,212,191,0.2)] backdrop-blur-xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.15, 0.3, 0.45, 1] }}
            >
              <HeartPulse className="w-8 h-8" />
            </motion.div>
          </motion.div>
          <h1 className="text-4xl font-light tracking-tight text-white mb-2">Sign in</h1>
          <p className="text-gray-400 text-sm font-medium">To access HealthCloud</p>
        </motion.div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <motion.div variants={itemVariants} className="glass rounded-3xl p-2 flex flex-col relative overflow-hidden">
            {/* Animated border shine */}
            <motion.div 
              animate={{ left: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-45deg] pointer-events-none" 
              style={{ left: "-100%" }}
            />
            
            <div className="px-4 py-3 border-b border-white/10 relative z-10">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">College Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder:text-gray-600 transition-colors"
                required
              />
            </div>
            
            <div className="px-4 py-3 relative z-10">
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1 font-semibold">Password</label>
              <div className="flex items-center gap-2">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white font-medium focus:outline-none placeholder:text-gray-600 transition-colors"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-400 text-xs px-2 font-medium"
            >
               {error}
            </motion.p>
          )}

          <motion.div variants={itemVariants}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-full font-semibold mt-4 transition-all disabled:opacity-70 flex justify-center items-center gap-2 group overflow-hidden relative"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                   <motion.div
                     key="loading"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="flex items-center gap-2"
                   >
                     <motion.div
                       animate={{ rotate: 360 }}
                       transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                     >
                       <HeartPulse className="w-4 h-4" />
                     </motion.div>
                     Authenticating...
                   </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    Continue
                    <motion.div 
                      className="group-hover:translate-x-1 transition-transform"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
