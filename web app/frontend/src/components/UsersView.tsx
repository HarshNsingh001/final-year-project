import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, HeartPulse, Thermometer, MapPin, ActivityIcon, Plus, X } from 'lucide-react';
import PageHeader from './PageHeader';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newUser, setNewUser] = useState({
    name: '',
    branch: '',
    admissionNumber: '',
    emergencyContact: '',
    heartRate: 85,
    spo2: 98,
    temperature: 36.6,
  });

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userToAdd = {
        name: newUser.name,
        branch: newUser.branch,
        admissionNumber: newUser.admissionNumber,
        emergencyContact: newUser.emergencyContact,
        heartRate: newUser.heartRate,
        spo2: newUser.spo2,
        temperature: newUser.temperature,
        status: 'Normal',
        lat: 28.61000,
        lng: 77.21000,
      };
      
      const savedUser = await api.addUser(userToAdd);
      setUsers([savedUser, ...users]);
    } catch (err) {
      console.error("Failed to add user to database", err);
    }
    
    setIsAdding(false);
    setNewUser({
      name: '',
      branch: '',
      admissionNumber: '',
      emergencyContact: '',
      heartRate: 85,
      spo2: 98,
      temperature: 36.6,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative">
      <PageHeader 
        title="Registered User Monitoring" 
        action={
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Add User
          </motion.button>
        }
      />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AnimatePresence>
          {users.map(user => (
            <motion.div 
              key={user.id}
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -4, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col transition-colors z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 15 }}
                    className="w-10 h-10 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold uppercase shadow-inner"
                  >
                    {user.name?.slice(0,2)}
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{user.name}</h3>
                    <p className="text-[12px] font-medium text-slate-400">
                      {user.admissionNumber ? `${user.admissionNumber} • ` : ''}{user.branch}
                    </p>
                  </div>
                </div>
                <motion.span 
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md shadow-sm cursor-default",
                    user.status === 'Normal' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  )}
                >
                  {user.status || 'Normal'}
                </motion.span>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col p-4 border border-slate-100 rounded-xl bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                     <HeartPulse className="w-4 h-4 text-indigo-500" />
                     <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Heart Rate</p>
                  </div>
                  <p className="text-[20px] font-bold text-slate-800">{user.heartRate || '--'} <span className="text-[12px] text-slate-400 font-medium tracking-normal">bpm</span></p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col p-4 border border-slate-100 rounded-xl bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                     <Activity className="w-4 h-4 text-emerald-500" />
                     <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">SpO2</p>
                  </div>
                  <p className="text-[20px] font-bold text-slate-800">{user.spo2 || '--'} <span className="text-[12px] text-slate-400 font-medium tracking-normal">%</span></p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col p-4 border border-slate-100 rounded-xl bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                     <Thermometer className="w-4 h-4 text-amber-500" />
                     <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Temperature</p>
                  </div>
                  <p className="text-[20px] font-bold text-slate-800">{user.temperature || '--'} <span className="text-[12px] text-slate-400 font-medium tracking-normal">C</span></p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="flex flex-col p-4 border border-slate-100 rounded-xl bg-slate-50/50 min-w-0 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                     <MapPin className="w-4 h-4 text-sky-500" />
                     <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider truncate">Emergency Contact</p>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800 mt-1 truncate">{user.emergencyContact || '--'}</p>
                </motion.div>
              </div>

              {/* Action */}
              <motion.button 
                 whileHover={{ scale: 1.01, backgroundColor: "#f8fafc" }}
                 whileTap={{ scale: 0.99 }}
                 className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <ActivityIcon className="w-4 h-4 text-slate-400" />
                View Timeline
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
        {users.length === 0 && !loading && (
          <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No monitored students in the database yet.</p>
          </div>
        )}
      </motion.div>

      {/* Add User Modal */}
      {createPortal(
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-lg text-slate-800">Add New User</h3>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <form onSubmit={handleAddUser} className="p-6 space-y-5">
                <div className="space-y-4">
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
                      placeholder="E.g. Jane Doe"
                    />
                  </motion.div>
                  
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Admission Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.admissionNumber}
                      onChange={(e) => setNewUser({...newUser, admissionNumber: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
                      placeholder="E.g. REG-2023-001"
                    />
                  </motion.div>

                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Branch / Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.branch}
                      onChange={(e) => setNewUser({...newUser, branch: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
                      placeholder="E.g. CSE-401 - Computer Science"
                    />
                  </motion.div>

                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Emergency Contact <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newUser.emergencyContact}
                      onChange={(e) => setNewUser({...newUser, emergencyContact: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-800"
                      placeholder="+91 90000 00000"
                    />
                  </motion.div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-sm font-bold text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                  >
                    Add User
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
