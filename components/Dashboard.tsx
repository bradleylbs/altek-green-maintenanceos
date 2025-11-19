
import React, { useEffect, useState } from 'react';
import { WorkOrder, MaintenanceReport } from '../types';
import { generateMaintenanceInsights } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, MapPin, Sparkles, ShieldAlert, Clock, Siren, CloudRain, Wind, Thermometer } from 'lucide-react';

interface DashboardProps {
  workOrders: WorkOrder[];
}

const Dashboard: React.FC<DashboardProps> = ({ workOrders }) => {
  const [report, setReport] = useState<MaintenanceReport | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Geofence Alerts State (Simulated)
  const [securityAlerts, setSecurityAlerts] = useState([
    { id: 1, type: 'Geofence Breach', asset: 'AG-EXC-99', location: 'Restricted Zone D', time: '10:42 AM', severity: 'Critical' },
    { id: 2, type: 'Movement Anomaly', asset: 'AG-HT-04', location: 'Blasting Zone A', time: '09:15 AM', severity: 'High' },
    { id: 3, type: 'Geofence Breach', asset: 'AG-DR-12', location: 'Main Gate', time: 'Yesterday', severity: 'Medium' },
  ]);

  // Simulated Weather Data (In real app, fetch from API)
  const weatherStatus = {
    temp: 28,
    condition: 'Clear',
    windSpeed: 12, // km/h
    safetyLevel: 'Optimal',
    alert: null
  };

  useEffect(() => {
    const fetchAIInsights = async () => {
      setLoadingAI(true);
      const result = await generateMaintenanceInsights(workOrders);
      setReport(result);
      setLoadingAI(false);
    };
    if (workOrders.length > 0) {
      fetchAIInsights();
    }
  }, [workOrders]);

  const addSimulatedAlert = () => {
    const newAlert = {
      id: Date.now(),
      type: 'Geofence Breach',
      asset: `AG-SIM-${Math.floor(Math.random() * 100)}`,
      location: 'Restricted Zone B',
      time: 'Just Now',
      severity: 'Critical'
    };
    setSecurityAlerts([newAlert, ...securityAlerts]);
  };

  // Derived Statistics
  const totalOrders = workOrders.length;
  const criticalCount = workOrders.filter(o => o.priority === 'Critical').length;
  const completedCount = workOrders.filter(o => o.status === 'Completed').length;
  const pendingCount = workOrders.filter(o => o.status === 'Pending').length;
  const overdueCount = workOrders.filter(o => o.status === 'Flagged' || o.priority === 'Critical').length; // Simplified logic for demo

  const completionData = [
    { name: 'Mon', completed: 4, flagged: 1 },
    { name: 'Tue', completed: 6, flagged: 0 },
    { name: 'Wed', completed: 3, flagged: 1 },
    { name: 'Thu', completed: 8, flagged: 0 },
    { name: 'Fri', completed: completedCount, flagged: overdueCount }, // Dynamically map current state to "Friday"
  ];

  const statusData = [
    { name: 'Completed', value: Math.max(1, Math.round((completedCount / totalOrders) * 100)) },
    { name: 'Pending', value: Math.max(1, Math.round((pendingCount / totalOrders) * 100)) },
    { name: 'Overdue', value: Math.max(1, Math.round((overdueCount / totalOrders) * 100)) },
  ];

  const COLORS = ['#00A651', '#94A3B8', '#EF4444'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Banner with Weather Widget */}
      <div className="bg-chrome-gradient p-6 rounded-2xl shadow-lg border border-white relative overflow-hidden flex flex-col md:flex-row justify-between items-end">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-bl-full transform translate-x-8 -translate-y-8"></div>
        
        <div className="relative z-10 mb-4 md:mb-0">
          <h1 className="text-3xl font-display font-bold text-slate-800 mb-1">Mining Control Hub</h1>
          <p className="text-slate-600 font-light">Real-time asset health and compliance monitoring.</p>
        </div>

        {/* Weather / Safety Widget */}
        <div className="relative z-10 bg-white/30 backdrop-blur-md border border-white/50 p-3 rounded-xl flex items-center gap-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Thermometer size={20} className="text-slate-700" />
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">{weatherStatus.temp}°C</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Ambient Temp</div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-400/30"></div>
          <div className="flex items-center gap-2">
            <Wind size={20} className="text-slate-700" />
            <div>
              <div className="text-lg font-bold text-slate-800 leading-none">{weatherStatus.windSpeed} <span className="text-xs">km/h</span></div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Wind Speed</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-400/30"></div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="text-xs font-bold text-emerald-700 uppercase border border-emerald-200 bg-emerald-50 px-2 py-1 rounded">
              Ops Normal
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Work Orders" 
          value={`${totalOrders} Active`} 
          icon={<Activity className="text-blue-500" />} 
          trend={`${criticalCount} Critical`}
        />
        <StatCard 
          title="Geo-Compliance" 
          value="98.5%" 
          icon={<MapPin className="text-alti-green" />} 
          trend="Site Validation Active"
        />
        <StatCard 
          title="Overdue Jobs" 
          value={overdueCount.toString()} 
          icon={<AlertTriangle className="text-red-500" />} 
          trend="Requires Supervisor"
          alert={overdueCount > 0}
        />
        <StatCard 
          title="Avg Resolution" 
          value="4.2 Hrs" 
          icon={<CheckCircle className="text-slate-500" />} 
          trend="-15% vs last week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column: AI & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Insights Section */}
          {report && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl leaf-shape-inv relative overflow-hidden shadow-xl">
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Sparkles className="text-yellow-400 animate-pulse" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2 text-chrome">AI Maintenance Analysis</h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">{report.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Critical Risks</h4>
                      <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                        {report.criticalIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recommendation</h4>
                      <p className="text-xs text-emerald-300">{report.recommendations}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Background */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-alti-green/10 rounded-full blur-3xl"></div>
            </div>
          )}

          {/* Charts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Task Completion</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="completed" name="Completed" fill="#00A651" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="flagged" name="Flagged/Issues" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Side Column: Status & Alerts */}
        <div className="space-y-6">
          
          {/* Geofence Alerts */}
          <div className="bg-white rounded-2xl shadow-md border border-red-100 overflow-hidden">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-600"/> Security Alerts
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={addSimulatedAlert}
                  className="text-[10px] font-bold bg-white border border-red-200 text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1"
                  title="Simulate a new breach event"
                >
                  <Siren size={10} /> Test Alert
                </button>
                <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-1 rounded-full flex items-center">LIVE</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {securityAlerts.map(alert => (
                <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors animate-fade-in">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-xs font-bold text-slate-800">{alert.type}</span>
                     <span className={`text-[10px] font-bold px-1.5 rounded ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>{alert.severity}</span>
                  </div>
                  <div className="text-sm text-slate-600 mb-1">{alert.asset}</div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {alert.location}</span>
                    <span className="flex items-center gap-1"><Clock size={10}/> {alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-50 text-center">
              <button className="text-xs font-bold text-slate-500 hover:text-slate-800">View All Logs</button>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Job Status</h3>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-2xl font-bold text-slate-800">{Math.round((completedCount / totalOrders) * 100)}%</span>
                  <p className="text-[10px] text-slate-400 uppercase">Efficiency</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
               {statusData.map((item, idx) => (
                 <div key={idx} className="flex justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                     <span className="text-slate-600">{item.name}</span>
                   </div>
                   <span className="font-bold text-slate-800">{item.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend: string; alert?: boolean }> = ({ title, value, icon, trend, alert }) => (
  <div className={`bg-white p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${alert ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}`}>
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</span>
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1 font-display">{value}</div>
    <div className={`text-xs font-medium ${alert ? 'text-red-600' : 'text-alti-green'}`}>{trend}</div>
  </div>
);

export default Dashboard;
