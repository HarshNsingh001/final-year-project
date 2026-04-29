import React, { useState, useEffect } from 'react';
import { MapPin, Search, User, ChevronRight } from 'lucide-react';
import PageHeader from './PageHeader';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Helper component to handle map panning
function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 17, {
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
}

export default function LocationView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const usersData = await api.getUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching location data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.branch && u.branch.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedUser = users.find(u => u.id === selectedUserId);
  const mapCenter = selectedUser && selectedUser.lat ? [selectedUser.lat, selectedUser.lng] : [28.6190, 77.2160];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="h-full flex flex-col">
      <PageHeader title="Live Location Tracking" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[500px]">
        {/* Sidebar - Student List */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex-shrink-0 space-y-3">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Students In Campus</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-medium">Syncing GPS data...</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                    selectedUserId === user.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                    selectedUserId === user.id ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <User className={`w-5 h-5 ${selectedUserId === user.id ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-[13px] truncate ${selectedUserId === user.id ? 'text-white' : 'text-slate-800'}`}>
                      {user.name}
                    </h4>
                    <p className={`text-[11px] truncate ${selectedUserId === user.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {user.branch || 'Student'}
                    </p>
                  </div>
                  {user.status === 'Needs Attention' && (
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  )}
                  {selectedUserId === user.id && <ChevronRight className="w-4 h-4 text-white/70" />}
                </button>
              ))
            )}
            
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-sm text-slate-400">No students found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Map Panel */}
        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col shadow-sm relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Campus Live Map</h3>
              {selectedUser && (
                <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-left-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                   <span className="text-[10px] font-bold uppercase tracking-tight">Tracking: {selectedUser.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-600 rounded-md flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Live
              </span>
            </div>
          </div>
          
          <div className="flex-1 relative bg-slate-50 border border-slate-100 rounded-xl overflow-hidden z-0">
            <MapContainer 
              center={mapCenter as [number, number]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapUpdater center={selectedUser && selectedUser.lat ? [selectedUser.lat, selectedUser.lng] : null} />
              
              {users.filter(u => u.lat && u.lng).map((u) => (
                <Circle
                  key={u.id}
                  center={[u.lat, u.lng]}
                  radius={selectedUserId === u.id ? 60 : 40}
                  eventHandlers={{
                    click: () => setSelectedUserId(u.id),
                  }}
                  pathOptions={{
                    color: u.status === 'Needs Attention' ? '#f43f5e' : (selectedUserId === u.id ? '#4f46e5' : '#10b981'),
                    fillColor: u.status === 'Needs Attention' ? '#f43f5e' : (selectedUserId === u.id ? '#4f46e5' : '#10b981'),
                    fillOpacity: selectedUserId === u.id ? 0.7 : 0.4,
                    weight: selectedUserId === u.id ? 4 : 2
                  }}
                >
                  <Popup>
                    <div className="min-w-[120px] p-1">
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{u.name}</h4>
                      <p className="text-[11px] text-slate-500 mb-2">{u.branch}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          u.status === 'Needs Attention' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {u.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{u.lat.toFixed(4)}, {u.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </MapContainer>

            <AnimatePresence>
              {selectedUser && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 min-w-[280px] z-[1000] flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 shadow-inner">
                    <User className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{selectedUser.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      {selectedUser.lat.toFixed(6)}, {selectedUser.lng.toFixed(6)}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedUserId(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-2 z-[1000] space-y-2">
               <div className="flex items-center gap-2 px-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Normal</span>
               </div>
               <div className="flex items-center gap-2 px-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Needs Attention</span>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
