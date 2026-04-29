import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';

export function Splash({ onComplete }: { onComplete?: () => void }) {
  const navigate = useNavigate();
  const { isAuthenticated, validateToken } = useAuthStore();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Logo appears
    const timer1 = setTimeout(() => setPhase(1), 100);
    // Phase 2: The "Netflix" burst (zoom in heavily)
    const timer2 = setTimeout(() => setPhase(2), 1800);
    // Phase 3: Transition out (fade to black before nav)
    const timer3 = setTimeout(() => setPhase(3), 2600);
    
    // Validate token with backend while animation plays
    let tokenValid = false;
    const validateAndNavigate = async () => {
      if (isAuthenticated) {
        tokenValid = await validateToken();
      }
    };
    validateAndNavigate();

    // Navigate after animation completes
    const timer4 = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        if (tokenValid) {
          navigate('/');
        } else {
          navigate('/login');
        }
      }
    }, 2800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isAuthenticated, navigate, onComplete, validateToken]);

  return (
    <div className="mobile-container w-full h-full bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      <AnimatePresence>
        {phase < 3 && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            <div className="relative flex items-center justify-center">
              
              {/* Spectrum layers for the Netflix "ribbon" effect */}
              {phase >= 2 && (
                <>
                  <motion.div
                    initial={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                    animate={{ scaleX: 20, scaleY: 20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeIn" }}
                    className="absolute z-10 w-24 h-24 bg-teal-500 rounded-full mix-blend-screen"
                  />
                  <motion.div
                     initial={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                     animate={{ scaleX: 25, scaleY: 25, opacity: 0 }}
                     transition={{ duration: 0.6, ease: "easeIn", delay: 0.05 }}
                     className="absolute z-0 w-24 h-24 bg-cyan-300/80 rounded-full mix-blend-screen"
                   />
                </>
              )}

              {/* Main Core Logo */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: phase >= 2 ? 10 : 1, 
                  opacity: phase >= 2 ? 0 : 1
                }}
                transition={{ 
                  scale: { duration: 0.5, ease: "easeIn" },
                  opacity: { duration: 0.3, delay: phase >= 2 ? 0.1 : 0 }
                }}
                className="w-24 h-24 flex items-center justify-center relative z-20"
              >
                <HeartPulse 
                  strokeWidth={2} 
                  className="w-16 h-16 text-teal-400"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: phase === 1 ? 1 : 0, 
                  scale: phase === 1 ? 1 : 1.2
                }}
                transition={{ duration: 0.5, ease: "easeIn" }}
                className="flex flex-col items-center mt-6 absolute top-full w-64"
              >
                <h1 className="text-3xl font-bold tracking-tighter text-white mb-2" style={{ textShadow: "0 4px 20px rgba(45,212,191,0.5)"}}>
                  HealthCloud
                </h1>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
                  className="h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent mb-3"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
