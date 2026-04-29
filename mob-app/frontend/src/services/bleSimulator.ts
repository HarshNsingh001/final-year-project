import { useBleStore } from '../store/useBleStore';
import { useHealthDataStore } from '../store/useHealthDataStore';

let simulatorInterval: number | null = null;
let baseHeartRate = 75;

export const startSimulator = () => {
  if (simulatorInterval) return;
  
  useBleStore.getState().setConnecting();
  
  setTimeout(() => {
    useBleStore.getState().setConnected('Simulated Watch', 'sim_device_1', true);
    
    simulatorInterval = window.setInterval(() => {
      // Fluctuate heart rate slightly
      baseHeartRate = Math.max(60, Math.min(180, baseHeartRate + (Math.random() * 6 - 3)));
      const stepsDelta = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
      
      useHealthDataStore.getState().updateRealtimeData(Math.round(baseHeartRate), stepsDelta);
    }, 2000); // 2 second interval
  }, 1500);
};

export const stopSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
  useBleStore.getState().setDisconnected();
};

// Also set up a background sync interval
setInterval(() => {
  const isConnected = useBleStore.getState().connectionState === 'connected';
  if (isConnected) {
    useHealthDataStore.getState().syncDataQueue();
  }
}, 10000); // Sync every 10 seconds empty or not
