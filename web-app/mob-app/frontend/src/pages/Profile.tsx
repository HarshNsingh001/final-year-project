import { useEffect, useState } from 'react';
import { PageTransition } from '../components/AppLayout';
import { useAuthStore } from '../store/useAuthStore';
import { getProfile, type ProfileData } from '../services/api';
import { User, Mail, ShieldCheck, ChevronRight, BookOpen, Phone } from 'lucide-react';
import { motion } from 'motion/react';

export function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    getProfile()
      .then(data => setProfile(data))
      .catch(err => console.error('Failed to load profile:', err));
  }, []);

  const displayName = profile?.name || user?.name || 'Student Name';
  const displayEmail = profile?.email || user?.email || 'student@university.edu';
  const displayBranch = profile?.branch || 'Not set';
  const displayAdmission = profile?.admissionNumber || 'Not set';
  const displayStatus = profile?.status || 'Normal';

  return (
    <PageTransition>
      <div className="p-6">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass rounded-[32px] p-8 flex flex-col items-center mt-6 relative overflow-hidden"
        >
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-cyan-500/20 to-transparent pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center text-white text-4xl font-light shadow-xl mb-4 border border-white/20 backdrop-blur-md relative z-10"
          >
            {displayName.charAt(0).toUpperCase()}
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-light text-white tracking-tight relative z-10"
          >
            {displayName}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm mb-8 flex items-center gap-1 relative z-10 font-medium"
          >
            <Mail className="w-3.5 h-3.5" /> {displayEmail}
          </motion.p>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full space-y-2 relative z-10"
          >
             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium text-white">Account Status</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold uppercase tracking-wider ${displayStatus === 'Normal' ? 'text-emerald-400' : 'text-orange-400'}`}>{displayStatus}</span>
                 <ChevronRight className="w-4 h-4 text-gray-600" />
               </div>
             </motion.div>
             
             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
                    <User className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium text-white">Admission No.</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-400 font-mono">{displayAdmission}</span>
                 <ChevronRight className="w-4 h-4 text-gray-600" />
               </div>
             </motion.div>

             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
                    <BookOpen className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium text-white">Branch</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-400">{displayBranch}</span>
                 <ChevronRight className="w-4 h-4 text-gray-600" />
               </div>
             </motion.div>

             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
                    <Phone className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium text-white">Emergency Contact</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-400">{profile?.emergencyContact || 'Not set'}</span>
                 <ChevronRight className="w-4 h-4 text-gray-600" />
               </div>
             </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
