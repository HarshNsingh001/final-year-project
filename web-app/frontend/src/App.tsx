import React, { useState } from 'react';
import { isLoggedIn, clearToken } from './lib/api';
import { 
  Activity, 
  Users, 
  MapPin, 
  Bell, 
  Shield, 
  HeartPulse,
  LogOut
} from 'lucide-react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import UsersView from './components/UsersView';
import LocationView from './components/LocationView';
import AlertsView from './components/AlertsView';
import SecurityView from './components/SecurityView';
import AuthView from './components/AuthView';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'users' | 'location' | 'alerts' | 'security';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isLoggedIn());
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Activity },
    { name: 'Users', id: 'users', icon: Users },
    { name: 'Location', id: 'location', icon: MapPin },
    { name: 'Alerts', id: 'alerts', icon: Bell },
    { name: 'Security', id: 'security', icon: Shield },
  ] as const;

  if (!isAuthenticated) {
    return <AuthView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <HeartPulse className="w-6 h-6 text-indigo-500 mr-2" />
          </motion.div>
          <div className="font-bold text-lg text-indigo-500 tracking-tight">
            HealthCloud
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 flex flex-col justify-between">
          <div className="space-y-1">
            {navigation.map((item, i) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors relative overflow-hidden",
                    isActive 
                      ? "text-indigo-600" 
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-slate-100 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-300", isActive ? "text-indigo-600" : "text-slate-400")} />
                  {item.name}
                </motion.button>
              );
            })}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
            className="border-t border-slate-100 pt-4 mt-6"
          >
             <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { clearToken(); setIsAuthenticated(false); }}
                className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors group"
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0 text-slate-400 group-hover:text-rose-500 transition-colors" />
                Sign Out
              </motion.button>
          </motion.div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100 z-10">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0 shadow-sm relative z-20"
        >
            <div className="font-semibold text-lg text-slate-800 tracking-tight">Overview</div>
            <div className="flex items-center gap-4">
               <div className="text-sm text-slate-400 font-medium">Updated 2 mins ago</div>
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-sm"
               >
                   <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                     A
                   </div>
                   Institution Admin
               </motion.div>
            </div>
        </motion.div>
        
        <div className="flex-1 overflow-y-auto p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'users' && <UsersView />}
              {activeTab === 'location' && <LocationView />}
              {activeTab === 'alerts' && <AlertsView />}
              {activeTab === 'security' && <SecurityView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
