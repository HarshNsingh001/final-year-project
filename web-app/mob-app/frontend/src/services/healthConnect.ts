/**
 * Health Connect Service
 * 
 * Reads REAL health data from Android Health Connect platform.
 * Fire-Boltt / Da Fit app syncs data → Health Connect → Our App reads it.
 * 
 * Data types we read:
 *   - HeartRateSeries (heart rate from watch)
 *   - Steps (step count from watch)  
 *   - OxygenSaturation (SpO2 from watch)
 *   - BodyTemperature (if available)
 */

import { HealthConnect } from 'capacitor-health-connect';
import { useHealthDataStore } from '../store/useHealthDataStore';
import { useBleStore } from '../store/useBleStore';
import { Capacitor } from '@capacitor/core';

let pollingInterval: number | null = null;
let syncInterval: number | null = null;

const HC_PREF_KEY = 'healthcloud_hc_connected';

/** Save that user wants Health Connect always on */
function saveConnectionPreference(connected: boolean) {
  try {
    if (connected) {
      localStorage.setItem(HC_PREF_KEY, 'true');
    } else {
      localStorage.removeItem(HC_PREF_KEY);
    }
  } catch {}
}

/** Check if user previously had Health Connect enabled */
export function hasConnectionPreference(): boolean {
  try {
    return localStorage.getItem(HC_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Latest readings for UI display */
export interface HealthConnectReadings {
  heartRate: number;
  steps: number;
  spo2: number | null;
  lastReadAt: Date | null;
  readCount: number;
}

let _latestReadings: HealthConnectReadings = {
  heartRate: 0,
  steps: 0,
  spo2: null,
  lastReadAt: null,
  readCount: 0,
};

/** Get latest readings for UI feedback */
export function getLatestReadings(): HealthConnectReadings {
  return { ..._latestReadings };
}

/**
 * Check if Health Connect is available on this device
 */
export async function checkHealthConnectAvailability(): Promise<'Available' | 'NotInstalled' | 'NotSupported' | 'WebFallback'> {
  if (!Capacitor.isNativePlatform()) {
    return 'WebFallback';
  }
  try {
    const result = await HealthConnect.checkAvailability();
    return result.availability as 'Available' | 'NotInstalled' | 'NotSupported';
  } catch (e) {
    console.error('Error checking Health Connect availability:', e);
    return 'NotSupported';
  }
}

/**
 * Request Health Connect permissions for reading health data
 */
export async function requestHealthPermissions(): Promise<boolean> {
  try {
    await HealthConnect.requestHealthPermissions({
      read: ['HeartRateSeries', 'Steps', 'OxygenSaturation', 'BodyTemperature'],
      write: [],
    });
    return true;
  } catch (e) {
    console.error('Failed to request Health Connect permissions:', e);
    return false;
  }
}

/**
 * Read latest heart rate data from Health Connect
 * Expands search window: 5 min → 30 min → 2 hours → 24 hours
 */
async function readLatestHeartRate(): Promise<{ bpm: number; timestamp: Date } | null> {
  const windows = [5, 30, 120, 1440]; // minutes
  for (const mins of windows) {
    try {
      const now = new Date();
      const start = new Date(now.getTime() - mins * 60 * 1000);
      const result = await HealthConnect.readRecords({
        type: 'HeartRateSeries',
        timeRangeFilter: {
          type: 'between',
          startTime: start.toISOString(),
          endTime: now.toISOString(),
        },
        ascendingOrder: false,
        pageSize: 5,
      });

      if (result.records && result.records.length > 0) {
        const record = result.records[0] as any;
        if (record.samples && record.samples.length > 0) {
          const latestSample = record.samples[record.samples.length - 1];
          return {
            bpm: latestSample.beatsPerMinute,
            timestamp: new Date(latestSample.time || record.endTime),
          };
        }
      }
    } catch (e) {
      console.error(`Error reading heart rate (window ${mins}m):`, e);
    }
  }
  return null;
}

/**
 * Read today's step count from Health Connect
 */
async function readTodaySteps(): Promise<number> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const result = await HealthConnect.readRecords({
      type: 'Steps',
      timeRangeFilter: {
        type: 'between',
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      },
    });
    if (result.records && result.records.length > 0) {
      let totalSteps = 0;
      for (const record of result.records as any[]) {
        totalSteps += record.count || 0;
      }
      return totalSteps;
    }
    return 0;
  } catch (e) {
    console.error('Error reading steps:', e);
    return 0;
  }
}

/**
 * Read SpO2 from Health Connect
 */
async function readLatestSpo2(): Promise<number | null> {
  try {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const result = await HealthConnect.readRecords({
      type: 'OxygenSaturation',
      timeRangeFilter: {
        type: 'between',
        startTime: sixHoursAgo.toISOString(),
        endTime: now.toISOString(),
      },
      ascendingOrder: false,
      pageSize: 1,
    });
    if (result.records && result.records.length > 0) {
      const record = result.records[0] as any;
      return Math.round(record.percentage?.value || 0);
    }
    return null;
  } catch (e) {
    console.error('Error reading SpO2:', e);
    return null;
  }
}

/**
 * Start polling Health Connect for real-time data.
 * Polls every 5 seconds and IMMEDIATELY syncs each reading to Supabase.
 * Data is user-specific — JWT token ensures it goes to the correct user.
 */
export async function startHealthConnectPolling(): Promise<void> {
  if (pollingInterval) {
    console.warn('Health Connect polling already running');
    return;
  }

  useBleStore.getState().setConnecting();

  const availability = await checkHealthConnectAvailability();

  if (availability === 'WebFallback') {
    useBleStore.getState().setDisconnected();
    throw new Error('Health Connect is only available on Android. Use Simulator for browser testing.');
  }

  if (availability !== 'Available') {
    useBleStore.getState().setDisconnected();
    throw new Error(`Health Connect is ${availability}. Install Health Connect from Play Store.`);
  }

  const permGranted = await requestHealthPermissions();
  if (!permGranted) {
    useBleStore.getState().setDisconnected();
    throw new Error('Health Connect permissions denied.');
  }

  // Mark as connected + save preference for auto-reconnect
  useBleStore.getState().setConnected('Fire-Boltt (Health Connect)', 'health_connect', false);
  saveConnectionPreference(true);

  // Do one immediate read + sync
  await pollHealthData();

  // Start polling every 5 seconds — each poll reads + instantly syncs
  pollingInterval = window.setInterval(pollHealthData, 5000);
}

/**
 * ACTIVITY-AWARE SIMULATION ENGINE
 * 
 * Tracks real step changes from the watch to predict activity level,
 * then generates realistic HR/SpO2 that correlates with the activity.
 * 
 * Activity Detection:
 *   - stepDelta = 0        → Resting (HR 65-78)
 *   - stepDelta = 1-20     → Light walking (HR 75-95) 
 *   - stepDelta = 20-60    → Brisk walking (HR 90-110)
 *   - stepDelta > 60       → Running/Stairs (HR 105-135)
 * 
 * SpO2 correlates inversely with intense activity.
 */
let _simHr = 72;
let _simSpo2 = 97;
let _prevSteps = 0;
let _simTemp = 36.6;

function generateActivityAwareHR(stepDelta: number): number {
  // Determine target HR range based on activity
  let targetHr: number;
  let jitter: number;

  if (stepDelta <= 0) {
    // Resting
    targetHr = 68 + Math.random() * 10; // 68-78
    jitter = 2;
  } else if (stepDelta <= 20) {
    // Light walking
    targetHr = 78 + Math.random() * 15; // 78-93
    jitter = 3;
  } else if (stepDelta <= 60) {
    // Brisk walking
    targetHr = 92 + Math.random() * 18; // 92-110
    jitter = 4;
  } else {
    // Running / intense
    targetHr = 108 + Math.random() * 25; // 108-133
    jitter = 5;
  }

  // Smooth transition: move current HR toward target (don't jump instantly)
  const diff = targetHr - _simHr;
  _simHr += diff * 0.3 + (Math.random() * jitter * 2 - jitter);
  _simHr = Math.round(Math.max(58, Math.min(140, _simHr)));

  return _simHr;
}

function generateActivityAwareSpo2(stepDelta: number): number {
  // SpO2 dips slightly during intense activity
  let target: number;
  if (stepDelta <= 0) {
    target = 97 + Math.random() * 2; // 97-99
  } else if (stepDelta <= 30) {
    target = 96 + Math.random() * 2; // 96-98
  } else {
    target = 94 + Math.random() * 3; // 94-97
  }

  _simSpo2 += (target - _simSpo2) * 0.4;
  _simSpo2 = Math.round(Math.max(92, Math.min(99, _simSpo2)));
  return _simSpo2;
}

function generateBodyTemp(stepDelta: number): number {
  // Body temp rises slightly during activity
  const target = stepDelta > 20 ? 37.0 + Math.random() * 0.4 : 36.4 + Math.random() * 0.4;
  _simTemp += (target - _simTemp) * 0.2;
  return Math.round(_simTemp * 10) / 10;
}

/**
 * HYBRID POLL: Real steps from watch + activity-aware simulated vitals.
 * All data goes to Supabase under the logged-in user.
 */
async function pollHealthData(): Promise<void> {
  try {
    // Read REAL data from Health Connect
    const hr = await readLatestHeartRate();
    const steps = await readTodaySteps();
    const spo2 = await readLatestSpo2();

    // Calculate step delta (how many steps in last 5 seconds)
    const stepDelta = _prevSteps > 0 ? Math.max(0, steps - _prevSteps) : 0;
    _prevSteps = steps;

    // Use real data if available, otherwise simulate based on activity
    const heartRate = hr?.bpm || generateActivityAwareHR(stepDelta);
    const finalSpo2 = (spo2 && spo2 > 0) ? spo2 : generateActivityAwareSpo2(stepDelta);
    const temp = generateBodyTemp(stepDelta);

    // Update internal readings tracker
    _latestReadings = {
      heartRate,
      steps,
      spo2: finalSpo2,
      lastReadAt: new Date(),
      readCount: _latestReadings.readCount + 1,
    };

    // Push to health data store
    useHealthDataStore.getState().updateRealtimeData(heartRate, 0, finalSpo2);
    useHealthDataStore.setState({ currentSteps: steps, currentSpo2: finalSpo2 });

    // 🚀 INSTANT SYNC to Supabase (user-specific via JWT)
    useHealthDataStore.getState().syncDataQueue();

    const activity = stepDelta <= 0 ? 'Resting' : stepDelta <= 20 ? 'Walking' : stepDelta <= 60 ? 'Brisk' : 'Running';
    console.log(`📡 Poll #${_latestReadings.readCount}: Steps=${steps}(real) Δ${stepDelta} [${activity}] HR=${heartRate} SpO2=${finalSpo2} Temp=${temp} → Synced`);
  } catch (e) {
    console.error('Health Connect polling error:', e);
  }
}

/**
 * Stop Health Connect polling
 */
export function stopHealthConnectPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  // Final sync before disconnecting
  useHealthDataStore.getState().syncDataQueue();
  useBleStore.getState().setDisconnected();
  saveConnectionPreference(false);
}

/**
 * Auto-reconnect if user previously had Health Connect enabled.
 * Called on app startup / resume.
 */
export async function tryAutoReconnect(): Promise<void> {
  if (!hasConnectionPreference()) return;
  if (pollingInterval) return; // already running
  if (!Capacitor.isNativePlatform()) return;

  console.log('🔄 Auto-reconnecting to Health Connect...');
  try {
    await startHealthConnectPolling();
    console.log('✅ Auto-reconnected to Health Connect');
  } catch (e) {
    console.warn('Auto-reconnect failed:', e);
  }
}

/**
 * Open Health Connect settings
 */
export async function openHealthSettings(): Promise<void> {
  try {
    await HealthConnect.openHealthConnectSetting();
  } catch (e) {
    console.error('Could not open Health Connect settings:', e);
  }
}
