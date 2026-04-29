import React, { useState, useEffect } from 'react';
import { Users, Activity, Bell, HeartPulse, Thermometer, MapPin } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import PageHeader from './PageHeader';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, usersRes, alertsRes] = await Promise.all([
          api.getDashboardStats(),
          api.getChartData(20),
          api.getUsers(),
          fetch('http://localhost:8080/api/alerts/active', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('healthcloud_token')}` }
          }).then(r => r.json()),
        ]);
        
        setStats(statsRes);
        setChartData(chartRes);
        setUsers(usersRes);
        setAlerts(alertsRes);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard data sync failed", err);
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const kpiData = stats ? [
    { label: 'Registered Users', value: String(stats.registeredUsers), icon: Users, color: 'text-indigo-500' },
    { label: 'Total Readings', value: String(stats.totalReadings), icon: Activity, color: 'text-indigo-500' },
    { label: 'Active Alerts', value: String(stats.activeAlerts), icon: Bell, color: 'text-rose-500' },
    { label: 'Avg Heart Rate', value: `${stats.avgHeartRate} bpm`, icon: HeartPulse, color: 'text-indigo-500' },
  ] : [
    { label: 'Registered Users', value: '0', icon: Users, color: 'text-indigo-500' },
    { label: 'Total Readings', value: '0', icon: Activity, color: 'text-indigo-500' },
    { label: 'Active Alerts', value: '0', icon: Bell, color: 'text-rose-500' },
    { label: 'Avg Heart Rate', value: '-- bpm', icon: HeartPulse, color: 'text-indigo-500' },
  ];

  const latestReading = stats?.latestReading || (users.length > 0 ? {
    heartRate: users[0]?.heartRate || '--',
    spo2: users[0]?.spo2 || '--',
    temperature: users[0]?.temperature || '--',
    lat: users[0]?.lat || '--',
    lng: users[0]?.lng || '--',
  } : { heartRate: '--', spo2: '--', temperature: '--', lat: '--', lng: '--' });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <PageHeader title="Wearable Health and Location Monitoring" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpiData.map((kpi, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
              <motion.div 
                animate={kpi.icon === HeartPulse ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </motion.div>
            </div>
            <h3 className="text-[28px] font-bold text-slate-900 mt-2">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Vitals Timeline</h3>
                <p className="text-sm text-slate-500 mt-1">Real-time database feed</p>
              </div>
            </div>
            <div className="h-64 w-full relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} domain={[0, 140]} ticks={[0, 35, 70, 105, 140]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 500 }}
                  />
                  <Line name="Heart Rate" type="monotone" dataKey="heartRate" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={1000} />
                  <Line name="SpO2" type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={1000} />
                  <Line name="Temperature" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
              {chartData.length === 0 && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">No vitals data available</div>
              )}
            </div>
          </motion.div>

          {/* Monitored Users */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Monitored Students</h3>
            <div className="space-y-3">
              {users.map((user, i) => (
                <motion.div 
                   key={user.id} 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 * i }}
                   whileHover={{ x: 5, backgroundColor: "rgba(248, 250, 252, 1)" }}
                   className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 rounded-lg px-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                      {user.name?.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-800">{user.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{user.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-bold text-slate-800">{user.heartRate || '--'} bpm</p>
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-bold rounded-md tracking-widest uppercase shadow-sm",
                      user.status === 'Normal' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                      {user.status || 'Normal'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {users.length === 0 && !loading && <p className="text-sm text-slate-400 text-center py-4">No students found</p>}
            </div>
          </motion.div>
        </div>

        {/* Side Column */}
        <div className="flex flex-col gap-4">
          {/* Latest Reading */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Live Feed</h3>
              <motion.span 
                 animate={{ opacity: [1, 0.5, 1] }} 
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-500 bg-rose-50 border border-rose-100 rounded uppercase shadow-sm"
              >
                LIVE
              </motion.span>
            </div>
            
            <div className="space-y-3">
              {[
                { icon: HeartPulse, label: 'Heart Rate', value: `${latestReading.heartRate} bpm`, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { icon: Activity, label: 'SpO2', value: `${latestReading.spo2}%`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: Thermometer, label: 'Temperature', value: `${latestReading.temperature} C`, color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: MapPin, label: 'Location', value: `${latestReading.lat}, ${latestReading.lng}`, color: 'text-sky-500', bg: 'bg-sky-50' }
              ].map((item, i) => (
                <motion.div 
                   key={i}
                   whileHover={{ scale: 1.02, x: 5 }}
                   className="flex items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer shadow-sm transition-all hover:bg-white"
                >
                   <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-inner", item.bg)}>
                     <item.icon className={cn("w-4 h-4", item.color)} />
                   </div>
                   <div>
                     <p className="text-[11px] font-semibold text-slate-400 uppercase">{item.label}</p>
                     <p className="text-[13px] font-bold text-slate-800">{item.value}</p>
                   </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Recent Alerts</h3>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 h-[260px] custom-scrollbar">
              {alerts.map((alert, i) => (
                <motion.div 
                   key={alert.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   whileHover={{ x: -4 }}
                   className="py-2 border-b border-slate-100 last:border-0 flex items-start gap-4 cursor-pointer"
                >
                  <motion.div 
                     animate={alert.severity === 'CRITICAL' ? { scale: [1, 1.3, 1] } : {}}
                     transition={{ repeat: Infinity, duration: 1 }}
                     className="mt-1"
                  >
                     {alert.severity === 'CRITICAL' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                     ) : alert.severity === 'HIGH' ? (
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                     ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                     )}
                  </motion.div>
                  <div className="flex-1">
                     <div className="flex items-center justify-between">
                         <h4 className="text-[13px] font-bold text-slate-800">{alert.user}</h4>
                         <span className="text-[10px] text-slate-400 font-medium">
                           {alert.time}
                         </span>
                     </div>
                     <p className="text-[12px] text-slate-500 font-medium mt-1 leading-snug">{alert.message}</p>
                  </div>
                </motion.div>
              ))}
              {alerts.length === 0 && !loading && (
                <p className="text-sm text-slate-400 text-center py-8">No alerts yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
