
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AdminStats, Order, DriverApplication, OrderStatus } from '../types';
import { COLORS } from '../constants';

interface AdminCommandCenterProps {
  onClose: () => void;
  orders: Order[];
  applications: DriverApplication[];
  onApproveApplication: (email: string) => void;
  onRejectApplication: (email: string) => void;
}

const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({ 
  onClose, orders, applications, onApproveApplication, onRejectApplication 
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'DRIVERS' | 'OPS'>('DASHBOARD');
  const [selectedApp, setSelectedApp] = useState<DriverApplication | null>(null);

  const revenueData = [
    { name: 'Mon', revenue: 1200 }, { name: 'Tue', revenue: 1900 }, { name: 'Wed', revenue: 1500 },
    { name: 'Thu', revenue: 2400 }, { name: 'Fri', revenue: 3200 }, { name: 'Sat', revenue: 4500 }, { name: 'Sun', revenue: 3800 },
  ];

  const cityPerformance = [
    { name: 'Houston', value: 450, color: COLORS.primary },
    { name: 'Dallas', value: 320, color: '#1A1A1A' },
    { name: 'Austin', value: 280, color: '#4F46E5' },
    { name: 'San Antonio', value: 190, color: '#10B981' },
  ];

  const stats: AdminStats = {
    dailyRevenue: 3800,
    weeklyRevenue: 24500,
    monthlyRevenue: 98000,
    activeDrivers: 142,
    pendingApplications: applications.filter(a => a.status === 'SUBMITTED').length,
    activeOrders: orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length,
    avgRating: 4.8,
    revenueGrowth: 12.5
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Daily Revenue', val: `$${stats.dailyRevenue}`, sub: `+${stats.revenueGrowth}% today`, icon: 'fa-money-bill-trend-up' },
          { label: 'Live Orders', val: stats.activeOrders, sub: 'Currently in-runn', icon: 'fa-truck-fast' },
          { label: 'Pending Apps', val: stats.pendingApplications, sub: 'Review required', icon: 'fa-user-clock' },
          { label: 'Avg Rating', val: `${stats.avgRating}★`, icon: 'fa-star' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4"><i className={`fa-solid ${item.icon}`}></i></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</h4>
            <p className="text-2xl font-black text-gray-900 mt-1">{item.val}</p>
            {item.sub && <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-2">{item.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 mb-8">Revenue Stream</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 mb-8">Market Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityPerformance}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 800}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {cityPerformance.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-8 animate-fadeIn">
      {selectedApp ? (
        <div className="bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100 space-y-10">
          <button onClick={() => setSelectedApp(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400"><i className="fa-solid fa-arrow-left"></i> Back to Queue</button>
          
          <div className="flex justify-between items-start">
             <div>
               <h2 className="text-4xl font-black uppercase tracking-tighter">{selectedApp.fullName}</h2>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{selectedApp.email} • {selectedApp.phone}</p>
             </div>
             <div className="flex gap-3">
               <button onClick={() => { onRejectApplication(selectedApp.email); setSelectedApp(null); }} className="px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase">Reject</button>
               <button onClick={() => { onApproveApplication(selectedApp.email); setSelectedApp(null); }} className="px-8 py-4 bg-[#10B981] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl">Approve Runner</button>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#C48B8B]">Personal & Vehicle</h4>
              <div className="p-8 bg-gray-50 rounded-[32px] space-y-4">
                <div className="flex justify-between"><span className="text-[9px] font-bold text-gray-400 uppercase">DOB</span><span className="text-[10px] font-black">{selectedApp.dob}</span></div>
                <div className="flex justify-between"><span className="text-[9px] font-bold text-gray-400 uppercase">Address</span><span className="text-[10px] font-black">{selectedApp.address}, {selectedApp.zipCode}</span></div>
                <div className="h-px bg-gray-200 my-4"></div>
                <div className="flex justify-between"><span className="text-[9px] font-bold text-gray-400 uppercase">Vehicle</span><span className="text-[10px] font-black">{selectedApp.vehicle.year} {selectedApp.vehicle.make} {selectedApp.vehicle.model}</span></div>
                <div className="flex justify-between"><span className="text-[9px] font-bold text-gray-400 uppercase">Plate</span><span className="text-[10px] font-black uppercase">{selectedApp.vehicle.plate}</span></div>
                <div className="h-px bg-gray-200 my-4"></div>
                <div className="flex justify-between"><span className="text-[9px] font-bold text-gray-400 uppercase">Signature</span><span className="font-serif text-2xl italic">{selectedApp.signature}</span></div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-[#C48B8B]">Document Review</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'DL Front', src: selectedApp.documents.licenseFront },
                  { label: 'DL Back', src: selectedApp.documents.licenseBack },
                  { label: 'SSN Card', src: selectedApp.documents.ssnCard },
                  { label: 'Insurance', src: selectedApp.documents.insurance },
                ].map((doc, i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group relative">
                    {doc.src ? <img src={doc.src} className="w-full h-full object-cover" alt={doc.label} /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fa-solid fa-image"></i></div>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-[8px] font-black text-white uppercase">{doc.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Runner Onboarding Queue</h2>
            <div className="flex gap-2 bg-white p-1 rounded-2xl border border-gray-100">
              <button className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-[9px] font-black uppercase">Pending ({stats.pendingApplications})</button>
              <button className="px-4 py-2 text-gray-400 rounded-xl text-[9px] font-black uppercase">Approved</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.filter(a => a.status === 'SUBMITTED').map((app, i) => (
              <div key={i} onClick={() => setSelectedApp(app)} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:border-[#C48B8B] cursor-pointer transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#C48B8B] group-hover:text-white transition-all"><i className="fa-solid fa-user-clock"></i></div>
                  <span className="text-[8px] font-black uppercase px-2 py-1 bg-amber-50 text-amber-500 rounded-lg">Needs Review</span>
                </div>
                <h4 className="font-black text-gray-900 uppercase tracking-tight">{app.fullName}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{app.email}</p>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                   <span className="text-[8px] font-black text-gray-300 uppercase">Submitted Today</span>
                   <i className="fa-solid fa-chevron-right text-[10px] text-gray-300"></i>
                </div>
              </div>
            ))}
            {applications.filter(a => a.status === 'SUBMITTED').length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <i className="fa-solid fa-check-double text-5xl text-gray-100"></i>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Queue is clear. No pending applications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] bg-gray-50 safe-top flex flex-col animate-fadeIn">
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xl"><i className="fa-solid fa-gauge-high"></i></div>
            <h2 className="font-black text-sm uppercase tracking-tighter">Command Center</h2>
          </div>
          <div className="hidden lg:flex items-center bg-gray-50 p-1.5 rounded-2xl gap-2">
            {[
              { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Analytics' },
              { id: 'DRIVERS', icon: 'fa-people-group', label: 'Runners' },
              { id: 'OPS', icon: 'fa-microchip', label: 'System' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-pink-50 transition-all"><i className="fa-solid fa-power-off"></i></button>
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'DASHBOARD' && renderDashboard()}
          {activeTab === 'DRIVERS' && renderDrivers()}
          {activeTab === 'OPS' && (
            <div className="py-20 text-center space-y-6">
              <i className="fa-solid fa-microchip text-7xl text-gray-100"></i>
              <h3 className="text-2xl font-black uppercase">System Engine Active</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time GPS nodes: 142 | Latency: 42ms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
