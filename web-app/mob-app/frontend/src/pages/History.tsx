import { useState, useMemo, useEffect } from 'react';
import { PageTransition } from '../components/AppLayout';
import { useHealthDataStore } from '../store/useHealthDataStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';
import { Heart, Droplets, Footprints } from 'lucide-react';

export function History() {
  const [filter, setFilter] = useState<'realtime'|'daily'|'weekly'|'monthly'>('realtime');
  const [activeChart, setActiveChart] = useState<'hr'|'spo2'|'steps'>('hr');
  const { dataQueue, fetchHistory, fetchSummary, currentSpo2 } = useHealthDataStore();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ todayAvgHeartRate: number; todaySteps: number; totalReadings: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch history from backend when filter changes
  useEffect(() => {
    if (filter === 'realtime') return;
    
    setLoading(true);
    fetchHistory(filter as 'daily' | 'weekly' | 'monthly')
      .then(data => {
        setHistoryData(data);
        setLoading(false);
      });
  }, [filter, fetchHistory]);

  // Fetch summary on mount
  useEffect(() => {
    fetchSummary().then(data => setSummary(data));
  }, [fetchSummary]);

  // Realtime chart data from local queue
  const realtimeChartData = useMemo(() => {
    if (dataQueue.length < 5) {
      return Array.from({length: 20}).map((_, i) => ({
        time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        hr: 70 + Math.random() * 20,
        spo2: 95 + Math.random() * 4,
        steps: Math.floor(Math.random() * 200),
      }));
    }
    const slice = dataQueue.slice(-30);
    return slice.map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      hr: d.heartRate,
      spo2: d.spo2 || 0,
      steps: d.steps,
    }));
  }, [dataQueue]);

  // History chart data from backend
  const historyChartData = useMemo(() => {
    return historyData.map(d => ({
      label: d.label || d.date,
      hr: d.avgHeartRate,
      steps: d.totalSteps,
      spo2: 97, // Backend doesn't have spo2 history yet — placeholder
    }));
  }, [historyData]);

  const chartData = filter === 'realtime' ? realtimeChartData : historyChartData;

  const chartConfigs = {
    hr: { color: '#f43f5e', gradientFrom: '#f43f5e', gradientTo: 'transparent', label: 'Heart Rate', unit: 'bpm', icon: Heart },
    spo2: { color: '#3b82f6', gradientFrom: '#3b82f6', gradientTo: 'transparent', label: 'Blood Oxygen', unit: '%', icon: Droplets },
    steps: { color: '#10b981', gradientFrom: '#10b981', gradientTo: 'transparent', label: 'Steps', unit: '', icon: Footprints },
  };

  const cfg = chartConfigs[activeChart];

  const tooltipStyle = {
    backgroundColor: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  return (
    <PageTransition>
      <div className="p-6 flex flex-col">
        
        {/* Time Filter */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex gap-1 mb-4 p-1 glass rounded-2xl relative z-10"
        >
          {(['realtime', 'daily', 'weekly', 'monthly'] as const).map((f) => (
            <motion.button 
              key={f}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-2 text-[10px] font-semibold rounded-xl transition-all duration-300 relative ${filter === f ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setFilter(f)}
            >
              {filter === f && <motion.div layoutId="filterBg" className="absolute inset-0 bg-white/20 rounded-xl shadow-md" />}
              <span className="relative z-10 capitalize">{f === 'realtime' ? 'Live' : f}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Metric Selector */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-4"
        >
          {(['hr', 'spo2', 'steps'] as const).map((m) => {
            const c = chartConfigs[m];
            const Icon = c.icon;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveChart(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                  activeChart === m
                    ? 'border-white/20 bg-white/10 text-white'
                    : 'border-transparent bg-white/5 text-gray-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: activeChart === m ? c.color : undefined }} />
                {c.label.split(' ')[0]}
              </motion.button>
            );
          })}
        </motion.div>

        <div className="flex-1 space-y-4">
          {/* Chart */}
          <motion.div 
            key={activeChart}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-[32px] p-6 relative overflow-hidden"
          >
            <div className="absolute -inset-2 opacity-30 blur-xl pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${cfg.color}20, transparent)` }} />
            
            <h3 className="text-xs font-semibold text-gray-400 mb-6 tracking-widest uppercase relative z-10">
              {cfg.label} — {filter === 'realtime' ? 'Live Stream' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Avg`}
            </h3>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: cfg.color, borderTopColor: 'transparent' }} />
                </motion.div>
              </div>
            ) : (
              <div className="h-48 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  {filter === 'realtime' ? (
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={cfg.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide={true} />
                      <YAxis domain={activeChart === 'spo2' ? [90, 100] : ['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={tooltipStyle}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={activeChart} 
                        stroke={cfg.color}
                        strokeWidth={3}
                        fill={`url(#grad-${activeChart})`}
                        dot={false}
                        activeDot={{ r: 6, fill: cfg.color, stroke: '#000', strokeWidth: 2 }}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={tooltipStyle}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey={activeChart} name={cfg.label} fill={cfg.color} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>
          
          {/* Overview Stats */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-[32px] p-6"
          >
             <h3 className="text-xs font-semibold text-gray-400 mb-4 tracking-widest uppercase">Today's Overview</h3>
             <ul className="space-y-4">
               <li className="flex justify-between items-center py-2 border-b border-white/5">
                 <div className="flex items-center gap-2">
                   <Heart className="w-4 h-4 text-rose-400" />
                   <span className="text-sm text-gray-400 font-medium">Avg Heart Rate</span>
                 </div>
                 <span className="font-light text-xl text-white">{summary?.todayAvgHeartRate || '--'} <span className="text-sm text-gray-500">bpm</span></span>
               </li>
               <li className="flex justify-between items-center py-2 border-b border-white/5">
                 <div className="flex items-center gap-2">
                   <Droplets className="w-4 h-4 text-blue-400" />
                   <span className="text-sm text-gray-400 font-medium">Blood Oxygen</span>
                 </div>
                 <span className="font-light text-xl text-white">{currentSpo2 || '--'} <span className="text-sm text-gray-500">%</span></span>
               </li>
               <li className="flex justify-between items-center py-2 border-b border-white/5">
                 <div className="flex items-center gap-2">
                   <Footprints className="w-4 h-4 text-emerald-400" />
                   <span className="text-sm text-gray-400 font-medium">Total Steps</span>
                 </div>
                 <span className="font-light text-xl text-white">{summary?.todaySteps?.toLocaleString() || '--'}</span>
               </li>
               <li className="flex justify-between items-center py-2">
                 <span className="text-sm text-gray-400 font-medium">Data Points Synced</span>
                 <span className="font-light text-xl text-white">{summary?.totalReadings || dataQueue.length}</span>
               </li>
             </ul>
          </motion.div>
        </div>

      </div>
    </PageTransition>
  );
}
