import React from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle = 'Institution Admin Panel', onRefresh, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      >
        <h2 className="text-[12px] font-bold tracking-[0.05em] uppercase text-slate-400 mb-1">{subtitle}</h2>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        className="flex items-center gap-3"
      >
        {action}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm group"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </motion.div>
          Refresh
        </motion.button>
      </motion.div>
    </div>
  );
}
