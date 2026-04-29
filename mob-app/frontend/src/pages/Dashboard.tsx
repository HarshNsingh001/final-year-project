import { useEffect } from 'react';
import { useBleStore } from '../store/useBleStore';
import { useHealthDataStore } from '../store/useHealthDataStore';
import { PageTransition } from '../components/AppLayout';
import { HeartPulse, Footprints, Watch, AlertCircle, Heart, Droplets, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const { connectionState, deviceName } = useBleStore();
  const { currentHeartRate, currentSteps, currentSpo2, lastSyncTimestamp, fetchLatestVitals } = useHealthDataStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestVitals();
  }, [fetchLatestVitals]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, filter: 'blur(10px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <PageTransition>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-4"
      >
        
        {/* Main Vital: Heart Rate */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="glass rounded-[32px] p-6 relative overflow-hidden group"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500 blur-[50px] rounded-full pointer-events-none" 
          />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              >
                <Heart className="w-4 h-4 fill-current" />
              </motion.div>
              <span className="text-xs font-semibold uppercase tracking-wider">Heart Rate</span>
            </div>
            <HeartPulse className="w-5 h-5 text-gray-500 opacity-50" />
          </div>
          
          <div className="relative z-10 flex items-baseline gap-2 mt-2">
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={currentHeartRate}
                initial={{ y: 20, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(10px)', position: 'absolute' }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-7xl font-light tracking-tighter text-white"
              >
                {currentHeartRate || '--'}
              </motion.span>
            </AnimatePresence>
            <span className="text-lg text-gray-400 font-medium ml-2">BPM</span>
          </div>
        </motion.div>

        {/* SpO2 & Steps Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* SpO2 */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="glass rounded-[28px] p-5 relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 blur-[40px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 text-blue-400 mb-4 relative z-10">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">SpO2</span>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={currentSpo2}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <span className="text-3xl font-light tracking-tight text-white">{currentSpo2 || '--'}</span>
                <span className="text-sm text-gray-500 ml-1">%</span>
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest relative z-10 mt-1">Oxygen</p>
          </motion.div>

          {/* Steps */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="glass rounded-[28px] p-5 relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-[40px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-2 text-emerald-400 mb-4 relative z-10">
              <Footprints className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Steps</span>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div 
                key={currentSteps}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-light tracking-tight text-white mb-1 relative z-10"
              >
                {currentSteps.toLocaleString()}
              </motion.div>
            </AnimatePresence>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest relative z-10">Today</p>
          </motion.div>
        </div>

        {/* Connection Status */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => connectionState !== 'connected' && navigate('/settings')}
          className="glass rounded-[28px] p-5 relative overflow-hidden cursor-pointer"
        >
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none blur-[40px] ${connectionState === 'connected' ? 'bg-cyan-500/20' : 'bg-gray-500/20'}`} />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${connectionState === 'connected' ? 'bg-cyan-500/20 border border-cyan-500/20' : 'bg-gray-500/20 border border-gray-500/20'}`}>
                <Watch className={`w-5 h-5 ${connectionState === 'connected' ? 'text-cyan-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {connectionState === 'connected' ? deviceName : 'No Device Connected'}
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  {connectionState === 'connected' ? 'Streaming Live Data' : 'Tap to Connect'}
                </p>
              </div>
            </div>
            {connectionState === 'connected' && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2.5 h-2.5 rounded-full bg-emerald-400"
              />
            )}
          </div>
        </motion.div>
        
        {/* Alerts */}
        <AnimatePresence>
          {currentHeartRate > 120 && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="glass border-orange-500/30 rounded-[24px] p-5 flex gap-4 items-start relative overflow-hidden"
            >
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-orange-500/20 pointer-events-none" 
              />
              <div className="bg-orange-500/20 p-2 rounded-full border border-orange-500/30 relative z-10">
                <AlertCircle className="text-orange-400 w-5 h-5 shrink-0" />
              </div>
              <div className="relative z-10">
                <h4 className="text-sm font-semibold text-orange-400">Elevated Heart Rate</h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">Your heart rate corresponds to vigorous activity. Please rest if not exercising.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Info */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-4 text-center border-white/5 opacity-80 backdrop-blur-md">
          <p className="text-[10px] text-cyan-200/60 font-mono tracking-widest uppercase">
            Last Sync: {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleTimeString() : 'Pending'}
          </p>
        </motion.div>

      </motion.div>
    </PageTransition>
  );
}
