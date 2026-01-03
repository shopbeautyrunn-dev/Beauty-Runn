
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { AdminStats, Order, DriverApplication, OrderStatus, BeautyVendor, Product } from '../types';
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

  // Mock Data for Charts
  const revenueData = [
    { name: 'Mon', revenue: 4200, profit: 840 }, 
    { name: 'Tue', revenue: 3900, profit: 780 }, 
    { name: 'Wed', revenue: 5500, profit: 1100 },
    { name: 'Thu', revenue: 6400, profit: 1280 }, 
    { name: 'Fri', revenue: 8200, profit: 1640 }, 
    { name: 'Sat', revenue: 11500, profit: 2300 }, 
    { name: 'Sun', revenue: 9800, profit: 1960 },
  ];

  const zipPerformance = [
    { name: '77004 (3rd Ward)', orders: 145 },
    { name: '77021 (Sunnyside)', orders: 98 },
    { name: '77002 (Downtown)', orders: 82 },
    { name: '77060 (Greenspoint)', orders: 67 },
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
      {/* Founder Alert Bar */}
      {appRole === 'OWNER' && (
        <div className={`p-6 rounded-[32px] flex items-center justify-between border-2 transition-all ${isEmergencyPaused ? 'bg-red-50 border-red-200' : 'bg-white border-transparent shadow-sm'}`}>
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isEmergencyPaused ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">System Status: {isEmergencyPaused ? 'PAUSED' : 'ACTIVE'}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                {isEmergencyPaused ? 'Global orders halted. Existing runns completing.' : 'Neighborhood hubs operating at peak velocity.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsEmergencyPaused(!isEmergencyPaused)}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${isEmergencyPaused ? 'bg-[#10B981] text-white' : 'bg-[#1A1A1A] text-white hover:bg-red-600'}`}
          >
            {isEmergencyPaused ? 'Resume Sourcing' : 'Global Emergency Pause'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Weekly Gross', val: `$${stats.weeklyRevenue.toLocaleString()}`, sub: `+${stats.revenueGrowth}% Growth`, icon: 'fa-chart-line', color: 'text-green-500' },
          { label: 'Active Runners', val: stats.activeDrivers, sub: 'Online Now', icon: 'fa-person-running', color: 'text-[#C48B8B]' },
          { label: 'System Margin', val: '22.4%', sub: 'Target: 20%', icon: 'fa-piggy-bank', color: 'text-blue-500' },
          { label: 'Avg Delivery', val: '14.2m', sub: '-2m this week', icon: 'fa-stopwatch', color: 'text-amber-500' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group hover:border-[#C48B8B] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-6 group-hover:bg-[#C48B8B] group-hover:text-white transition-all">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</h4>
            <p className="text-3xl font-black text-gray-900 mt-2">{item.val}</p>
            <p className={`text-[9px] font-bold uppercase tracking-widest mt-3 ${item.color}`}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1A1A1A] p-10 rounded-[60px] shadow-2xl overflow-hidden relative">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-serif text-3xl italic text-white">Revenue Sourcing</h3>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-2">Combined Houston Neighborhood Data</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-[8px] font-black text-white uppercase">Last 7 Days</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C48B8B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C48B8B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ffffff40', fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ffffff40', fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '20px', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C48B8B" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="profit" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[60px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-serif text-3xl italic text-gray-900 mb-8">Zone Velocity</h3>
          <div className="space-y-6 flex-1">
            {zipPerformance.map((zip, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{zip.name}</span>
                  <span className="text-xs font-black text-gray-900">{zip.orders} Runns</span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C48B8B] rounded-full transition-all duration-1000" style={{ width: `${(zip.orders / 150) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50">
             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-[#C48B8B]">
               <span>Expansion Opportunity: 77019</span>
               <i className="fa-solid fa-arrow-right"></i>
             </div>
          </div>
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
               <i className="fa-solid fa-arrow-left mr-2"></i> Back to Queue
             </button>
             <div className="flex gap-4">
                <button onClick={() => { onRejectApplication(selectedApp.email); setSelectedApp(null); }} className="px-10 py-5 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Reject Application</button>
                <button onClick={() => { onApproveApplication(selectedApp.email); setSelectedApp(null); }} className="px-10 py-5 bg-[#10B981] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Activate Runner</button>
             </div>
           </div>

           <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <header>
                  <h2 className="font-serif text-5xl italic text-gray-900">{selectedApp.fullName}</h2>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C48B8B] mt-3">Identity Verified Sourcing</p>
                </header>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400">DOB</span>
                    <p className="text-xs font-black">{selectedApp.dob}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400">Phone</span>
                    <p className="text-xs font-black">{selectedApp.phone}</p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400">Home Base</span>
                    <p className="text-xs font-black">{selectedApp.address}, {selectedApp.zipCode}</p>
                  </div>
                  <div className="col-span-2 pt-6 border-t border-gray-50 space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-[#C48B8B] tracking-widest">Vehicle Credentials</h4>
                    <div className="flex gap-10">
                       <div className="space-y-1">
                         <span className="text-[9px] font-black uppercase text-gray-400">Plate</span>
                         <p className="text-xs font-black uppercase">{selectedApp.vehicle.plate}</p>
                       </div>
                       <div className="space-y-1">
                         <span className="text-[9px] font-black uppercase text-gray-400">Model</span>
                         <p className="text-xs font-black">{selectedApp.vehicle.year} {selectedApp.vehicle.make} {selectedApp.vehicle.model}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[50px] p-10 space-y-8">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Document Inspection</h4>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'License Front', img: selectedApp.documents.licenseFront },
                      { label: 'License Back', img: selectedApp.documents.licenseBack },
                      { label: 'Auto Insurance', img: selectedApp.documents.insurance },
                      { label: 'SSN Proof', img: selectedApp.documents.ssnCard },
                    ].map((doc, i) => (
                      <div key={i} className="aspect-[4/3] bg-white rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center relative group">
                        {doc.img ? (
                          <img src={doc.img} className="w-full h-full object-cover" alt={doc.label} />
                        ) : (
                          <i className="fa-solid fa-image text-gray-100 text-3xl"></i>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all p-4 text-center">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">{doc.label}</span>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-gray-200">
                    <span className="text-[9px] font-black uppercase text-gray-400">Digital E-Signature</span>
                    <p className="font-serif text-3xl italic text-gray-900 mt-2">{selectedApp.signature}</p>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-4xl italic text-gray-900">Runner Recruitment</h2>
            <div className="flex gap-3">
               <button className="bg-white px-6 py-3 rounded-2xl border border-gray-100 text-[9px] font-black uppercase tracking-widest shadow-sm">Active Runners ({stats.activeDrivers})</button>
               <button className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl">Pending Apps ({applications.filter(a => a.status === 'SUBMITTED').length})</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {applications.filter(a => a.status === 'SUBMITTED').map((app, i) => (
              <div key={i} onClick={() => setSelectedApp(app)} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:border-[#C48B8B] cursor-pointer group transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-[#C48B8B] group-hover:text-white transition-all text-xl"><i className="fa-solid fa-file-signature"></i></div>
                   <span className="text-[8px] font-black uppercase px-3 py-1 bg-amber-50 text-amber-500 rounded-full tracking-widest">Needs Review</span>
                </div>
                <h4 className="font-black text-gray-900 text-lg uppercase tracking-tighter">{app.fullName}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{app.zipCode} Neighborhood Hub</p>
                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Applied Today</span>
                  <i className="fa-solid fa-arrow-right text-gray-300 group-hover:text-[#C48B8B] transition-colors"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-serif text-4xl italic text-gray-900">Catalog & Sourcing</h2>
          <p className="text-[10px] font-black text-[#C48B8B] uppercase tracking-widest mt-2">Managing {VENDORS.length} Stores and {PRODUCTS.length} Products</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-gray-400 hover:text-gray-900 transition-all"><i className="fa-solid fa-magnifying-glass"></i></button>
           <button className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">+ New Sourcing Hub</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* VENDORS LIST */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Neighborhood Storefronts</h3>
          {VENDORS.map(v => (
            <div key={v.id} className="bg-white p-6 rounded-[40px] border border-gray-100 flex items-center gap-6 group hover:border-[#C48B8B] transition-all">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
                <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-[#1A1A1A] uppercase tracking-tight">{v.name}</h4>
                  <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${v.isActive === false ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                    {v.isActive === false ? 'Offline' : 'Online'}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{v.neighborhood} • {v.zipCode}</p>
                <div className="flex gap-4 mt-4">
                  <span className="text-[8px] font-black text-[#C48B8B] uppercase tracking-widest cursor-pointer hover:underline">Edit Hub</span>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:underline">Inventory Sync</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PRODUCTS LIST */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Retail Catalog Assets</h3>
          <div className="grid grid-cols-1 gap-4">
            {PRODUCTS.slice(0, 5).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 group hover:border-[#C48B8B] transition-all">
                <img src={p.image} className="w-14 h-20 rounded-xl object-cover border border-gray-50" alt="" />
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <span className="text-[8px] font-black text-[#C48B8B] uppercase tracking-widest">{p.brand}</span>
                      <div className="flex gap-2">
                        {p.isOnSale && <i className="fa-solid fa-tag text-[10px] text-pink-500"></i>}
                        {p.isBestSeller && <i className="fa-solid fa-crown text-[10px] text-amber-500"></i>}
                      </div>
                   </div>
                   <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{p.name}</h4>
                   <p className="text-[10px] font-black text-gray-400 mt-1">${p.priceRange.min.toFixed(2)} - ${p.priceRange.max.toFixed(2)}</p>
                </div>
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-[#C48B8B] transition-all">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </div>
            ))}
          </div>
          <button className="w-full py-6 border-2 border-dashed border-gray-100 rounded-[32px] text-[10px] font-black uppercase tracking-widest text-gray-300 hover:border-[#C48B8B] hover:text-[#C48B8B] transition-all">View Full Global Catalog</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] bg-gray-50 safe-top flex flex-col animate-fadeIn overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <div className="flex h-full">
        <aside className="w-24 md:w-80 bg-[#1A1A1A] flex flex-col items-center md:items-stretch h-full py-10 px-6 border-r border-white/5">
          <div className="flex items-center gap-4 px-4 mb-16">
            <div className="w-12 h-12 bg-[#C48B8B] rounded-[20px] flex items-center justify-center text-white text-2xl shadow-xl shadow-[#C48B8B]/10">
              <i className="fa-solid fa-gauge-high"></i>
            </div>
            <div className="hidden md:block">
              <h2 className="font-serif text-2xl italic text-white leading-none">B. Runn</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">Admin Command Center</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Analytics' },
              { id: 'ORDERS', icon: 'fa-truck-fast', label: 'Live Orders' },
              { id: 'RUNNERS', icon: 'fa-people-group', label: 'Runners' },
              { id: 'INVENTORY', icon: 'fa-store', label: 'Inventory' },
              { id: 'FINANCE', icon: 'fa-wallet', label: 'Finance' },
              { id: 'MARKETING', icon: 'fa-wand-magic-sparkles', label: 'Marketing' },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-6 px-6 py-5 rounded-3xl transition-all group ${activeTab === tab.id ? 'bg-[#C48B8B] text-white shadow-2xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
              >
                <i className={`fa-solid ${tab.icon} text-lg w-6 text-center`}></i>
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="hidden md:block bg-white/5 p-6 rounded-[32px] border border-white/5 mb-8">
               <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Logged in as</p>
               <h4 className="text-xs font-black text-white uppercase mt-1">{appRole} View</h4>
               <p className="text-[9px] font-bold text-[#C48B8B] uppercase mt-2">All Nodes Active</p>
            </div>
            <button onClick={onClose} className="w-full flex items-center justify-center md:justify-start gap-6 px-6 py-5 rounded-3xl text-red-400 hover:bg-red-400/10 transition-all">
              <i className="fa-solid fa-power-off text-lg w-6 text-center"></i>
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Logout Portal</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-gray-50 overflow-y-auto no-scrollbar relative">
          <header className="sticky top-0 z-50 bg-gray-50/80 backdrop-blur-xl px-12 py-8 flex items-center justify-between">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">
              System Dashboard <span className="mx-4">/</span> <span className="text-gray-900">{activeTab}</span>
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Server Latency: 42ms</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                <i className="fa-solid fa-bell"></i>
              </div>
            </div>
          </header>

          <div className="px-12 pb-20">
            {activeTab === 'DASHBOARD' && renderDashboard()}
            {activeTab === 'RUNNERS' && renderRunners()}
            {activeTab === 'INVENTORY' && renderInventory()}
            {(activeTab === 'ORDERS' || activeTab === 'FINANCE' || activeTab === 'MARKETING') && (
               <div className="py-40 text-center space-y-8 animate-fadeIn">
                 <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-gray-100 text-4xl mx-auto shadow-inner">
                    <i className={`fa-solid ${
                      activeTab === 'ORDERS' ? 'fa-truck-fast' : 
                      activeTab === 'FINANCE' ? 'fa-wallet' : 'fa-wand-magic-sparkles'
                    }`}></i>
                 </div>
                 <div>
                   <h3 className="font-serif text-4xl italic text-gray-900">Module Under Sourcing</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Refining {activeTab} interfaces for high-scale neighborhood ops.</p>
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
