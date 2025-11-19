import React, { useState } from 'react';
import { QrCode, MapPin, ShieldCheck, ShieldAlert, Wifi, ScanLine, Lock, History, ClipboardList, Check } from 'lucide-react';

// Simulation constants
const SITE_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Example coordinates
const GEOFENCE_RADIUS = 50; // meters

interface AssetHistoryItem {
  id: string;
  date: string;
  action: string;
  technician: string;
  status: 'Passed' | 'Fixed' | 'Pending';
}

const AssetScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [locationVerified, setLocationVerified] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simulation state to allow user to test "Off Site" logic
  const [simulatedDistance, setSimulatedDistance] = useState<number>(10); // meters

  // Mock History Data
  const assetHistory: AssetHistoryItem[] = [
    { id: 'H1', date: '2023-11-10', action: 'Brake Pad Replacement', technician: 'Amit S.', status: 'Fixed' },
    { id: 'H2', date: '2023-10-25', action: 'Hydraulic Pressure Check', technician: 'Rajesh K.', status: 'Passed' },
    { id: 'H3', date: '2023-10-15', action: 'Firmware Update v4.0', technician: 'System', status: 'Passed' },
  ];

  const startScan = () => {
    setScanning(true);
    setScanResult(null);
    setError(null);
    setLocationVerified(null);

    // Simulate scanning delay
    setTimeout(() => {
      // 1. Verify Geofence first (Requirement 4.3)
      if (simulatedDistance > GEOFENCE_RADIUS) {
        setScanning(false);
        setError("GEOFENCE VIOLATION: You are outside the authorized maintenance zone.");
        setLocationVerified(false);
        // Log anomaly logic would go here
        return;
      }

      // 2. Success path
      setLocationVerified(true);
      setScanResult("AG-MINING-X1-092");
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-slate-800">Asset Identification</h2>
        <p className="text-slate-500 text-sm mt-1">Scan QR code to log maintenance or view history.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative">
        
        {/* Scanner Viewport */}
        <div className="bg-slate-900 h-80 relative flex flex-col items-center justify-center overflow-hidden group transition-all duration-500">
          
          {scanning ? (
            <>
               {/* Animated Scan Line */}
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
               <div className="absolute w-full h-1 bg-alti-green/80 shadow-[0_0_15px_rgba(0,166,81,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
               <div className="z-10 text-white flex flex-col items-center gap-2">
                 <ScanLine className="w-12 h-12 text-alti-green animate-pulse" />
                 <span className="text-xs font-mono tracking-widest animate-pulse">ACQUIRING TARGET...</span>
               </div>
            </>
          ) : scanResult ? (
            <div className="bg-emerald-900/90 absolute inset-0 flex flex-col items-center justify-center text-white p-6">
               <ShieldCheck className="w-16 h-16 text-emerald-400 mb-4" />
               <h3 className="text-xl font-bold mb-1">Access Granted</h3>
               <p className="text-emerald-200 text-sm mb-4">Geofence Verified</p>
               <div className="bg-black/40 px-4 py-2 rounded-lg font-mono text-lg border border-emerald-500/30">
                 {scanResult}
               </div>
               <button 
                 onClick={() => setScanResult(null)}
                 className="mt-6 text-xs text-emerald-300 hover:text-white underline"
               >
                 Scan Next Asset
               </button>
            </div>
          ) : error ? (
             <div className="bg-red-900/90 absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
               <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
               <h3 className="text-xl font-bold mb-1">Access Denied</h3>
               <p className="text-red-200 text-sm mb-6">{error}</p>
               <div className="text-xs font-mono text-red-300 bg-red-950 p-2 rounded border border-red-800">
                 Anomaly Logged: ID-TECH-001<br/>
                 GPS: {SITE_LOCATION.lat}, {SITE_LOCATION.lng}
               </div>
               <button 
                 onClick={() => setError(null)}
                 className="mt-6 px-4 py-2 bg-white text-red-900 rounded-lg text-sm font-bold"
               >
                 Retry Validation
               </button>
            </div>
          ) : (
            <div className="text-slate-500 flex flex-col items-center">
              <QrCode size={64} className="opacity-20 mb-4" />
              <p className="text-xs uppercase tracking-widest opacity-50">Camera Standby</p>
            </div>
          )}

          {/* Corner Markers */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-white/20 rounded-tl-xl"></div>
          <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-white/20 rounded-tr-xl"></div>
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-white/20 rounded-bl-xl"></div>
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-white/20 rounded-br-xl"></div>
        </div>

        {/* Asset History Log - Only shown on success */}
        {scanResult && (
          <div className="bg-slate-50 p-6 border-t border-slate-200 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase tracking-wide">
              <History size={16} className="text-slate-400" /> Maintenance History
            </h3>
            <div className="space-y-3">
              {assetHistory.map((item, idx) => (
                <div key={item.id} className="flex items-start gap-3 relative">
                  {idx !== assetHistory.length - 1 && (
                    <div className="absolute left-[11px] top-6 w-0.5 h-full bg-slate-200"></div>
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${item.status === 'Fixed' || item.status === 'Passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <span className="font-bold text-sm text-slate-700">{item.action}</span>
                       <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">{item.date}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                       <span className="font-medium">{item.technician}</span>
                       <span>•</span>
                       <span className={item.status === 'Passed' ? 'text-emerald-600' : 'text-slate-500'}>{item.status}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
              <ClipboardList size={16} /> View Full Log
            </button>
          </div>
        )}

        {/* Controls - Hide when successfully scanned to focus on data, or allow reset */}
        {!scanResult && (
          <div className="p-6">
            {/* Simulation Controls (For Demo Only) */}
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                  <MapPin size={14} /> Geofence Simulation
                </div>
                <span className={`text-xs font-bold ${simulatedDistance <= GEOFENCE_RADIUS ? 'text-emerald-600' : 'text-red-600'}`}>
                  {simulatedDistance <= GEOFENCE_RADIUS ? 'INSIDE ZONE' : 'OUTSIDE ZONE'}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={simulatedDistance} 
                onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0m (Center)</span>
                <span>{simulatedDistance}m</span>
                <span>100m</span>
              </div>
            </div>

            <button
              onClick={startScan}
              disabled={scanning}
              className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-alti-green hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode className="w-5 h-5" />
              {scanning ? 'Verifying Location...' : 'Scan Equipment QR'}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
               <Lock size={12} />
               <span>Geo-tagging enabled for security compliance</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetScanner;