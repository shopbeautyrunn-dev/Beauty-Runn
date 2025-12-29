
import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AdminStats, Order, DriverApplication, OrderStatus, SupportTicket, TeamMember } from '../types';
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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'DRIVERS' | 'SUPPORT' | 'OPS'>('DASHBOARD');

  // Mock data for charts
  const revenueData = [
    { name: 'Mon', revenue: 1200, orders: 45 },
    { name: 'Tue', revenue: 1900, orders: 62 },
    { name: 'Wed', revenue: 1500, orders: 48 },
    { name: 'Thu', revenue: 2400, orders: 89 },
    { name: 'Fri', revenue: 3200, orders: 120 },
    { name: 'Sat', revenue: 4500, orders: 156 },
    { name: 'Sun', revenue: 3800, orders: 134 },
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
    pendingApplications: applications.filter(a => a.status === 'PENDING_APPROVAL').length,
    activeOrders: orders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length,
    avgRating: 4.8,
    revenueGrowth: 12.5
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-fadeIn">
      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Daily Revenue', val: `$${stats.dailyRevenue}`, sub: `+${stats.revenueGrowth}% today`, icon: 'fa-money-bill-trend-up' },
          { label: 'Live Orders', val: stats.activeOrders, sub: 'Currently in-runn', icon: 'fa-truck-fast' },
          { label: 'Active Runners', val: stats.activeDrivers, sub: '84% online', icon: 'fa-person-running' },
          { label: 'Avg Rating', val: `${stats.avgRating}★`, sub: 'Customer feedback', icon: 'fa-star' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{item.label}</h4>
            <p className="text-2xl font-black text-gray-900 mt-1">{item.val}</p>
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mt-2">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* REVENUE TREND */}
        <div className="md:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Weekly Performance</h3>
            <select className="bg-gray-50 text-[10px] font-black uppercase px-4 py-2 rounded-xl outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CITY DISTRIBUTION */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 mb-8">Market Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityPerformance}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 800}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {cityPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {cityPerformance.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase text-gray-400">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-gray-900">{item.value} Runns</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-gray-900">Runner Management</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Approvals & Performance</p>
        </div>
        <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
          Recruit New Runners
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* PENDING APPS */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-pink-600">Onboarding Queue</h3>
          {applications.length === 0 ? (
            <div className="py-20 text-center">
              <i className="fa-solid fa-folder-open text-gray-100 text-5xl mb-4"></i>
              <p className="text-[10px] font-black text-gray-300 uppercase">Queue Clear</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-3xl space-y-6 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-gray-900 uppercase tracking-tight">{app.fullName}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{app.email}</p>
                    </div>
                    <div className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[8px] font-black uppercase">Pending Doc Check</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => window.open(app.documents.license || '', '_blank')} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest">View DL</button>
                    <button onClick={() => window.open(app.documents.insurance || '', '_blank')} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest">View Ins</button>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => onApproveApplication(app.email)}
                      className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-colors"
                    >
                      Approve Runner
                    </button>
                    <button 
                      onClick={() => onRejectApplication(app.email)}
                      className="px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PERFORMANCE TRACKER */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6">Top Rated Runners</h3>
          <div className="space-y-4">
            {[
              { name: 'Marcus K.', city: 'Houston', rating: 4.9, earnings: 1250, image: 'https://i.pravatar.cc/150?u=marcus' },
              { name: 'Elena R.', city: 'Dallas', rating: 4.8, earnings: 980, image: 'https://i.pravatar.cc/150?u=elena' },
              { name: 'Dwayne J.', city: 'Austin', rating: 4.7, earnings: 820, image: 'https://i.pravatar.cc/150?u=dwayne' }
            ].map((driver, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4 bg-gray-50 rounded-3xl border border-gray-100">
                <img src={driver.image} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                <div className="flex-1">
                  <h5 className="font-black text-xs text-gray-900 uppercase">{driver.name}</h5>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{driver.city} • {driver.rating}★</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-900">${driver.earnings}</p>
                  <p className="text-[8px] font-black text-green-500 uppercase">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpsHub = () => (
    <div className="space-y-10 animate-fadeIn">
      <div className="bg-gray-900 p-10 rounded-[50px] text-white">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Operations Workflow</h2>
        <p className="text-sm text-white/50 mb-10 max-w-md uppercase tracking-widest font-bold">Standard Runn lifecycle visualization for training and compliance.</p>
        
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 hidden md:block -z-1"></div>
          
          {[
            { step: 1, label: 'Authorization', icon: 'fa-lock', desc: 'Auth hold placed on card' },
            { step: 2, label: 'Dispatch', icon: 'fa-satellite', desc: 'Order sent to nearest Runner' },
            { step: 3, label: 'Sourcing', icon: 'fa-cart-shopping', desc: 'In-store purchase verification' },
            { step: 4, label: 'Settlement', icon: 'fa-check-double', desc: 'Final capture of receipt price' }
          ].map((flow, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4 z-10 w-40">
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center text-2xl shadow-luxury">
                <i className={`fa-solid ${flow.icon}`}></i>
              </div>
              <div>
                <h4 className="font-black text-[11px] uppercase tracking-widest mb-1">{flow.label}</h4>
                <p className="text-[9px] text-white/40 font-bold leading-relaxed">{flow.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm">
        <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 mb-8">System Compliance Logs</h3>
        <div className="space-y-3">
          {[
            { time: '10:45 AM', action: 'Auth Success', detail: 'User #921 (Houston)', status: 'Success' },
            { time: '10:42 AM', action: 'Refund Issued', detail: 'Order #BR-92X1 (Cypress)', status: 'Override' },
            { time: '10:39 AM', action: 'System Alert', detail: 'High latency in Dallas hub', status: 'Warning' },
            { time: '10:35 AM', action: 'SSN Verified', detail: 'Application #881 (Elena R.)', status: 'Success' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-gray-300 w-16">{log.time}</span>
                <div>
                  <h5 className="text-[10px] font-black uppercase text-gray-900">{log.action}</h5>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{log.detail}</p>
                </div>
              </div>
              <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                log.status === 'Success' ? 'bg-green-50 text-green-500' :
                log.status === 'Warning' ? 'bg-amber-50 text-amber-500' :
                'bg-gray-100 text-gray-900'
              }`}>{log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] bg-gray-50 safe-top flex flex-col animate-fadeIn">
      {/* SIDEBAR / HEADER NAVIGATION */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-gauge-high"></i>
            </div>
            <div>
              <h2 className="font-black text-sm uppercase tracking-tighter">Command Center</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Beauty Runn Platform Control</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center bg-gray-50 p-1.5 rounded-2xl gap-2">
            {[
              { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Analytics' },
              { id: 'ORDERS', icon: 'fa-box-open', label: 'Order Stream' },
              { id: 'DRIVERS', icon: 'fa-people-group', label: 'Runners' },
              { id: 'OPS', icon: 'fa-microchip', label: 'Operations' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-xs`}></i>
                <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl hover:bg-pink-50 hover:text-pink-600 transition-all flex items-center justify-center">
          <i className="fa-solid fa-power-off"></i>
        </button>
      </nav>

      {/* MOBILE TAB NAV */}
      <div className="lg:hidden flex bg-white border-b border-gray-100 px-8 py-3 overflow-x-auto no-scrollbar gap-4">
        {[
          { id: 'DASHBOARD', label: 'Stats' },
          { id: 'ORDERS', label: 'Orders' },
          { id: 'DRIVERS', label: 'Drivers' },
          { id: 'OPS', label: 'System' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`shrink-0 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
              activeTab === tab.id ? 'bg-pink-600 text-white shadow-lg shadow-pink-100' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'DASHBOARD' && renderDashboard()}
          {activeTab === 'DRIVERS' && renderDrivers()}
          {activeTab === 'OPS' && renderOpsHub()}
          {activeTab === 'ORDERS' && (
            <div className="animate-fadeIn py-20 text-center">
              <i className="fa-solid fa-list-check text-gray-200 text-5xl mb-6"></i>
              <h3 className="font-black text-gray-900 uppercase tracking-tighter text-2xl">Live Stream Active</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Connecting to Real-time Dispatch Server...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
