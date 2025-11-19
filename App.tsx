
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import WorkOrderManager from './components/WorkOrderManager';
import AssetScanner from './components/AssetScanner';
import RoiCalculator from './components/RoiCalculator';
import Login from './components/Login';
import { AppTab, User, WorkOrder } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);

  // Centralized Data State
  const initialMockData: WorkOrder[] = [
    { 
      id: 'WO-204', assetId: 'AG-EXC-88', assetName: 'Titan Excavator X1', type: 'Ad-hoc', description: 'Hydraulic pressure loss in boom arm', priority: 'Critical', status: 'Pending', assignedTo: 'Unassigned', dueDate: '2023-11-25', location: 'Pit Zone A',
      checklist: [
        { id: 'c1', task: 'Inspect hydraulic lines for visible leaks', completed: false },
        { id: 'c2', task: 'Check reservoir fluid level', completed: false },
        { id: 'c3', task: 'Tighten loose fittings if found', completed: false }
      ]
    },
    { id: 'WO-205', assetId: 'AG-HT-12', assetName: 'Haul Truck H-500', type: 'Scheduled', description: 'Monthly Drivetrain Diagnostic', priority: 'Medium', status: 'In Progress', assignedTo: 'Rajesh K.', dueDate: '2023-11-26', location: 'Zone C' },
    { id: 'WO-206', assetId: 'AG-DR-04', assetName: 'Drill Rig D-20', type: 'Scheduled', description: 'Suspension Greasing', priority: 'Low', status: 'Completed', assignedTo: 'Amit S.', dueDate: '2023-11-20', location: 'Zone A' },
    { id: 'WO-207', assetId: 'EQ-CONV-01', assetName: 'Conveyor Belt System', type: 'Ad-hoc', description: 'Belt misalignment detected', priority: 'High', status: 'Flagged', assignedTo: 'Maintenance Team', dueDate: '2023-11-24', location: 'Processing Unit 2' },
  ];

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('alti_work_orders');
    return saved ? JSON.parse(saved) : initialMockData;
  });

  useEffect(() => {
    localStorage.setItem('alti_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  // Handle Login
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Redirect Technicians to Work Orders by default, Supervisors to Dashboard
    if (loggedInUser.role === 'TECHNICIAN') {
      setActiveTab(AppTab.WORK_ORDERS);
    } else {
      setActiveTab(AppTab.DASHBOARD);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setActiveTab(AppTab.DASHBOARD);
  };

  // Router/Switch for Tabs
  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        if (user?.role === 'TECHNICIAN') return <WorkOrderManager userRole={user.role} orders={workOrders} onUpdateOrders={setWorkOrders} />;
        return <Dashboard workOrders={workOrders} />;
      case AppTab.WORK_ORDERS:
        return <WorkOrderManager userRole={user ? user.role : 'TECHNICIAN'} orders={workOrders} onUpdateOrders={setWorkOrders} />;
      case AppTab.SCANNER:
        return <AssetScanner />;
      case AppTab.ASSISTANT:
        return <ChatAssistant />;
      default:
        return <Dashboard workOrders={workOrders} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
