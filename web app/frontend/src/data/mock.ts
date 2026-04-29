export const mockUsers = [
  { 
    id: 1, 
    name: 'Aman Sharma', 
    branch: 'CSE-101 - Computer Science', 
    status: 'Normal', 
    heartRate: 100, 
    spo2: 93, 
    temperature: 37.0, 
    emergencyContact: '+91 90000 11111', 
    lat: 28.61810, 
    lng: 77.21420 
  },
  { 
    id: 2, 
    name: 'Priya Verma', 
    branch: 'CSE-102 - Computer Science', 
    status: 'Normal', 
    heartRate: 73, 
    spo2: 95, 
    temperature: 36.6, 
    emergencyContact: '+91 90000 22222', 
    lat: 28.62159, 
    lng: 77.21897 
  },
  { 
    id: 3, 
    name: 'Rahul Singh', 
    branch: 'ECE-201 - Electronics', 
    status: 'Needs Attention', 
    heartRate: 132, 
    spo2: 88, 
    temperature: 38.4, 
    emergencyContact: '+91 90000 33333', 
    lat: 28.61810, 
    lng: 77.21420 
  },
  { 
    id: 4, 
    name: 'Neha Gupta', 
    branch: 'ME-301 - Mechanical', 
    status: 'Normal', 
    heartRate: 80, 
    spo2: 95, 
    temperature: 36.9, 
    emergencyContact: '+91 90000 44444', 
    lat: 28.62045, 
    lng: 77.21854 
  },
];

export const mockAlerts = [
  { id: 1, type: 'TEMPERATURE', user: 'Rahul Singh', time: '4/24/2026, 5:53:06 PM', severity: 'MEDIUM', message: 'Abnormal body temperature detected: 38.4 C' },
  { id: 2, type: 'SPO2', user: 'Rahul Singh', time: '4/24/2026, 5:53:06 PM', severity: 'CRITICAL', message: 'Oxygen saturation dropped below safe limit: 88%' },
  { id: 3, type: 'HEART_RATE', user: 'Rahul Singh', time: '4/24/2026, 5:53:06 PM', severity: 'HIGH', message: 'Heart rate crossed safe limit: 132 bpm' },
];

export const mockChartData = [
  { time: '05:48 PM', heartRate: 85, spo2: 97, temperature: 36.5 },
  { time: '05:49 PM', heartRate: 88, spo2: 96, temperature: 36.6 },
  { time: '05:50 PM', heartRate: 95, spo2: 95, temperature: 36.8 },
  { time: '05:51 PM', heartRate: 91, spo2: 96, temperature: 37.0 },
  { time: '05:52 PM', heartRate: 89, spo2: 95, temperature: 37.5 },
  { time: '05:53 PM', heartRate: 132, spo2: 88, temperature: 38.4 },
];

export const latestCoordinateUpdates = [
  { id: 1, name: 'Rahul Singh', lat: 28.61810, lng: 77.21420, time: '5:53:06 PM' },
  { id: 2, name: 'Neha Gupta', lat: 28.62159, lng: 77.21897, time: '5:53:06 PM' },
  { id: 3, name: 'Neha Gupta', lat: 28.62045, lng: 77.21854, time: '5:53:06 PM' },
];
