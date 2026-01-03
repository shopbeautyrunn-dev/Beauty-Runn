
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AdminStats, Order, DriverApplication, OrderStatus } from '../types';
import { COLORS, VENDORS, PRODUCTS } from '../constants';

interface AdminCommandCenterProps {
  onClose: () => void;
  orders: Order[];
  applications: DriverApplication[];
  onApproveApplication: (email: string) => void;
  onRejectApplication: (email: string) => void;
  appRole?: 'ADMIN' | 'OWNER';
}

const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({ 
  onClose, orders, applications, onApproveApplication, onRejectApplication, appRole = 'OWNER'
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'RUNNERS' | 'INVENTORY' | 'FINANCE' | 'MARKETING'>('DASHBOARD');
  const [selectedApp, setSelectedApp] = useState<DriverApplication | null>(null);
  const [isEmergencyPaused, setIsEmergencyPaused] = useState(false);

  // Mock Data
  const revenueData = [
    { name: 'Mon', revenue: 4200 }, { name: 'Tue', revenue: 3900 }, { name: 'Wed', revenue: 5500 },
    { name: 'Thu', revenue: 6400 }, { name: 'Fri', revenue: 8200 }, { name: 'Sat', revenue: 11500 }, { name: 'Sun', revenue: 9800 },
  ];

  const stats: AdminStats = {
    dailyRevenue: 9800,
    weeklyRevenue: 49500,
    monthlyRevenue: 198000,
    activeDrivers: 42,
    pendingApplications: applications.filter(a => a.status === 'SUBMITTED').length,
    activeOrders: 14,
    avgRating: 4.9,
    revenueGrowth: 18.2
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-fadeIn">
      {appRole === 'OWNER' && (
        <div className={`p-8 rounded-[40px] flex items-center justify-between border-2 transition-all ${isEmergencyPaused ? 'bg-red-50 border-red-200' : 'bg-white border-transparent shadow-luxury'}`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl ${isEmergencyPaused ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Emergency Protocol: {isEmergencyPaused ? 'PAUSED' : 'READY'}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Founders can halt all neighborhood hubs instantly.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEmergencyPaused(!isEmergencyPaused)}
            className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${isEmergencyPaused ? 'bg-[#10B981] text-white' : 'bg-red-600 text-white hover:scale-105 active:scale-95'}`}
          >
            {isEmergencyPaused ? 'Resume Hub Operations' : 'Emergency Pause Global'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Revenue Node', val: `$${stats.dailyRevenue}`, sub: `+${stats.revenueGrowth}% today`, icon: 'fa-money-bill-trend-up' },
          { label: 'Active Runs', val: stats.activeOrders, sub: 'Live sourcing', icon: 'fa-truck-fast' },
          { label: 'Runner Queue', val: stats.pendingApplications, sub: 'Needs review', icon: 'fa-user-clock' },
          { label: 'Trust Rating', val: `${stats.avgRating}★`, icon: 'fa-star' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-6"><i className={`fa-solid ${item.icon}`}></i></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</h4>
            <p className="text-3xl font-black text-gray-900 mt-2">{item.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[60px] shadow-sm border border-gray-100">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-8">System Volume (Sourcing Activity)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={4} fill="#C48B8B20" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderRunners = () => (
    <div className="space-y-8 animate-fadeIn">
      {selectedApp ? (
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 space-y-12">
           <div className="flex justify-between items-center">
             <button onClick={() => setSelectedApp(null)} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-900">
               <i className="fa-solid fa-arrow-left mr-2"></i> Queue
             </button>
             <div className="flex gap-4">
                <button onClick={() => { onRejectApplication(selectedApp.email); setSelectedApp(null); }} className="px-10 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Reject</button>
                <button onClick={() => { onApproveApplication(selectedApp.email); setSelectedApp(null); }} className="px-10 py-5 bg-[#10B981] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Approve Runner</button>
             </div>
           </div>

           <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <h2 className="font-serif text-5xl italic text-gray-900">{selectedApp.fullName}</h2>
                <div className="grid grid-cols-2 gap-8 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <div>DOB: <span className="text-gray-900">{selectedApp.dob}</span></div>
                  <div>Phone: <span className="text-gray-900">{selectedApp.phone}</span></div>
                  <div className="col-span-2">Email: <span className="text-gray-900">{selectedApp.email}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 p-10 rounded-[50px] space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-widest">Documents Verified</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-video bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-gray-100 text-3xl">
                      <i className="fa-solid fa-image"></i>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {applications.filter(a => a.status === 'SUBMITTED').map((app, i) => (
            <div key={i} onClick={() => setSelectedApp(app)} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:border-[#C48B8B] cursor-pointer group transition-all">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#C48B8B] group-hover:text-white transition-all text-xl mb-6"><i className="fa-solid fa-user-clock"></i></div>
              <h4 className="font-black text-gray-900 text-lg uppercase tracking-tighter">{app.fullName}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{app.zipCode} Neighborhood</p>
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-300">
                <span>View Full Details</span>
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          ))}
          {applications.filter(a => a.status === 'SUBMITTED').length === 0 && (
            <div className="col-span-full py-40 text-center">
              <i className="fa-solid fa-check-double text-5xl text-gray-100 mb-6"></i>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">Queue is Clear</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] bg-gray-50 safe-top flex flex-col animate-fadeIn overflow-hidden">
      <div className="flex h-full">
        <aside className="w-80 bg-[#1A1A1A] flex flex-col h-full py-10 px-8 border-r border-white/5">
          <div className="flex items-center gap-4 mb-16 px-4">
            <div className="w-12 h-12 bg-[#C48B8B] rounded-[20px] flex items-center justify-center text-white text-2xl shadow-xl shadow-[#C48B8B]/10"><i className="fa-solid fa-gauge-high"></i></div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif text-2xl italic text-white leading-none">B</h2>
                <i className="fa-solid fa-heart text-[#C48B8B] text-[10px] animate-floating-heart mt-1"></i>
                <h2 className="font-serif text-2xl italic text-white leading-none ml-1">Runn</h2>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">Owner Command</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Analytics' },
              { id: 'RUNNERS', icon: 'fa-people-group', label: 'Runners' },
              { id: 'INVENTORY', icon: 'fa-store', label: 'Inventory' },
              { id: 'ORDERS', icon: 'fa-truck-fast', label: 'Live Orders' },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-6 px-6 py-5 rounded-3xl transition-all group ${activeTab === tab.id ? 'bg-[#C48B8B] text-white shadow-2xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <i className={`fa-solid ${tab.icon} text-lg w-6 text-center`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button onClick={onClose} className="mt-auto w-full flex items-center gap-6 px-6 py-5 rounded-3xl text-red-400 hover:bg-red-400/10 transition-all active:scale-95">
            <i className="fa-solid fa-power-off text-lg w-6 text-center"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">Logout Portal</span>
          </button>
        </aside>

        <main className="flex-1 bg-gray-50 overflow-y-auto no-scrollbar relative">
          <header className="sticky top-0 z-50 bg-gray-50/80 backdrop-blur-xl px-12 py-8 flex items-center justify-between border-b border-gray-100">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Command Center <span className="mx-4">/</span> <span className="text-gray-900">{activeTab}</span></h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[8px] font-black uppercase text-gray-500">Nodes Active</span>
              </div>
            </div>
          </header>

          <div className="px-12 py-12">
            {activeTab === 'DASHBOARD' && renderDashboard()}
            {activeTab === 'RUNNERS' && renderRunners()}
            {(activeTab === 'INVENTORY' || activeTab === 'ORDERS') && (
               <div className="py-40 text-center space-y-8 animate-fadeIn">
                 <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-gray-100 text-4xl mx-auto shadow-inner"><i className={`fa-solid ${activeTab === 'INVENTORY' ? 'fa-store' : 'fa-truck-fast'}`}></i></div>
                 <div>
                   <h3 className="font-serif text-4xl italic text-gray-900">Module Synchronizing</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Live neighborhood nodes connecting...</p>
                 </div>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
