
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppRole, BeautyVendor, Product, CartItem, Order, OrderStatus, CustomItem, AppNotification, TeamMember, DriverOnboardingStatus, DriverEarnings, Incentive, DriverApplication } from './types';
import { VENDORS, PRODUCTS, COLORS, CITY_COORDS, ZIP_MAP, DRIVER_INCENTIVES } from './constants';
import TrackingMap from './components/TrackingMap';
import ChatInterface from './components/ChatInterface';
import AIImageStudio from './components/AIImageStudio';
import DriverOnboarding from './components/DriverOnboarding';
import AdminCommandCenter from './components/AdminCommandCenter';
import { GoogleGenAI } from "@google/genai";

// --- SHARED COMPONENTS ---

const Logo: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const dimensions = {
    xs: 'w-8 h-8',
    sm: 'w-14 h-14',
    md: 'w-28 h-28',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56'
  }[size];

  return (
    <div className={`relative ${dimensions} flex items-center justify-center animate-fadeIn`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <circle cx="50" cy="50" r="45" fill={`${COLORS.primary}10`} />
        <text 
          x="50" 
          y="65" 
          textAnchor="middle" 
          className="font-black" 
          style={{ fontSize: '60px', fill: COLORS.primary, fontFamily: 'serif' }}
        >
          B
        </text>
        <path 
          d="M75 45 C75 40, 65 40, 65 45 C65 50, 75 55, 75 55 C75 55, 85 50, 85 45 C85 40, 75 40, 75 45" 
          fill={COLORS.primary}
          className="animate-bounce"
          style={{ animationDuration: '2s' }}
        />
      </svg>
    </div>
  );
};

const StorefrontImage: React.FC<{ vendor: BeautyVendor; className?: string }> = ({ vendor, className = "" }) => {
  const [error, setError] = useState(false);

  if (error || !vendor.image) {
    return (
      <div className={`${className} bg-gradient-to-br from-[#D63384] to-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
          <i className={`fa-solid ${vendor.isMajorHub ? 'fa-store' : 'fa-shop'} text-white text-2xl`}></i>
        </div>
        
        <h3 className="text-white font-black text-xl uppercase tracking-tighter leading-tight drop-shadow-md">
          {vendor.name}
        </h3>
        <p className="text-pink-300 font-black text-[10px] uppercase tracking-widest mt-2 border border-pink-400/30 px-3 py-1 rounded-full bg-pink-900/20 backdrop-blur-sm">
          {vendor.category}
        </p>
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

  const icon = {
    order: 'fa-truck-fast',
    promo: 'fa-tag',
    message: 'fa-comment-dots'
  }[notification.type];

  const bgColor = {
    order: 'bg-gray-900',
    promo: 'bg-[#D63384]',
    message: 'bg-blue-600'
  }[notification.type];

  return (
    <div className={`${bgColor} text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-fadeIn border border-white/10 backdrop-blur-md mb-3 pointer-events-auto cursor-pointer`} onClick={() => onDismiss(notification.id)}>
      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="flex-1">
        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70">{notification.title}</h4>
        <p className="text-sm font-bold leading-tight">{notification.body}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }} className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center">
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
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
  const [customDescription, setCustomDescription] = useState('');
  const [allowSubstitutes, setAllowSubstitutes] = useState(true);
  const [storeTypeFilter, setStoreTypeFilter] = useState<'LOCAL' | 'MAJOR' | 'ALL'>('ALL');
  const [deliverySpeed, setDeliverySpeed] = useState<'STANDARD' | 'RUSH' | 'SCHEDULED'>('STANDARD');

  // Onboarding Logic
  const [onboardingStatus, setOnboardingStatus] = useState<DriverOnboardingStatus>('NOT_STARTED');
  const [driverApplications, setDriverApplications] = useState<DriverApplication[]>([]);

  // Product Configurator Modal
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<{color?: string, length?: string, type?: string}>({});

  const addNotification = (title: string, body: string, type: 'order' | 'promo' | 'message' = 'order') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, body, type, timestamp: Date.now() };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredVendors = useMemo(() => {
    let typed = VENDORS;
    if (storeTypeFilter === 'LOCAL') typed = VENDORS.filter(v => !v.isMajorHub);
    else if (storeTypeFilter === 'MAJOR') typed = VENDORS.filter(v => v.isMajorHub);

    return typed.filter(v => {
      const cityMatch = v.city.toLowerCase() === selectedCity.toLowerCase();
      const zipMatch = selectedZip === '' || v.zipCode === selectedZip;
      
      if (selectedZip !== '') {
        if (v.isMajorHub) return cityMatch;
        return zipMatch;
      }
      return cityMatch || selectedCity === 'Your Location';
    });
  }, [selectedCity, selectedZip, storeTypeFilter]);

  const trendingItems = useMemo(() => {
    const relevantProductIds = new Set<string>();
    filteredVendors.forEach(v => {
      v.topSellerIds?.forEach(id => relevantProductIds.add(id));
    });

    return PRODUCTS
      .filter(p => relevantProductIds.has(p.id))
      .sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0))
      .slice(0, 10);
  }, [filteredVendors]);

  const startConfig = (product: Product) => {
    if (product.options && (product.options.colors || product.options.lengths || product.options.types)) {
      setConfigProduct(product);
      setSelectedConfig({
        color: product.options.colors?.[0],
        length: product.options.lengths?.[0],
        type: product.options.types?.[0]
      });
    } else {
      addToCart(product, {});
    }
  };

  const addToCart = (product: Product, options: any) => {
    setCart(prev => {
      // Check if item with same options exists
      const existing = prev.find(item => 
        item.id === product.id && 
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );
      if (existing) return prev.map(item => 
        (item.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(options))
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      return [...prev, { ...product, quantity: 1, selectedOptions: options }];
    });
    addNotification("Added to Runn", `${product.name} added with your specs.`);
    setConfigProduct(null);
  };

  const handlePlaceOrder = () => {
    const minHold = 9.99;
    const estimatedMax = cart.reduce((acc, i) => acc + (i.priceRange?.max || 15), 0);
    const holdAmount = Math.max(minHold, estimatedMax + 10); // hold roughly max + fee

    const newOrder: Order = {
      id: `BR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cart],
      customRequest: customDescription ? { description: customDescription, allowSubstitutes } : undefined,
      holdFee: holdAmount,
      status: OrderStatus.HOLD_PAID,
      customerId: 'user1',
      customerName: 'Aaliyah J.',
      vendorId: selectedVendor?.id || 'v1',
      timestamp: Date.now(),
      address: selectedZip || selectedCity,
      allowSubstitutes: allowSubstitutes,
      deliverySpeed: deliverySpeed,
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
    addNotification("Auth Hold Secure", `Temporary hold of $${holdAmount.toFixed(2)} applied.`, "order");

    // Simulation Stages
    setTimeout(() => {
      setCurrentOrder(prev => prev ? { ...prev, status: OrderStatus.RUNNER_AT_STORE } : null);
    }, 4000);

    setTimeout(() => {
      setCurrentOrder(prev => prev ? { ...prev, status: OrderStatus.PURCHASING } : null);
    }, 8000);

    setTimeout(() => {
      const receiptTotal = newOrder.items.reduce((acc, i) => {
        const range = i.priceRange || { min: 10, max: 20 };
        return acc + (range.min + (Math.random() * (range.max - range.min)));
      }, 0);
      const serviceFee = 7.99;
      
      setCurrentOrder(prev => prev ? { 
        ...prev, 
        status: OrderStatus.PRICE_CONFIRMED,
        receiptAmount: receiptTotal,
        serviceFee: serviceFee,
        adjustedTotal: receiptTotal + serviceFee
      } : null);
      addNotification("Runn Finalized", `Receipt: $${receiptTotal.toFixed(2)} + Fee. Card adjusted.`, "order");
    }, 12000);

    setTimeout(() => {
      setCurrentOrder(prev => prev ? { ...prev, status: OrderStatus.IN_TRANSIT } : null);
    }, 15000);
  };

  const ProfileView = () => {
    return (
      <div className="animate-fadeIn space-y-10 pb-32">
        <h2 className="text-4xl font-black tracking-tighter uppercase">My Account</h2>
        
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl flex items-center gap-6">
          <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center text-pink-600 text-3xl">
            <i className="fa-solid fa-user-large"></i>
          </div>
          <div>
            <h3 className="font-black text-2xl text-gray-900 uppercase">{role === 'ADMIN' ? 'Admin Controller' : 'Aaliyah J.'}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{role === 'ADMIN' ? 'Platform Administrator' : 'Premium Member since 2024'}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {role === 'ADMIN' && (
            <button 
              onClick={() => setIsAdminPanelOpen(true)}
              className="flex items-center justify-between p-8 bg-gray-900 text-white rounded-[32px] hover:bg-black transition-all shadow-xl"
            >
              <div className="flex items-center gap-4">
                <i className="fa-solid fa-gauge-high text-pink-500"></i>
                <span className="font-black text-xs uppercase tracking-widest">Admin Command Center</span>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-500"></i>
            </button>
          )}

          <button className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-receipt text-gray-400"></i>
              <span className="font-black text-xs uppercase tracking-widest text-gray-600">Order History</span>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-300"></i>
          </button>
          
          <div className="h-px bg-gray-100 my-4"></div>

          <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-widest px-2">Creative Suite</h4>
          <button 
            onClick={() => setIsStudioOpen(true)}
            className="flex items-center justify-between p-6 bg-pink-50 rounded-[32px] hover:bg-pink-100 transition-all border border-pink-100"
          >
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-wand-magic-sparkles text-pink-600"></i>
              <span className="font-black text-xs uppercase tracking-widest text-pink-700">AI Product Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-pink-600 text-white px-2 py-1 rounded-full uppercase">Pro</span>
              <i className="fa-solid fa-chevron-right text-pink-300"></i>
            </div>
          </button>

          <button onClick={() => { setIsAuthenticated(false); setOnboardingStatus('NOT_STARTED'); }} className="flex items-center justify-center p-6 text-red-500 font-black uppercase text-xs tracking-widest mt-8">
            Log Out
          </button>
        </div>
      </div>
    )
  };

  const handleOnboardingComplete = (data: DriverApplication) => {
    const newApp = { ...data, status: 'PENDING_APPROVAL' as DriverOnboardingStatus };
    setDriverApplications(prev => [...prev, newApp]);
    setOnboardingStatus('PENDING_APPROVAL');
    setIsOnboardingOpen(false);
    addNotification("Application Received", "Verification in progress. 24-48hr turnaround.", "promo");
  };

  const handleApproveDriver = (email: string) => {
    setDriverApplications(prev => prev.map(app => 
      app.email === email ? { ...app, status: 'APPROVED' as DriverOnboardingStatus } : app
    ));
    addNotification("Runner Approved", `Application for ${email} has been cleared.`, "order");
  };

  const handleRejectDriver = (email: string) => {
    setDriverApplications(prev => prev.filter(app => app.email !== email));
    addNotification("Application Denied", `Security check failed for ${email}.`, "message");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      <div className="fixed top-8 left-8 right-8 z-[500] pointer-events-none flex flex-col items-center">
        <div className="w-full max-w-md">
          {notifications.map(n => (
            <NotificationToast key={n.id} notification={n} onDismiss={dismissNotification} />
          ))}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fadeIn px-8">
          <Logo size="xl" />
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4 mt-8">Beauty Runn</h1>
          <p className="font-black text-3xl tracking-tighter uppercase mb-12 max-w-xs text-center leading-none text-gray-900">Glow On. We’ll Handle It</p>
          <div className="w-full max-sm space-y-5">
            <button onClick={() => { setRole('CUSTOMER'); setIsAuthenticated(true); setView('HOME'); }} className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xl shadow-2xl hover:bg-[#D63384] transition-all transform hover:-translate-y-1">Request a Runn</button>
            <button onClick={() => { setRole('DRIVER'); setIsAuthenticated(true); setView('DRIVER_PORTAL'); }} className="w-full bg-white text-gray-900 border-2 border-gray-900 py-6 rounded-full font-black text-xl transition-all">Become a Runner</button>
          </div>
          <button 
            onClick={() => { setRole('ADMIN'); setIsAuthenticated(true); setView('PROFILE'); }} 
            className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Admin Sign in
          </button>
        </div>
      ) : (
        <>
          <nav className="px-8 py-6 flex items-center justify-between border-b border-gray-50 safe-top bg-white/90 backdrop-blur-xl sticky top-0 z-[100]">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('HOME')}>
              <span className="font-black text-2xl tracking-tighter uppercase text-gray-900 group-hover:text-[#D63384] transition-colors">Beauty Runn</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsLocationModalOpen(true)} className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest border border-gray-100">
                <i className="fa-solid fa-location-arrow text-[#D63384]"></i>
                {selectedZip || selectedCity}
              </button>
              <button onClick={() => setView('PROFILE')} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                <i className="fa-solid fa-bars-staggered text-sm"></i>
              </button>
            </div>
          </nav>

          <main className="flex-1 px-8 py-10 overflow-y-auto no-scrollbar mx-auto w-full max-w-5xl">
            {view === 'HOME' ? (
              <div className="animate-fadeIn space-y-12 pb-32">
                {/* User dashboard home content would go here */}
                <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white text-3xl font-black tracking-tighter uppercase">Marketplace</h2>
                    <i className="fa-solid fa-store text-pink-600 text-3xl opacity-20"></i>
                  </div>
                  <div className="flex bg-white/10 p-2 rounded-[28px] border border-white/5">
                    <button onClick={() => setStoreTypeFilter('ALL')} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${storeTypeFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400'}`}>All</button>
                    <button onClick={() => setStoreTypeFilter('LOCAL')} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${storeTypeFilter === 'LOCAL' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400'}`}>Local</button>
                    <button onClick={() => setStoreTypeFilter('MAJOR')} className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${storeTypeFilter === 'MAJOR' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400'}`}>Major Brands</button>
                  </div>
                </div>
                {/* Additional home components... */}
              </div>
            ) : view === 'PROFILE' ? (
              <ProfileView />
            ) : null}
          </main>

          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-50 px-12 py-6 flex justify-around items-center safe-bottom z-[100] shadow-luxury">
            <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-2 transition-all ${view === 'HOME' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-magnifying-glass text-xl"></i><span className="text-[9px] font-black uppercase tracking-widest">Explore</span></button>
            <button onClick={() => setView('TRACKING')} className={`flex flex-col items-center gap-2 transition-all ${view === 'TRACKING' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-map-location-dot text-xl"></i><span className="text-[9px] font-black uppercase tracking-widest">Activity</span></button>
            <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-2 transition-all ${view === 'PROFILE' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-user-circle text-xl"></i><span className="text-[9px] font-black uppercase tracking-widest">Account</span></button>
          </div>
        </>
      )}

      {isStudioOpen && (
        <AIImageStudio onClose={() => setIsStudioOpen(false)} />
      )}

      {isAdminPanelOpen && (
        <AdminCommandCenter 
          onClose={() => setIsAdminPanelOpen(false)} 
          orders={allOrders}
          applications={driverApplications}
          onApproveApplication={handleApproveDriver}
          onRejectApplication={handleRejectDriver}
        />
      )}

      {isOnboardingOpen && (
        <DriverOnboarding 
          onComplete={handleOnboardingComplete} 
          onCancel={() => setIsOnboardingOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
