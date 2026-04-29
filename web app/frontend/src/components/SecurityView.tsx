import React from 'react';
import { ShieldCheck } from 'lucide-react';
import PageHeader from './PageHeader';
import { motion } from 'motion/react';

export default function SecurityView() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  const itemRightVariants = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="overflow-hidden">
      <PageHeader title="Security and Access Control" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Role Based Access */}
        <motion.div variants={itemLeftVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Role Based Access</h3>
            <motion.span 
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-600 rounded-md shadow-sm"
            >
              Enabled
            </motion.span>
          </div>

          <motion.div variants={containerVariants} className="space-y-3 relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100 z-0"></div>

            {[
              { role: 'Admin', desc: 'Can monitor all students, alerts, locations, and reports.' },
              { role: 'Student', desc: 'Can view personal health readings and alert history.' },
              { role: 'Emergency Contact', desc: 'Can receive critical health notifications in future scope.' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={rowVariants}
                whileHover={{ scale: 1.02, x: 5, backgroundColor: "#f8fafc" }}
                className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-start gap-4 relative z-10 cursor-default transition-colors"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-inner"
                >
                   <ShieldCheck className="w-4 h-4 text-indigo-500" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-[14px] text-slate-800 mb-0.5">{item.role}</h4>
                  <p className="text-[12px] text-slate-500 font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Data Protection */}
        <motion.div variants={itemRightVariants} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest">Data Protection</h3>
            <motion.span 
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-indigo-50 text-indigo-600 rounded-md shadow-sm"
            >
              Configured
            </motion.span>
          </div>

          <motion.div variants={containerVariants} className="space-y-3 relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100 z-0"></div>

            {[
              { role: 'HTTPS Ready', desc: 'Frontend and backend are structured for secure deployment.' },
              { role: 'JWT Future Scope', desc: 'Login endpoints can be added before production deployment.' },
              { role: 'Audit Trail', desc: 'Health readings and alerts are timestamped for traceability.' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={rowVariants}
                whileHover={{ scale: 1.02, x: 5, backgroundColor: "#f8fafc" }}
                className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-start gap-4 relative z-10 cursor-default transition-colors"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-inner"
                >
                   <ShieldCheck className="w-4 h-4 text-indigo-500" />
                </motion.div>
                <div>
                  <h4 className="font-bold text-[14px] text-slate-800 mb-0.5">{item.role}</h4>
                  <p className="text-[12px] text-slate-500 font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
