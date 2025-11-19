import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Leaf, ArrowRight, Lock, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('TECHNICIAN');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockUser: User = {
        id: `USR-${Math.floor(Math.random() * 1000)}`,
        name: username || (role === 'SUPERVISOR' ? 'Supervisor A' : 'Tech John'),
        role: role,
        siteId: 'SITE-01'
      };
      onLogin(mockUser);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-alti-green/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in">
        
        {/* Left Panel: Brand */}
        <div className="md:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
           
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-12 h-12 bg-alti-green rounded-tl-2xl rounded-br-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,166,81,0.6)]">
                 <Leaf className="text-white w-7 h-7" />
               </div>
               <div>
                 <h1 className="font-display font-bold text-2xl tracking-wide">Altek Green</h1>
                 <p className="text-xs text-slate-400 tracking-[0.2em] uppercase">Mining Systems</p>
               </div>
             </div>
             
             <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
               Digital Maintenance System
             </h2>
             <p className="text-slate-400 text-sm leading-relaxed">
               Altek Green is a pioneering company at the forefront of technological innovation, specializing in advanced systems for mining equipment.
             </p>
           </div>

           <div className="relative z-10 mt-12 space-y-4">
             <div className="flex items-center gap-3 text-sm text-slate-300">
               <ShieldCheck className="text-alti-green" size={18} />
               <span>Altek Green Security Protocol</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-slate-300">
               <Lock className="text-alti-green" size={18} />
               <span>Role-Based Access Control</span>
             </div>
           </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="md:w-1/2 p-10 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-800">Welcome Back</h3>
            <p className="text-slate-500 text-sm mt-1">Please sign in to your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your ID"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-alti-green transition-all"
              />
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Select Role</label>
               <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setRole('TECHNICIAN')}
                   className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === 'TECHNICIAN' ? 'border-alti-green bg-green-50 text-alti-green' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                 >
                   Technician
                 </button>
                 <button
                   type="button"
                   onClick={() => setRole('SUPERVISOR')}
                   className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === 'SUPERVISOR' ? 'border-alti-green bg-green-50 text-alti-green' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                 >
                   Supervisor
                 </button>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
            >
              {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Demo Credentials: No password required.<br/>Select a role to simulate access levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;