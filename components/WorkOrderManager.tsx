
import React, { useState, useEffect, useRef } from 'react';
import { WorkOrder, Priority, Status, UserRole, WorkType, ChecklistItem } from '../types';
import { generateMaintenanceChecklist, enhanceWorkOrderDescription, analyzeAssetImage } from '../services/geminiService';
import { Filter, Plus, AlertCircle, Clock, CheckCircle2, MapPin, Calendar, X, Save, Wifi, WifiOff, Cloud, CloudOff, RefreshCw, ChevronDown, Check, Sparkles, Trash2, ChevronUp, ListChecks, Wand2, Camera, Image as ImageIcon, Mic, MicOff } from 'lucide-react';

interface WorkOrderManagerProps {
  userRole: UserRole;
  orders: WorkOrder[];
  onUpdateOrders: (orders: WorkOrder[]) => void;
}

const WorkOrderManager: React.FC<WorkOrderManagerProps> = ({ userRole, orders, onUpdateOrders }) => {
  // Connectivity & Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [showSyncToast, setShowSyncToast] = useState(false);

  const [filter, setFilter] = useState<'All' | Status>('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [enhancingDescription, setEnhancingDescription] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newOrderForm, setNewOrderForm] = useState({
    assetId: '',
    assetName: '',
    description: '',
    type: 'Ad-hoc' as WorkType,
    priority: 'Medium' as Priority,
    assignedTo: '',
    location: '',
    dueDate: new Date().toISOString().split('T')[0],
    checklist: [] as ChecklistItem[]
  });

  const canCreate = userRole === 'ADMIN' || userRole === 'SUPERVISOR';

  // --- Offline & Sync Logic ---

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncStatus === 'pending') {
        performSync();
      }
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus]);

  const performSync = () => {
    setSyncStatus('syncing');
    // Simulate network request
    setTimeout(() => {
      setSyncStatus('synced');
      triggerSyncToast();
    }, 2000);
  };

  const triggerSyncToast = () => {
    setShowSyncToast(true);
    setTimeout(() => setShowSyncToast(false), 3000);
  };

  const updateOrderStatus = (id: string, newStatus: Status) => {
    const updatedOrders = orders.map(o => 
      o.id === id ? { ...o, status: newStatus } : o
    );
    onUpdateOrders(updatedOrders);
    syncChanges();
  };

  const toggleChecklistItem = (orderId: string, itemId: string) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId && o.checklist) {
        const updatedChecklist = o.checklist.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...o, checklist: updatedChecklist };
      }
      return o;
    });
    onUpdateOrders(updatedOrders);
    syncChanges();
  };

  const syncChanges = () => {
    if (!isOnline) {
      setSyncStatus('pending');
    } else {
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('synced');
        triggerSyncToast();
      }, 1000);
    }
  };

  const handleCreateOrder = () => {
    const newId = `WO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: WorkOrder = {
      id: newId,
      assetId: newOrderForm.assetId || 'UNKNOWN',
      assetName: newOrderForm.assetName || 'General Asset',
      type: newOrderForm.type,
      description: newOrderForm.description || 'No Description Provided',
      priority: newOrderForm.priority,
      status: 'Pending',
      assignedTo: newOrderForm.assignedTo || 'Unassigned',
      dueDate: newOrderForm.dueDate,
      location: newOrderForm.location || 'Site Default',
      checklist: newOrderForm.checklist
    };

    const updatedList = [newOrder, ...orders];
    onUpdateOrders(updatedList);
    setIsModalOpen(false);
    
    // Reset Form
    setNewOrderForm({
      assetId: '',
      assetName: '',
      description: '',
      type: 'Ad-hoc',
      priority: 'Medium',
      assignedTo: '',
      location: '',
      dueDate: new Date().toISOString().split('T')[0],
      checklist: []
    });

    syncChanges();
  };

  const handleGenerateChecklist = async () => {
    if (!newOrderForm.description || !newOrderForm.assetName) return;
    setGeneratingChecklist(true);
    const steps = await generateMaintenanceChecklist(newOrderForm.assetName, newOrderForm.description);
    
    const checklistItems: ChecklistItem[] = steps.map((step, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      task: step,
      completed: false
    }));

    setNewOrderForm(prev => ({ ...prev, checklist: checklistItems }));
    setGeneratingChecklist(false);
  };

  const handleEnhanceDescription = async () => {
    if (!newOrderForm.description || !newOrderForm.assetName) return;
    setEnhancingDescription(true);
    const enhanced = await enhanceWorkOrderDescription(newOrderForm.description, newOrderForm.assetName);
    setNewOrderForm(prev => ({ ...prev, description: enhanced }));
    setEnhancingDescription(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        
        setAnalyzingImage(true);
        const analysis = await analyzeAssetImage(base64Content, file.type);
        setNewOrderForm(prev => ({ 
          ...prev, 
          description: prev.description ? prev.description + '\n\nVisual Analysis: ' + analysis : analysis 
        }));
        setAnalyzingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewOrderForm(prev => ({
        ...prev,
        description: prev.description ? `${prev.description} ${transcript}` : transcript
      }));
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.start();
  };

  const removeNewChecklistItem = (id: string) => {
    setNewOrderForm(prev => ({
      ...prev,
      checklist: prev.checklist.filter(c => c.id !== id)
    }));
  };

  // --- Helpers ---

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (s: Status) => {
    switch(s) {
      case 'Pending': return <Clock size={16} className="text-orange-500" />;
      case 'In Progress': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      case 'Completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'Flagged': return <AlertCircle size={16} className="text-red-500" />;
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="animate-fade-in max-w-5xl mx-auto relative pb-20">
      
      {/* Header Section with Offline Indicator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Work Orders</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500">
              {userRole === 'TECHNICIAN' ? 'View and update your assigned tasks.' : 'Manage scheduled maintenance.'}
            </p>
            
            {/* Connectivity Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-medium uppercase ${
              isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
              {isOnline ? 'Online' : 'Offline Mode'}
            </div>

            {/* Sync Status Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-medium uppercase transition-all ${
              syncStatus === 'synced' ? 'bg-blue-50 border-blue-200 text-blue-600' : 
              syncStatus === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-600' :
              'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
              {syncStatus === 'synced' && <Cloud size={10} />}
              {syncStatus === 'pending' && <CloudOff size={10} />}
              {syncStatus === 'syncing' && <RefreshCw size={10} className="animate-spin" />}
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'pending' ? 'Pending Sync' : 'Syncing...'}
            </div>
          </div>
        </div>

        {canCreate && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-alti-green hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> Create Order
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm inline-flex mb-6 overflow-x-auto max-w-full">
        {['All', 'Pending', 'In Progress', 'Completed', 'Flagged'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const completedSteps = order.checklist ? order.checklist.filter(c => c.completed).length : 0;
          const totalSteps = order.checklist ? order.checklist.length : 0;
          const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
          const isExpanded = expandedOrder === order.id;

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                
                {/* Left: Icon & Main Info */}
                <div className="flex gap-4 flex-1">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${order.type === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                     {order.type === 'Scheduled' ? <Calendar size={24} /> : <AlertCircle size={24} />}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                       <span className="font-mono text-xs text-slate-400">#{order.id}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(order.priority)}`}>
                         {order.priority}
                       </span>
                     </div>
                     <h3 className="text-lg font-bold text-slate-800">{order.description}</h3>
                     <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                       <span className="font-medium text-slate-700">{order.assetName}</span>
                       <span>•</span>
                       <span className="font-mono text-xs bg-slate-100 px-1 rounded">{order.assetId}</span>
                     </div>

                     {/* Checklist Progress Bar */}
                     {totalSteps > 0 && (
                       <div className="mt-3 max-w-xs">
                         <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-medium uppercase tracking-wide">
                            <span>Progress</span>
                            <span>{completedSteps}/{totalSteps} Tasks</span>
                         </div>
                         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-alti-green transition-all duration-500" style={{ width: `${progress}%` }}></div>
                         </div>
                       </div>
                     )}
                   </div>
                </div>

                {/* Right: Meta & Status Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 md:gap-1 min-w-[160px]">
                   
                   {/* Status Selector */}
                   <div className="relative group/status">
                      <button className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 px-3 py-1.5 rounded-full transition-all">
                        {getStatusIcon(order.status)}
                        <span className="font-medium">{order.status}</span>
                        <ChevronDown size={14} className="text-slate-400" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-10 hidden group-hover/status:block animate-fade-in">
                         {['Pending', 'In Progress', 'Completed', 'Flagged'].map((s) => (
                           <button
                             key={s}
                             onClick={(e) => {
                               e.stopPropagation();
                               updateOrderStatus(order.id, s as Status);
                             }}
                             className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 flex items-center gap-2 ${order.status === s ? 'text-alti-green bg-green-50' : 'text-slate-600'}`}
                           >
                             {getStatusIcon(s as Status)}
                             {s}
                           </button>
                         ))}
                      </div>
                   </div>
                   
                   <div className="flex flex-col items-end gap-1 mt-2">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={12} /> {order.location}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar size={12} /> Due: {order.dueDate}
                      </div>
                   </div>
                </div>
              </div>

              {/* Expandable Checklist Section */}
              {totalSteps > 0 && (
                <div className="border-t border-slate-100">
                   <button 
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full bg-slate-50 hover:bg-slate-100 p-2 text-xs font-bold text-slate-500 flex items-center justify-center gap-2 transition-colors"
                   >
                     {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                     {isExpanded ? 'Hide Checklist' : 'View Checklist'}
                   </button>
                   
                   {isExpanded && (
                     <div className="p-5 bg-slate-50/50 space-y-3 animate-fade-in">
                       {order.checklist?.map((item) => (
                         <div 
                           key={item.id} 
                           onClick={() => toggleChecklistItem(order.id, item.id)}
                           className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${item.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                         >
                           <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                             {item.completed && <Check size={12} className="text-white" />}
                           </div>
                           <span className={`text-sm ${item.completed ? 'text-emerald-800 line-through opacity-70' : 'text-slate-700'}`}>
                             {item.task}
                           </span>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          );
        })}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Filter className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500">No work orders found in this category.</p>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Plus className="text-alti-green" size={20}/> New Work Order
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none"
                    value={newOrderForm.type}
                    onChange={(e) => setNewOrderForm({...newOrderForm, type: e.target.value as WorkType})}
                  >
                    <option value="Ad-hoc">Ad-hoc (Unscheduled)</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none"
                    value={newOrderForm.priority}
                    onChange={(e) => setNewOrderForm({...newOrderForm, priority: e.target.value as Priority})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Asset Name</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none"
                    placeholder="e.g. Titan Excavator X1"
                    value={newOrderForm.assetName}
                    onChange={(e) => setNewOrderForm({...newOrderForm, assetName: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Asset ID</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none font-mono"
                    placeholder="e.g. AG-EXC-01"
                    value={newOrderForm.assetId}
                    onChange={(e) => setNewOrderForm({...newOrderForm, assetId: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-end mb-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                   <div className="flex gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      
                      {/* Voice Input Button */}
                      <button
                        onClick={handleVoiceInput}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                        title="Dictate Description"
                      >
                        {isListening ? <MicOff size={10} /> : <Mic size={10} />}
                        {isListening ? 'Listening...' : 'Dictate'}
                      </button>

                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={analyzingImage}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
                        title="Upload image to auto-generate description"
                      >
                        {analyzingImage ? <RefreshCw size={10} className="animate-spin" /> : <Camera size={10} />}
                        {analyzingImage ? 'Analyzing...' : 'Analyze Image'}
                      </button>

                      <button 
                        onClick={handleEnhanceDescription}
                        disabled={!newOrderForm.description || enhancingDescription}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                        title="Rewrite professionally using AI"
                      >
                        {enhancingDescription ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />}
                        {enhancingDescription ? 'Enhancing...' : 'Auto-Enhance'}
                      </button>
                      <button 
                        onClick={handleGenerateChecklist}
                        disabled={!newOrderForm.description || !newOrderForm.assetName || generatingChecklist}
                        className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        {generatingChecklist ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        {generatingChecklist ? 'Suggest Steps' : 'Suggest Steps'}
                      </button>
                   </div>
                </div>
                <div className="relative">
                  <textarea 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none resize-none h-24 transition-all"
                    placeholder="Describe the maintenance task... (e.g. 'strange noise in hydraulic pump')"
                    value={newOrderForm.description}
                    onChange={(e) => setNewOrderForm({...newOrderForm, description: e.target.value})}
                  ></textarea>
                  {enhancingDescription && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                      <Wand2 className="animate-bounce text-blue-500" />
                    </div>
                  )}
                  {analyzingImage && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg flex-col gap-2">
                      <ImageIcon className="animate-bounce text-slate-800" />
                      <span className="text-xs font-bold text-slate-800">Analyzing Image...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Checklist Section */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <ListChecks size={14} /> Task Checklist
                </label>
                {newOrderForm.checklist.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs italic">
                    No steps added. Use 'Suggest Steps' above or add manually.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {newOrderForm.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 group">
                         <span className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-xs text-slate-400 font-bold">
                           •
                         </span>
                         <input 
                           type="text" 
                           value={item.task}
                           onChange={(e) => {
                             const updated = newOrderForm.checklist.map(i => i.id === item.id ? {...i, task: e.target.value} : i);
                             setNewOrderForm({...newOrderForm, checklist: updated});
                           }}
                           className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-alti-green text-sm outline-none py-1 transition-colors"
                         />
                         <button 
                           onClick={() => removeNewChecklistItem(item.id)}
                           className="text-slate-300 hover:text-red-500 transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => {
                    const newItem = { id: `manual-${Date.now()}`, task: '', completed: false };
                    setNewOrderForm(prev => ({...prev, checklist: [...prev.checklist, newItem]}));
                  }}
                  className="text-xs text-alti-green font-bold hover:underline mt-2"
                >
                  + Add Step
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                   <input 
                    type="text"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none"
                    placeholder="Site / Zone"
                    value={newOrderForm.location}
                    onChange={(e) => setNewOrderForm({...newOrderForm, location: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Assign To</label>
                   <input 
                    type="text"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none"
                    placeholder="Technician Name"
                    value={newOrderForm.assignedTo}
                    onChange={(e) => setNewOrderForm({...newOrderForm, assignedTo: e.target.value})}
                   />
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                 <input 
                   type="date"
                   className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-alti-green focus:outline-none"
                   value={newOrderForm.dueDate}
                   onChange={(e) => setNewOrderForm({...newOrderForm, dueDate: e.target.value})}
                 />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateOrder}
                disabled={!newOrderForm.description || !newOrderForm.assetId}
                className="px-6 py-2 rounded-lg bg-alti-green hover:bg-green-700 text-white font-bold text-sm shadow-lg shadow-green-900/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={16} /> Save Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Sync Confirmation Toast */}
      {showSyncToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce z-50">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check size={12} className="text-white font-bold" />
          </div>
          <div className="flex flex-col">
             <span className="text-sm font-bold">Cloud Sync Complete</span>
             <span className="text-[10px] text-slate-400">All offline changes saved.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderManager;
