import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import PageHeader from './PageHeader';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AlertsView() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      // Call the active alerts endpoint to show only unresolved issues
      const res = await fetch('http://localhost:8080/api/alerts/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('healthcloud_token')}`
        }
      });
      const data = await res.json();
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // More frequent polling for alerts
    return () => clearInterval(interval);
  }, []);

  const handleMarkReviewed = async (id: number) => {
    try {
      await api.markAlertReviewed(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateX: 20 },
    show: { opacity: 1, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
  };

  return (
    <div className="relative perspective-1000">
      <PageHeader title="Alert Management" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => {
            let severityColor = "bg-slate-50 text-slate-600";
            let pulseColor = "";
            let pulseDuration = 2;
            
            if (alert.severity === 'CRITICAL') {
              severityColor = "bg-rose-50 text-rose-600 ring-1 ring-rose-200 shadow-rose-100";
              pulseColor = "rgba(244, 63, 94, 0.4)";
              pulseDuration = 0.5;
            } else if (alert.severity === 'HIGH') {
              severityColor = "bg-orange-50 text-orange-600 ring-1 ring-orange-200 shadow-orange-100";
              pulseColor = "rgba(249, 115, 22, 0.3)";
              pulseDuration = 1;
            } else if (alert.severity === 'MEDIUM') {
              severityColor = "bg-blue-50 text-blue-600 ring-1 ring-blue-200 shadow-blue-100";
              pulseColor = "rgba(59, 130, 246, 0.2)";
              pulseDuration = 2;
            }

            return (
              <motion.div 
                key={alert.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.02, y: -5, boxShadow: "0px 10px 25px rgba(0,0,0,0.05)" }}
                className={cn("bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col relative overflow-hidden group")}
              >
                {(alert.severity === 'CRITICAL' || alert.severity === 'HIGH') && (
                   <motion.div 
                     animate={{ opacity: [0.1, 0.2, 0.1] }}
                     transition={{ repeat: Infinity, duration: pulseDuration }}
                     className="absolute inset-0 z-0 pointer-events-none"
                     style={{ background: `radial-gradient(circle at top right, ${pulseColor}, transparent 60%)` }}
                   />
                )}
              
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{alert.type}</h3>
                  <motion.span 
                    animate={alert.severity === 'CRITICAL' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={cn("px-2.5 py-1 text-[10px] uppercase font-bold rounded-md tracking-wider shadow-sm", severityColor)}
                  >
                    {alert.severity}
                  </motion.span>
                </div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                   <motion.div 
                     whileHover={{ rotate: 15 }}
                     className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner"
                   >
                      <Bell className={cn("w-4 h-4", alert.severity === 'CRITICAL' ? "text-rose-500" : "text-slate-400")} />
                   </motion.div>
                   <div>
                      <h4 className="text-[14px] font-bold text-slate-800">{alert.user}</h4>
                      <p className="text-[12px] text-slate-400 font-medium">
                        {alert.time}
                      </p>
                   </div>
                </div>

                <p className="text-[14px] text-slate-800 font-medium mb-8 relative z-10">
                  {alert.message}
                </p>

                <div className="flex items-center gap-3 mt-auto relative z-10">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm hover:text-indigo-600 hover:border-indigo-200"
                  >
                    <Bell className="w-4 h-4" />
                    Notify
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkReviewed(alert.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl hover:bg-emerald-50 transition-colors bg-white shadow-sm hover:text-emerald-600 hover:border-emerald-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Reviewed
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {alerts.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 md:col-span-2 text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">All Systems Normal</h3>
            <p className="text-slate-400 font-medium mt-1">No active student alerts at the moment.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
