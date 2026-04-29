import { create } from 'zustand';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

interface BleState {
  connectionState: ConnectionState;
  deviceName: string | null;
  deviceId: string | null;
  isSimulated: boolean;
  
  setConnecting: () => void;
  setConnected: (name: string, id: string, simulated?: boolean) => void;
  setDisconnected: () => void;
}

export const useBleStore = create<BleState>((set) => ({
  connectionState: 'disconnected',
  deviceName: null,
  deviceId: null,
  isSimulated: false,
  
  setConnecting: () => set({ connectionState: 'connecting' }),
  setConnected: (name, id, simulated = false) => set({ 
    connectionState: 'connected', 
    deviceName: name, 
    deviceId: id,
    isSimulated: simulated
  }),
  setDisconnected: () => set({ 
    connectionState: 'disconnected', 
    deviceName: null, 
    deviceId: null,
    isSimulated: false
  }),
}));
