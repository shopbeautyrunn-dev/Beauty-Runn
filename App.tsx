import React, { useState, useMemo, useEffect } from 'react';
import { BeautyVendor, Product, CartItem, Order, OrderStatus, AppNotification, OrderFees, AppRole, DriverApplication, DeliverySpeed, Area } from './types';
import { VENDORS, PRODUCTS, AREAS } from './constants';
import TrackingMap from './components/TrackingMap';
import DriverOnboarding from './components/DriverOnboarding';
import AdminCommandCenter from './components/AdminCommandCenter';
import { getStoresByZip, findAreaByZip } from './services/locationService';
import { calculateOrderFees } from './services/pricingService';

const NotificationToast: React.FC<{ notification: AppNotification, onDismiss: () => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm bg-[#1A1A1A] text-white p-6 rounded-[32px] shadow-2xl border border-white/5 animate-slideUp flex items-center gap-6">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${notification.type === 'success' ? 'bg-[#10B981]' : 'bg-[#C48B8B]'}`}>
        <i className={`fa-solid ${notification.type === 'success' ? 'fa-circle-check' : 'fa-bell'}`}></i>
      </div>
      <div className="flex-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B]">{notification.title}</h4>
        <p className="text-xs font-medium mt-1 text-white/70">{notification.body}</p>
      </div>
      <button onClick={onDismiss} className="text-white/30 hover:text-white transition-colors"><i className="fa-solid fa-xmark"></i></button>
    </div>
  );
};

const ZipSearchModal: React.FC<{ onSearch: (zip: string) => void, onClose: () => void }> = ({ onSearch, onClose }) => {
  const [zip, setZip] = useState('');
  return (
    <div className="fixed inset-0 z-[500] bg-[#1A1A1A]/90 backdrop-blur-xl flex items-center justify-center p-8 animate-fadeIn">
      <div className="w-full max-md bg-[#EDE4DB] rounded-[60px] p-12 text-center space-y-10 animate-slideUp shadow-2xl relative border border-[#C48B8B]/20">
        <button className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors" onClick={onClose}>
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="space-y-4">
          <h2 className="font-serif text-5xl italic text-[#1A1A1A]">Find a Store</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">Find local beauty shops delivering to your door</p>
        </div>
        <input 
          type="text" 
          maxLength={5} 
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter Zip Code" 
          className="w-full bg-white rounded-3xl p-8 text-center text-2xl font-black outline-none border-2 border-transparent focus:border-[#C48B8B] transition-all"
        />
        <button onClick={() => onSearch(zip)} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest rose-glow active:scale-95 transition-all shadow-xl">Browse Shops</button>
      </div>
    </div>
  );
};

const VendorCard: React.FC<{ vendor: BeautyVendor, onSelect: () => void, isExactZip: boolean, isSameArea: boolean }> = ({ vendor, onSelect, isExactZip, isSameArea }) => {
  return (
    <div onClick={onSelect} className={`bg-white p-5 rounded-[40px] border transition-all cursor-pointer group animate-slideUp flex gap-6 items-center ${isExactZip ? 'border-[#C48B8B] shadow-xl ring-1 ring-[#C48B8B]/10' : isSameArea ? 'border-black/5 shadow-md' : 'border-[#1A1A1A]/5 shadow-luxury hover:border-[#C48B8B]'}`}>
      <div className="relative w-36 h-36 shrink-0 rounded-[32px] overflow-hidden border border-black/5 bg-gray-50">
        <img src={vendor.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={vendor.name} />
        {isExactZip && (
          <div className="absolute top-2 left-2 bg-[#C48B8B] text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-md badge-shimmer">In Your Zip</div>
        )}
        {!isExactZip && isSameArea && (
          <div className="absolute top-2 left-2 bg-[#1A1A1A] text-white px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-md">Nearby Shop</div>
        )}
      </div>
      <div className="flex-1 space-y-2 pr-4">
        <div className="flex justify-between items-start">
          <h3 className="font-serif text-2xl italic text-[#1A1A1A] leading-tight group-hover:text-[#C48B8B] transition-colors">{vendor.name}</h3>
          <div className="flex flex-col items-end">
             <div className="flex items-center bg-[#EDE4DB] px-3 py-1 rounded-full border border-black/5 shadow-sm shrink-0">
                <span className="text-[10px] font-black text-[#1A1A1A] tracking-tighter">{vendor.distance?.toFixed(1)}</span>
                <span className="text-[6px] font-black text-[#C48B8B] uppercase tracking-widest ml-1">mi</span>
             </div>
             <span className="text-[7px] font-bold text-gray-400 uppercase mt-1">Local Delivery</span>
          </div>
        </div>
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest line-clamp-1">{vendor.address}, {vendor.zipCode}</p>
        <div className="flex items-center gap-3 pt-1">
           <div className="flex items-center gap-1 text-[#C48B8B]">
             <i className="fa-solid fa-star text-[8px]"></i>
             <span className="text-[10px] font-black text-[#1A1A1A]">{vendor.rating}</span>
           </div>
           <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{vendor.user_ratings_total || 0} Reviews</span>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {vendor.tags.map(tag => (
            <span key={tag} className="text-[6px] font-black uppercase bg-[#F9F6F3] text-gray-400 px-2 py-0.5 rounded-md border border-gray-100">
              {tag.replace('_', ' ')}
            </span>
          ))}
          <span className="text-[6px] font-black uppercase bg-green-50 text-green-600 px-2 py-0.5 rounded-md border border-green-100">
            Arrives in {vendor.deliveryTime}
          </span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'HOME' | 'STOREFRONT' | 'CHECKOUT' | 'TRACKING' | 'SEARCH_RESULTS' | 'RUNNER_DASHBOARD' | 'ADMIN'>('HOME');
  const [selectedZip, setSelectedZip] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [detectedArea, setDetectedArea] = useState<Area | null>(null);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isDriverOnboardingOpen, setIsDriverOnboardingOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<BeautyVendor | null>(null);

  const searchResults = useMemo(() => {
    if (!selectedZip) return [];
    return getStoresByZip(selectedZip, searchRadius);
  }, [selectedZip, searchRadius]);

  const handleZipSearch = async (zip: string) => {
    if (zip.length !== 5) return;
    setSelectedZip(zip);
    setIsZipModalOpen(false);
    setView('SEARCH_RESULTS');
    const area = findAreaByZip(zip);
    setDetectedArea(area);
  };

  const handleDriverOnboardingComplete = (data: DriverApplication) => {
    setIsDriverOnboardingOpen(false);
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      title: "Application Received",
      body: "Our team will review your details soon. Welcome to Beauty Runn!",
      type: 'success',
      timestamp: Date.now()
    };
    setNotifications([newNotif, ...notifications]);
  };

  const resetToHome = () => {
    setView('HOME');
    setDetectedArea(null);
    setSelectedZip('');
  };

  if (showSplash) return (
    <div className="fixed inset-0 z-[1000] bg-[#EDE4DB] flex flex-col items-center justify-center animate-fadeIn" onClick={() => setShowSplash(false)}>
      <div className="text-center space-y-8 animate-splash-logo flex flex-col items-center">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-9xl text-[#1A1A1A] tracking-tighter italic border-b-2 border-[#C48B8B]">B</h1>
          <i className="fa-solid fa-heart text-[#C48B8B] text-5xl animate-floating-heart mt-8"></i>
        </div>
        <h2 className="text-[#1A1A1A] font-black text-2xl uppercase tracking-[0.3em]">Beauty Runn</h2>
        <p className="text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest opacity-60 text-center">Your neighborhood Beauty Supply Network</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EDE4DB] flex flex-col font-inter safe-top pb-32">
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} onDismiss={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} />
      ))}
      <nav className="px-8 py-6 flex items-center justify-between sticky top-0 z-[100] bg-[#EDE4DB]/95 backdrop-blur-xl border-b border-[#1A1A1A]/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetToHome}>
          <h2 className="font-serif text-3xl italic text-[#1A1A1A]">B</h2>
          <span className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Runn</span>
        </div>
        {selectedZip && (
          <button onClick={() => setIsZipModalOpen(true)} className="bg-white/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm">
            <i className="fa-solid fa-location-dot mr-2 text-[#C48B8B]"></i>
            {selectedZip}
          </button>
        )}
      </nav>

      <main className="px-8 py-10 max-w-5xl mx-auto w-full">
        {view === 'HOME' && (
          <div className="animate-fadeIn space-y-12">
            <header className="text-center py-10 space-y-4">
              <h2 className="font-serif text-6xl italic text-[#1A1A1A] shimmer-text leading-tight uppercase">Local Shops.<br/>Delivered Fast.</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C48B8B]">Your neighborhood Beauty Supply Network</p>
            </header>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <button 
                  onClick={() => setIsZipModalOpen(true)}
                  className="bg-white p-12 rounded-[50px] shadow-luxury flex flex-col items-center justify-center gap-6 border border-[#1A1A1A]/5 transition-all group hover:border-[#C48B8B] hover:shadow-2xl relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B8B]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#C48B8B]/10 transition-all"></div>
                 <div className="w-20 h-20 bg-[#C48B8B] text-white rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-[#C48B8B]/20">
                    <i className="fa-solid fa-cart-shopping"></i>
                 </div>
                 <div className="text-center space-y-2">
                    <h3 className="font-serif text-3xl italic">Request a Runner</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">Sourcing beauty products in your area</p>
                 </div>
               </button>

               <button 
                  onClick={() => setIsDriverOnboardingOpen(true)}
                  className="bg-[#1A1A1A] p-12 rounded-[50px] shadow-luxury flex flex-col items-center justify-center gap-6 border border-white/5 transition-all group hover:bg-black hover:shadow-2xl relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B8B]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#C48B8B]/20 transition-all"></div>
                 <div className="w-20 h-20 bg-white text-[#1A1A1A] rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-black/20">
                    <i className="fa-solid fa-car-side"></i>
                 </div>
                 <div className="text-center space-y-2">
                    <h3 className="font-serif text-3xl italic text-white">Become a Runner</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Join the elite Houston delivery network</p>
                 </div>
               </button>
            </div>

            <div className="space-y-8">
               <h4 className="font-serif text-3xl italic text-[#1A1A1A]">Shop by Neighborhood</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AREAS.map(area => (
                    <button key={area.id} onClick={() => handleZipSearch(area.zip_codes[0])} className="group p-8 bg-white rounded-[40px] border border-black/5 shadow-sm text-left hover:border-[#C48B8B] transition-all active:scale-95 flex flex-col justify-between h-48">
                      <div className="space-y-2">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Neighborhood Favorite</span>
                        <h5 className="font-serif text-2xl italic text-[#1A1A1A] group-hover:text-[#C48B8B] transition-colors">{area.area_name}</h5>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{area.zip_codes.length} Shopping Zones</span>
                        <i className="fa-solid fa-arrow-right-long text-gray-200 group-hover:text-[#C48B8B] transition-colors"></i>
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'SEARCH_RESULTS' && (
          <div className="animate-fadeIn space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C48B8B] mb-2">{detectedArea?.area_name || "Local Beauty Stores"}</h1>
                <h2 className="font-serif text-5xl italic text-[#1A1A1A] leading-none">Stores Near You</h2>
                <div className="flex items-center gap-3 mt-4">
                   <span className="bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{selectedZip}</span>
                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Shops Delivering to Your Area</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/50 px-5 py-3 rounded-2xl border border-black/5">
                <span className="text-[8px] font-black uppercase text-gray-400">Search Radius:</span>
                <select 
                  value={searchRadius} 
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="bg-transparent border-none text-[9px] font-black uppercase text-[#1A1A1A] outline-none cursor-pointer"
                >
                  <option value={3}>3 Miles (Closest)</option>
                  <option value={5}>5 Miles (Nearby)</option>
                  <option value={10}>10 Miles (City Wide)</option>
                </select>
              </div>
            </header>

            <div className="space-y-6 max-w-4xl mx-auto">
              {searchResults.length > 0 ? (
                searchResults.map(v => (
                  <VendorCard 
                    key={v.id} 
                    vendor={v} 
                    onSelect={() => { setSelectedVendor(v); setView('STOREFRONT'); }} 
                    isExactZip={v.zipCode === selectedZip}
                    isSameArea={v.area_id === detectedArea?.id}
                  />
                ))
              ) : (
                <div className="py-32 text-center space-y-6 bg-white rounded-[60px] border border-dashed border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <i className="fa-solid fa-store-slash text-4xl text-gray-200"></i>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No local shops found in this area yet</p>
                    <button onClick={() => setView('HOME')} className="text-[9px] font-black text-[#C48B8B] uppercase underline">Back to Neighborhoods</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'STOREFRONT' && (
          <div className="animate-fadeIn space-y-10">
            <button onClick={() => setView('SEARCH_RESULTS')} className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-sm active:scale-90 transition-all border border-gray-100"><i className="fa-solid fa-arrow-left"></i></button>
            <div className="flex flex-col md:flex-row gap-12">
               <div className="w-full md:w-1/3 aspect-[4/5] rounded-[60px] overflow-hidden border border-black/5 shadow-luxury relative">
                 <img src={selectedVendor?.image} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/40 to-transparent pointer-events-none"></div>
               </div>
               <div className="flex-1 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#C48B8B] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Local Beauty Shop</span>
                      {selectedVendor?.pricingTier === 'PREMIUM' && <i className="fa-solid fa-crown text-[#C48B8B] text-xs"></i>}
                    </div>
                    <h3 className="font-serif text-6xl italic text-[#1A1A1A] leading-tight">{selectedVendor?.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 leading-relaxed max-w-sm">{selectedVendor?.address}, {selectedVendor?.city} {selectedVendor?.zipCode}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white px-6 py-6 rounded-[40px] border border-black/5 flex flex-col justify-center shadow-sm">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Distance</span>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-black text-[#1A1A1A] leading-none">{selectedVendor?.distance?.toFixed(1)}</span>
                          <span className="text-[9px] font-black text-[#C48B8B] uppercase tracking-widest mb-1">mi</span>
                        </div>
                     </div>
                     <div className="bg-white px-6 py-6 rounded-[40px] border border-black/5 flex flex-col justify-center shadow-sm">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Rating</span>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-black text-[#1A1A1A] leading-none">{selectedVendor?.rating}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">avg</span>
                        </div>
                     </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed uppercase tracking-wider bg-white/40 p-6 rounded-3xl border border-black/5 italic">"{selectedVendor?.description}"</p>
               </div>
            </div>
            
            <div className="space-y-6 pt-12 border-t border-black/5">
               <div className="flex items-center justify-between">
                 <h4 className="font-serif text-3xl italic text-[#1A1A1A]">Shop by Category</h4>
                 <div className="flex gap-2">
                   {selectedVendor?.categories.slice(0, 3).map(cat => (
                     <span key={cat} className="text-[7px] font-black uppercase text-gray-400 border border-gray-100 px-3 py-1 rounded-full">{cat}</span>
                   ))}
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PRODUCTS.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[50px] flex items-center gap-8 border border-black/5 shadow-sm hover:border-[#C48B8B] transition-all cursor-pointer group">
                      <div className="w-28 h-28 shrink-0 rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt="" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-[#C48B8B] uppercase tracking-widest mb-1">{p.brand}</span>
                          <h4 className="font-black text-base uppercase text-[#1A1A1A] leading-tight line-clamp-2">{p.name}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                           <p className="text-xl font-black text-[#1A1A1A] tracking-tighter">${p.priceRange.min}</p>
                           <button className="w-12 h-12 bg-[#EDE4DB] rounded-2xl flex items-center justify-center text-[#C48B8B] shadow-sm group-hover:bg-[#C48B8B] group-hover:text-white transition-all">
                             <i className="fa-solid fa-plus text-xs"></i>
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {isZipModalOpen && <ZipSearchModal onSearch={handleZipSearch} onClose={() => setIsZipModalOpen(false)} />}
      
      {isDriverOnboardingOpen && (
        <DriverOnboarding 
          onComplete={handleDriverOnboardingComplete} 
          onCancel={() => setIsDriverOnboardingOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;