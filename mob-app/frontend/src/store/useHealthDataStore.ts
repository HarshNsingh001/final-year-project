import { create } from 'zustand';
import { batchUploadHealthData, getHealthHistory, getHealthSummary, getLatestVitals, type HealthDataItem } from '../services/api';

export interface HealthMetric {
  id: string;
  timestamp: number;
  heartRate: number;
  steps: number;
  spo2: number;
  synced: boolean;
}

interface HealthDataState {
  currentHeartRate: number;
  currentSteps: number;
  currentSpo2: number;
  dataQueue: HealthMetric[];
  lastSyncTimestamp: number | null;
  isSyncing: boolean;
  
  /** Called by BLE service when new data arrives from smartwatch */
  updateRealtimeData: (heartRate: number, stepsDelta: number, spo2?: number) => void;
  
  /** Fetch the latest vitals from the backend to initialize the dashboard */
  fetchLatestVitals: () => Promise<void>;
  
  /** Batch sync unsynced data to backend API */
  syncDataQueue: () => Promise<void>;
  
  /** Fetch history from backend (replaces mock data) */
  fetchHistory: (period?: 'daily' | 'weekly' | 'monthly') => Promise<Array<{
    date?: string;
    label: string;
    avgHeartRate: number;
    totalSteps: number;
  }>>;
  
  /** Fetch dashboard summary from backend */
  fetchSummary: () => Promise<{
    todayAvgHeartRate: number;
    todaySteps: number;
    totalReadings: number;
    lastSyncTime: string | null;
  }>;
}

export const useHealthDataStore = create<HealthDataState>((set, get) => ({
  currentHeartRate: 0,
  currentSteps: 0,
  currentSpo2: 0,
  dataQueue: [],
  lastSyncTimestamp: null,
  isSyncing: false,
  
  updateRealtimeData: (heartRate, stepsDelta, spo2 = 0) => {
    set((state) => {
      const newSteps = state.currentSteps + stepsDelta;
      const newMetric: HealthMetric = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        heartRate,
        steps: newSteps,
        spo2: spo2 || state.currentSpo2,
        synced: false
      };
      
      return {
        currentHeartRate: heartRate,
        currentSteps: newSteps,
        currentSpo2: spo2 || state.currentSpo2,
        dataQueue: [...state.dataQueue, newMetric]
      };
    });
  },
  
  fetchLatestVitals: async () => {
    try {
      const latest = await getLatestVitals();
      if (latest) {
        set((state) => ({
          // Update values if they are currently 0 (meaning we just loaded the app and have no active simulator data)
          currentHeartRate: state.currentHeartRate === 0 ? latest.heartRate : state.currentHeartRate,
          currentSteps: state.currentSteps === 0 ? latest.steps : state.currentSteps,
          lastSyncTimestamp: latest.lastUpdated ? new Date(latest.lastUpdated).getTime() : state.lastSyncTimestamp,
        }));
      }
    } catch (e) {
      console.error("Failed to fetch latest vitals:", e);
    }
  },
  
  syncDataQueue: async () => {
    const { dataQueue, isSyncing } = get();
    
    // Prevent concurrent syncs
    if (isSyncing) return;
    
    const unsynced = dataQueue.filter(d => !d.synced);
    if (unsynced.length === 0) return;
    
    set({ isSyncing: true });
    
    try {
      // Convert to API format — include all health metrics
      const items: HealthDataItem[] = unsynced.map(d => ({
        heartRate: d.heartRate,
        steps: d.steps,
        spo2: d.spo2 || undefined,
        timestamp: d.timestamp,
      }));
      
      // Send batch to backend
      const result = await batchUploadHealthData(items);
      
      console.log(`✅ Synced ${result.saved} readings, ${result.alertsGenerated} alerts generated`);
      
      // Mark synced items and clean up old synced data (keep last 50)
      set((state) => {
        const syncedIds = new Set(unsynced.map(d => d.id));
        const updatedQueue = state.dataQueue.map(d => 
          syncedIds.has(d.id) ? { ...d, synced: true } : d
        );
        
        // Keep only last 50 items + all unsynced to prevent memory growth
        const unsyncedItems = updatedQueue.filter(d => !d.synced);
        const syncedItems = updatedQueue.filter(d => d.synced).slice(-50);
        
        return {
          dataQueue: [...syncedItems, ...unsyncedItems],
          lastSyncTimestamp: Date.now(),
          isSyncing: false,
        };
      });
    } catch (e) {
      console.error("❌ Sync failed, will retry next cycle:", e);
      set({ isSyncing: false });
      // Data stays in queue for next sync attempt (retry logic)
    }
  },
  
  fetchHistory: async (period = 'daily') => {
    try {
      return await getHealthHistory(period);
    } catch (e) {
      console.error("Failed to fetch history:", e);
      return [];
    }
  },

  fetchSummary: async () => {
    try {
      return await getHealthSummary();
    } catch (e) {
      console.error("Failed to fetch summary:", e);
      return { todayAvgHeartRate: 0, todaySteps: 0, totalReadings: 0, lastSyncTime: null };
    }
  },
}));
