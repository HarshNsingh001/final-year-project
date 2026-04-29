import { useState } from 'react';
import { PageTransition } from '../components/AppLayout';
import { useBleStore } from '../store/useBleStore';
import { useAuthStore } from '../store/useAuthStore';
import { connectRealDevice, disconnectRealDevice } from '../services/bleReal';
import { startSimulator, stopSimulator } from '../services/bleSimulator';
import { startHealthConnectPolling, stopHealthConnectPolling, openHealthSettings } from '../services/healthConnect';
import { Capacitor } from '@capacitor/core';
import { Bluetooth, LogOut, Beaker, ChevronRight, HeartPulse, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function Settings() {
  const { connectionState, deviceName, isSimulated } = useBleStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [connectError, setConnectError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const handleConnectSimulator = () => {
    setConnectError(null);
    startSimulator();
  };

  const handleConnectRealDevice = async () => {
    setConnectError(null);
    try { await connectRealDevice(); } catch (e: any) { setConnectError(e.message || "Could not connect via Bluetooth"); }
  };

  const handleConnectHealthConnect = async () => {
    setConnectError(null);
    try {
      await startHealthConnectPolling();
    } catch (e: any) {
      setConnectError(e.message || "Could not connect to Health Connect");
    }
  };

  const handleDisconnect = () => {
    setConnectError(null);
    if (isSimulated) {
      stopSimulator();
    } else {
      disconnectRealDevice();
      stopHealthConnectPolling();
    }
  };

  const handleLogout = () => { handleDisconnect(); logout(); navigate('/login'); };

  return (
    <PageTransition>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="p-6 space-y-8"
      >
        
        {/* Device Section */}
        <motion.section variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Connections</h2>
          <div className="glass rounded-[28px] overflow-hidden flex flex-col p-2 space-y-1">
            
            {connectionState === 'connected' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 flex flex-col items-center"
              >
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30"
                >
                  <HeartPulse className="w-8 h-8" />
                </motion.div>
                <h3 className="font-light text-xl text-white mb-1">{deviceName}</h3>
                <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wider">
                  {isSimulated ? 'Simulation Mode' : deviceName?.includes('Health Connect') ? 'Health Connect API' : 'Web Bluetooth API'}
                </p>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDisconnect}
                  className="w-full py-3.5 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors border border-white/10"
                >
                  Disconnect Device
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Health Connect — Primary option for real watch data */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnectHealthConnect}
                  disabled={connectionState === 'connecting'}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                      <HeartPulse className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-white block">Health Connect</span>
                      <span className="text-[10px] text-gray-500">Fire-Boltt / Da Fit → Real Data</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Direct Bluetooth — only show in browser (Web Bluetooth API) */}
                {!isNative && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConnectRealDevice}
                    disabled={connectionState === 'connecting'}
                    className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/20">
                        <Bluetooth className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium text-white block">Direct Bluetooth</span>
                        <span className="text-[10px] text-gray-500">Standard BLE (Browser only)</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </motion.button>
                )}
                
                {/* Simulator — for testing */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnectSimulator}
                  disabled={connectionState === 'connecting'}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-transparent disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/20">
                      <Beaker className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-white block">Simulate Device</span>
                      <span className="text-[10px] text-gray-500">For testing without hardware</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </motion.button>
              </>
            )}
            
          </div>

          {/* Error message */}
          {connectError && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-red-400 text-xs px-4 mt-3 font-medium"
            >
              ⚠️ {connectError}
            </motion.p>
          )}

          {connectionState !== 'connected' && (
            <p className="text-[10px] text-gray-500 mt-3 ml-4">
              {isNative 
                ? 'Tap Health Connect to read real data from your Fire-Boltt watch via Da Fit app.'
                : 'Use simulator for browser testing. Install APK on phone for real watch data.'}
            </p>
          )}
        </motion.section>

        {/* Health Connect Settings */}
        {isNative && (
          <motion.section variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Health Platform</h2>
            <div className="glass rounded-[28px] overflow-hidden p-2 space-y-1">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openHealthSettings}
                className="w-full p-4 flex items-center justify-between rounded-2xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                   <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/10">
                     <Settings2 className="w-5 h-5 text-cyan-400" />
                   </div>
                   <span className="text-sm font-medium text-white">Health Connect Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* Account Info & Logout */}
        <motion.section variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-4">Account</h2>
          <div className="glass rounded-[28px] overflow-hidden p-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full p-4 flex items-center justify-between rounded-2xl hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/10">
                   <LogOut className="w-5 h-5 text-rose-500" />
                 </div>
                 <span className="text-sm font-medium text-white">Sign Out</span>
              </div>
            </motion.button>
          </div>
        </motion.section>

        <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-center text-[10px] text-gray-600 uppercase tracking-wider mb-24 font-semibold">
          App Version 2.0.0<br/>HealthCloud for Android
        </motion.p>

      </motion.div>
    </PageTransition>
  );
}
