
import React, { useState, useMemo, useEffect } from 'react';
import { AppRole, BeautyVendor, Product, CartItem, Order, OrderStatus, AppNotification, DriverOnboardingStatus, DriverApplication } from './types';
import { VENDORS, PRODUCTS, COLORS, ZIP_MAP } from './constants';
import TrackingMap from './components/TrackingMap';
import ChatInterface from './components/ChatInterface';
import AIImageStudio from './components/AIImageStudio';
import DriverOnboarding from './components/DriverOnboarding';
import AdminCommandCenter from './components/AdminCommandCenter';

// --- SHARED COMPONENTS ---

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#EDE4DB] flex flex-col items-center justify-center animate-fadeIn">
      <div className="text-center space-y-8 animate-splash-logo">
        <div className="relative inline-block">
          <h1 className="font-serif text-8xl md:text-9xl text-[#1A1A1A] tracking-tighter italic">B</h1>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#C48B8B] animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-[#1A1A1A] font-black text-2xl uppercase tracking-[0.3em]">Beauty Runn</h2>
          <p className="text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest opacity-60">The Concierge of Radiance</p>
        </div>
      </div>
    </div>
  );
};

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }[size];

  return (
    <div className={`${dimensions} flex items-center justify-center`}>
      <h1 className="font-serif text-4xl text-[#1A1A1A] tracking-tighter italic border-b-2 border-[#C48B8B]">B</h1>
    </div>
  );
};

const StorefrontImage: React.FC<{ vendor: BeautyVendor; className?: string }> = ({ vendor, className = "" }) => {
  const [error, setError] = useState(false);

  if (error || !vendor.image) {
    return (
      <div className={`${className} bg-[#F9F6F3] flex flex-col items-center justify-center p-6 text-center border border-[#EDE4DB]`}>
        <div className="w-12 h-12 bg-[#EDE4DB] rounded-full flex items-center justify-center mb-3">
          <i className="fa-solid fa-gem text-[#C48B8B]"></i>
        </div>
        <h3 className="text-[#1A1A1A] font-black text-sm uppercase tracking-tighter">
          {vendor.name}
        </h3>
      </div>
    );
  }

  return (
    <img 
      src={vendor.image} 
      className={`${className} object-cover`} 
      alt={vendor.name} 
      onError={() => setError(true)}
    />
  );
};

const NotificationToast: React.FC<{ notification: AppNotification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <div className="bg-[#1A1A1A] text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-fadeIn border border-[#C48B8B]/20 mb-3 cursor-pointer" onClick={() => onDismiss(notification.id)}>
      <div className="w-10 h-10 rounded-full bg-[#C48B8B]/10 flex items-center justify-center text-[#C48B8B]">
        <i className="fa-solid fa-sparkles"></i>
      </div>
      <div className="flex-1">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B] mb-0.5">{notification.title}</h4>
        <p className="text-sm font-medium">{notification.body}</p>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [role, setRole] = useState<AppRole>('CUSTOMER');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'HOME' | 'VENDOR' | 'CHECKOUT' | 'TRACKING' | 'PROFILE' | 'DRIVER_PORTAL'>('HOME');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  const [selectedCity, setSelectedCity] = useState<string>('Houston');
  const [selectedZip, setSelectedZip] = useState<string>('');
  const [zipInputValue, setZipInputValue] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<BeautyVendor | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [storeTypeFilter, setStoreTypeFilter] = useState<'LOCAL' | 'MAJOR' | 'ALL'>('ALL');

  const [driverApplications, setDriverApplications] = useState<DriverApplication[]>([]);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<{color?: string, length?: string, type?: string}>({});

  const addNotification = (title: string, body: string) => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, body, type: 'order', timestamp: Date.now() };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const filteredVendors = useMemo(() => {
    let typed = VENDORS;
    if (storeTypeFilter === 'LOCAL') typed = VENDORS.filter(v => !v.isMajorHub);
    else if (storeTypeFilter === 'MAJOR') typed = VENDORS.filter(v => v.isMajorHub);

    return typed.filter(v => {
      const cityMatch = v.city.toLowerCase() === selectedCity.toLowerCase();
      const zipMatch = selectedZip === '' || v.zipCode === selectedZip;
      return selectedZip !== '' ? (v.isMajorHub ? cityMatch : zipMatch) : (cityMatch || selectedCity === 'Your Location');
    });
  }, [selectedCity, selectedZip, storeTypeFilter]);

  const trendingItems = useMemo(() => {
    return PRODUCTS.sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0)).slice(0, 10);
  }, []);

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `BR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cart],
      holdFee: 45.00,
      status: OrderStatus.HOLD_PAID,
      customerId: 'user1',
      vendorId: selectedVendor?.id || 'v1',
      timestamp: Date.now(),
      address: selectedZip || selectedCity,
      allowSubstitutes: true,
      driverInfo: {
        name: "Marcus K.",
        image: "https://i.pravatar.cc/150?u=marcus",
        carModel: "Honda Civic",
        carColor: "Silver",
        licensePlate: "TX-BEAUTY1",
        rating: 4.9
      }
    };
    setCurrentOrder(newOrder);
    setAllOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setView('TRACKING');
    addNotification("Runn Initiated", "Concierge is en-route to hub.");
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  return (
    <div className="min-h-screen bg-[#EDE4DB] flex flex-col font-inter transition-all duration-700">
      <div className="fixed top-8 left-8 right-8 z-[500] pointer-events-none flex flex-col items-center">
        <div className="w-full max-w-md">
          {notifications.map(n => <NotificationToast key={n.id} notification={n} onDismiss={id => setNotifications(p => p.filter(x => x.id !== id))} />)}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 animate-fadeIn">
          <Logo size="xl" />
          <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase mt-12 mb-2 italic font-serif">Beauty Runn</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C48B8B] mb-12">The Ultimate Glow Delivery</p>
          <div className="w-full max-w-xs space-y-4">
            <button onClick={() => { setRole('CUSTOMER'); setIsAuthenticated(true); }} className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl rose-glow">Request a Runn</button>
            <button onClick={() => { setRole('DRIVER'); setIsAuthenticated(true); }} className="w-full bg-transparent text-[#1A1A1A] border border-[#1A1A1A] py-6 rounded-2xl font-black text-sm uppercase tracking-widest">Become a Runner</button>
          </div>
          <button onClick={() => { setRole('ADMIN'); setIsAuthenticated(true); setView('PROFILE'); }} className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/40 hover:text-[#C48B8B]">Admin Portal</button>
        </div>
      ) : (
        <>
          <nav className="px-8 py-6 flex items-center justify-between sticky top-0 z-[100] bg-[#EDE4DB]/95 backdrop-blur-xl border-b border-[#1A1A1A]/5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
              <h2 className="font-serif text-3xl italic text-[#1A1A1A]">B</h2>
              <span className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Essentials</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsLocationModalOpen(true)} className="bg-[#F9F6F3] px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm hover:border-[#C48B8B]">
                <i className="fa-solid fa-location-dot text-[#C48B8B] mr-2"></i>
                {selectedZip || selectedCity}
              </button>
            </div>
          </nav>

          <main className="flex-1 px-8 py-10 overflow-y-auto no-scrollbar mx-auto w-full max-w-5xl">
            {view === 'HOME' ? (
              <div className="animate-fadeIn space-y-16 pb-32">
                {/* BEAUTY ESSENTIALS - HERO */}
                <header className="space-y-4 text-center py-10">
                  <h2 className="font-serif text-6xl md:text-7xl italic text-[#1A1A1A] shimmer-text">Beauty Essentials</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1A1A1A]/50">Curated specifically for you</p>
                </header>

                {/* PRIMARY ACTION TILES */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Category', icon: 'fa-wand-sparkles' },
                    { label: 'Near Me', icon: 'fa-map-pin' },
                    { label: 'Fastest', icon: 'fa-bolt-lightning' }
                  ].map((tile, i) => (
                    <button key={i} className="aspect-square bg-[#F9F6F3] rounded-[32px] flex flex-col items-center justify-center gap-3 border border-[#1A1A1A]/5 shadow-sm group hover:border-[#C48B8B] transition-all duration-500">
                      <i className={`fa-solid ${tile.icon} text-lg text-[#1A1A1A] group-hover:text-[#C48B8B] group-hover:scale-110 transition-transform`}></i>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/40">{tile.label}</span>
                    </button>
                  ))}
                </div>

                {/* MARKET GUIDE */}
                <div className="bg-[#1A1A1A] p-10 rounded-[50px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C48B8B] opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2">
                      <h3 className="text-white font-serif text-4xl italic">Runnways Savings</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B]">Local hub pricing vs national retailers</p>
                    </div>
                    <button onClick={() => setView('HOME')} className="bg-[#EDE4DB] text-[#1A1A1A] px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-xl">View Houston Guide</button>
                  </div>
                </div>

                {/* TRENDING SECTION */}
                <section className="space-y-8">
                  <div className="flex justify-between items-end border-b border-[#1A1A1A]/5 pb-4">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Trending Right Now</h3>
                    <div className="w-2 h-2 rounded-full bg-[#C48B8B] animate-pulse"></div>
                  </div>
                  <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6">
                    {trendingItems.map(p => (
                      <div key={p.id} className="min-w-[260px] bg-white p-6 rounded-[40px] border border-[#1A1A1A]/5 shadow-sm group hover:shadow-xl transition-all duration-500">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-[#F9F6F3] mb-5">
                          <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-tight text-[#1A1A1A] mb-1 line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-[#C48B8B] font-black mb-4">EST. ${p.priceRange?.min.toFixed(2)}+</p>
                        <button onClick={() => setConfigProduct(p)} className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest group-hover:bg-[#C48B8B] transition-colors">Select Details</button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : view === 'VENDOR' ? (
              <div className="animate-fadeIn pb-32">
                <button onClick={() => setView('HOME')} className="mb-8 text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40 flex items-center gap-2">
                  <i className="fa-solid fa-arrow-left"></i> Back to Essentials
                </button>
                <div className="h-80 rounded-[50px] overflow-hidden shadow-2xl relative mb-12">
                   <StorefrontImage vendor={selectedVendor!} className="w-full h-full" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent p-12 flex flex-col justify-end">
                      <h2 className="text-white font-serif text-6xl italic leading-none">{selectedVendor?.name}</h2>
                      <p className="text-[#C48B8B] text-[10px] font-black uppercase tracking-[0.3em] mt-4">{selectedVendor?.category} • Premium Collection</p>
                   </div>
                </div>
              </div>
            ) : view === 'TRACKING' ? (
              <div className="animate-fadeIn space-y-10 pb-32">
                <header className="space-y-2">
                   <h2 className="font-serif text-5xl italic text-[#1A1A1A]">Your Runn</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B]">Status: {currentOrder?.status}</p>
                </header>
                <div className="h-64 rounded-[40px] overflow-hidden shadow-2xl border border-[#EDE4DB]">
                  <TrackingMap status={currentOrder?.status || ''} />
                </div>
              </div>
            ) : null}
          </main>

          <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#1A1A1A] rounded-[40px] px-10 py-6 flex justify-between items-center z-[200] shadow-2xl border border-white/5 backdrop-blur-md">
            <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-1.5 ${view === 'HOME' ? 'text-[#C48B8B]' : 'text-white/40'}`}>
              <i className="fa-solid fa-gem text-xl"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">Essentials</span>
            </button>
            <button onClick={() => setView('TRACKING')} className={`flex flex-col items-center gap-1.5 ${view === 'TRACKING' ? 'text-[#C48B8B]' : 'text-white/40'}`}>
              <i className="fa-solid fa-satellite-dish text-xl"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">Live</span>
            </button>
            <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-1.5 ${view === 'PROFILE' ? 'text-[#C48B8B]' : 'text-white/40'}`}>
              <i className="fa-solid fa-crown text-xl"></i>
              <span className="text-[8px] font-black uppercase tracking-widest">Account</span>
            </button>
          </nav>
        </>
      )}

      {/* CONFIGURATOR MODAL */}
      {configProduct && (
        <div className="fixed inset-0 z-[1000] bg-[#1A1A1A]/80 backdrop-blur-xl flex items-end justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-[#F9F6F3] rounded-[50px] p-10 space-y-10 animate-slideUp">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                <img src={configProduct.image} className="w-24 h-24 rounded-[32px] object-cover shadow-xl" alt="" />
                <div>
                   <h2 className="font-serif text-3xl italic text-[#1A1A1A]">{configProduct.name}</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-1">Refined for you</p>
                </div>
              </div>
              <button onClick={() => setConfigProduct(null)} className="w-12 h-12 bg-[#EDE4DB] rounded-2xl flex items-center justify-center text-[#1A1A1A]">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <button onClick={() => { setCart(p => [...p, { ...configProduct, quantity: 1 }]); setConfigProduct(null); addNotification("Added to Runn", "Selection secured in catalog."); }} className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#C48B8B] transition-colors">Confirm Choice</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
