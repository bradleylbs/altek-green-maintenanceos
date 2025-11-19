
import React from 'react';
import { AppTab, User } from '../types';
import { LayoutDashboard, ClipboardList, QrCode, Bot, Leaf, Wifi, WifiOff, LogOut, Calculator } from 'lucide-react';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, user, onLogout }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // RBAC Logic for Navigation
  const getNavItems = () => {
    const items = [
      { id: AppTab.WORK_ORDERS, label: 'Work Orders', icon: ClipboardList },
      { id: AppTab.SCANNER, label: 'Scan Asset', icon: QrCode },
      { id: AppTab.ASSISTANT, label: 'Support', icon: Bot },
    ];

    if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
      items.unshift({ id: AppTab.DASHBOARD, label: 'Fleet Hub', icon: LayoutDashboard });
      // Removed ROI Calculator from navigation
    }
    
    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-400 rounded-tl-xl rounded-br-xl flex items-center justify-center shadow-lg border border-white/20">
              <Leaf className="text-alti-green w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-wide leading-none">
                Altek Green
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[0.6rem] text-slate-400 uppercase tracking-wider leading-none">
                  Maintenance OS
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[0.55rem] font-mono text-alti-green border border-slate-700">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm
                    ${isActive 
                      ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(0,166,81,0.2)] border border-white/5' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-alti-green' : ''} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side: Connectivity & Logout */}
          <div className="flex items-center gap-4">
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-slate-800 border-slate-700' : 'bg-red-900/30 border-red-800'}`}>
              {isOnline ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-red-400" />}
              <span className={`text-xs font-mono ${isOnline ? 'text-slate-300' : 'text-red-200'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-800 bg-slate-900 flex justify-around p-2 overflow-x-auto">
          {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${isActive ? 'text-white bg-white/5' : 'text-slate-500'}`}
                >
                  <Icon size={20} className={isActive ? 'text-alti-green' : ''} />
                  <span className="text-[10px] mt-1 font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
          })}
      </div>
    </nav>
  );
};

export default Navbar;
