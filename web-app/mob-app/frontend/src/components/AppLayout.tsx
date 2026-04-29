import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

function getPathTitle(pathname: string) {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/history') return 'Analytics';
  if (pathname === '/profile') return 'Profile';
  if (pathname === '/settings') return 'Settings';
  return 'App';
}

export function AppContainer({ children }: { children: ReactNode }) {
  const location = useLocation();
  const title = getPathTitle(location.pathname);

  return (
    <div className="mobile-container w-full h-full flex flex-col relative overflow-hidden bg-black text-white">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-teal-600/30 blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[80vw] h-[80vw] rounded-full bg-emerald-600/20 blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <TopBar title={title} />
        {children}
        <BottomNav />
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main 
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 overflow-y-auto pb-32 no-scrollbar"
    >
      {children}
    </motion.main>
  );
}

