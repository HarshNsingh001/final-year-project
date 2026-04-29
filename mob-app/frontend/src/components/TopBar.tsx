import { Bluetooth, BluetoothConnected, BluetoothOff } from 'lucide-react';
import { useBleStore } from '../store/useBleStore';

export function TopBar({ title }: { title: string }) {
  const { connectionState } = useBleStore();

  return (
    <header className="glass-strong h-16 flex items-center justify-between px-6 shrink-0 z-50 border-b-0 rounded-b-3xl">
      <h1 className="font-semibold text-xl tracking-tight text-white">{title}</h1>
      <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
        {connectionState === 'connected' && <BluetoothConnected className="w-4 h-4 text-cyan-400" />}
        {connectionState === 'connecting' && <Bluetooth className="w-4 h-4 animate-pulse text-purple-400" />}
        {connectionState === 'disconnected' && <BluetoothOff className="w-4 h-4 text-gray-500" />}
        <span className="hidden sm:inline text-xs font-medium text-gray-300 tracking-wide uppercase">
          {connectionState === 'connected' ? 'Connected' : connectionState === 'connecting' ? 'Connecting' : 'Disconnected'}
        </span>
      </div>
    </header>
  );
}
