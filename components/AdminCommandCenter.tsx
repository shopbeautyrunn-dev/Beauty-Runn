import React, { useState, useRef } from 'react';
import { AdminStats, Order, DriverApplication, OrderStatus, Area, ZipCode } from '../types';
import { VENDORS, AREAS, ZIP_CODES } from '../constants';
import { bulkImportAreas } from '../services/locationService';

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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'AREAS' | 'RUNNERS' | 'STORES'>('DASHBOARD');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLTextAreaElement>(null);

  const stats: AdminStats = {
    dailyRevenue: 12450,
    weeklyRevenue: 85000,
    monthlyRevenue: 342000,
    activeDrivers: applications.filter(a => a.status === 'APPROVED').length,
    pendingApplications: applications.filter(a => a.status === 'SUBMITTED').length,
    activeOrders: orders.length,
    avgRating: 4.8,
    revenueGrowth: 12
  };

  const handleBulkImport = async () => {
    const csv = csvInputRef.current?.value;
    if (!csv) return;
    setIsImporting(true);
    try {
      const result = await bulkImportAreas(csv);
      setImportStatus(`Successfully synced ${result.count} local zones.`);
    } catch (e) {
      setImportStatus("Sync failed. Check CSV formatting.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#F9F6F3] safe-top flex flex-col animate-fadeIn overflow-hidden">
      <div className="flex h-full">
        <aside className="w-80 bg-[#1A1A1A] flex flex-col h-full py-10 px-8 border-r border-white/5 shrink-0">
          <div className="flex items-center gap-4 mb-16 px-4">
            <div className="w-12 h-12 bg-[#C48B8B] rounded-[20px] flex items-center justify-center text-white text-2xl shadow-xl"><i className="fa-solid fa-gauge-high"></i></div>
            <div>
              <h2 className="font-serif text-2xl italic text-white leading-none">Beauty Runn</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">Global Logistics</p>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            {[
              { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Fleet Overview' },
              { id: 'AREAS', icon: 'fa-map-location-dot', label: 'Service Areas' },
              { id: 'STORES', icon: 'fa-shop', label: 'Retail Partners' },
              { id: 'RUNNERS', icon: 'fa-people-group', label: 'Runner Queue' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-6 px-6 py-5 rounded-3xl transition-all ${activeTab === tab.id ? 'bg-[#C48B8B] text-white shadow-2xl' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                <i className={`fa-solid ${tab.icon} text-lg w-6 text-center`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </nav>
          <button onClick={onClose} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-400/10 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all"><i className="fa-solid fa-power-off"></i> Disconnect</button>
        </aside>

        <main className="flex-1 overflow-y-auto no-scrollbar px-12 py-12">
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-10 animate-fadeIn">
              <h2 className="font-serif text-5xl italic text-gray-900">Dispatcher Command</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Active Runners', val: stats.activeDrivers, icon: 'fa-users' },
                  { label: 'Houston Zones', val: AREAS.length, icon: 'fa-map' },
                  { label: 'System ZIPs', val: ZIP_CODES.length, icon: 'fa-location-dot' },
                  { label: 'Local Independents', val: VENDORS.length, icon: 'fa-shop' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-[#F9F6F3] flex items-center justify-center text-gray-300 mb-6"><i className={`fa-solid ${item.icon}`}></i></div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</h4>
                    <p className="text-3xl font-black text-gray-900 mt-2">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'AREAS' && (
            <div className="grid lg:grid-cols-2 gap-10 animate-fadeIn">
              <div className="bg-white p-10 rounded-[60px] border border-gray-100 shadow-sm space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 flex items-center gap-3">
                   <i className="fa-solid fa-file-import text-[#C48B8B]"></i> CSV Bulk Sync (Stores/Areas)
                 </h3>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-2">
                    <p className="text-[8px] font-bold text-gray-400 uppercase mb-2">Format Guide</p>
                    <code className="text-[9px] text-pink-600 block">id,city,area_name,area_type,zip_codes[]</code>
                 </div>
                 <textarea 
                  ref={csvInputRef}
                  placeholder="area-3rd-ward,Houston,Third Ward,NEIGHBORHOOD,77004|77021"
                  className="w-full h-48 p-6 bg-[#F9F6F3] rounded-3xl font-mono text-xs outline-none border border-transparent focus:border-[#C48B8B]/20 transition-all resize-none shadow-inner"
                 />
                 <button 
                  disabled={isImporting}
                  onClick={handleBulkImport}
                  className="w-full py-6 bg-[#1A1A1A] text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl rose-glow disabled:bg-gray-200"
                 >
                   {isImporting ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Deploy Logistics Update'}
                 </button>
                 {importStatus && <p className="text-[9px] font-black text-[#10B981] uppercase text-center bg-green-50 py-2 rounded-xl border border-green-100">{importStatus}</p>}
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Active Service Regions</h3>
                <div className="space-y-4">
                  {AREAS.map(area => (
                    <div key={area.id} className="p-6 bg-white rounded-[32px] border border-gray-50 flex items-center justify-between shadow-sm">
                       <div>
                         <h4 className="font-serif text-xl italic text-gray-900">{area.area_name}</h4>
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">{area.area_type} • {area.zip_codes.length} ZIP Coverage</p>
                       </div>
                       <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                          {area.zip_codes.map(z => <span key={z} className="px-2 py-0.5 bg-[#EDE4DB] text-[#1A1A1A] text-[7px] font-black rounded-md border border-black/5">{z}</span>)}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {['STORES', 'RUNNERS'].includes(activeTab) && (
            <div className="bg-white rounded-[60px] border border-gray-100 p-10 text-center py-40 animate-fadeIn">
               <i className="fa-solid fa-server text-4xl text-gray-100 mb-6"></i>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Node Syncing: Awaiting local Houston data stream.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCommandCenter;