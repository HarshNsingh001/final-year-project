import { Activity, Clock, Settings, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const navItems = [
    { name: 'Live', icon: Activity, path: '/' },
    { name: 'History', icon: Clock, path: '/history' },
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-6 left-6 right-6 z-50"
    >
      <div className="glass-strong h-16 rounded-[24px] flex justify-around items-center px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full p-2 relative outline-none -webkit-tap-highlight-transparent cursor-pointer"
              )
            }
          >
            {({ isActive }) => (
              <motion.div 
                whileTap={{ scale: 0.8 }}
                className={cn(
                  "flex flex-col items-center justify-center text-[10px] font-medium transition-all duration-300 w-full h-full",
                  isActive ? "text-teal-400" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300 relative flex items-center justify-center",
                  isActive ? "bg-teal-400/20 shadow-[0_0_15px_rgba(45,212,191,0.3)] text-teal-400" : "bg-transparent text-gray-500"
                )}>
                  <item.icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-teal-400/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}
