
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppRole, BeautyVendor, Product, CartItem, Order, OrderStatus, CustomItem, AppNotification, TeamMember, DriverOnboardingStatus, DriverEarnings, Incentive } from './types';
import { VENDORS, PRODUCTS, COLORS, CITY_COORDS, ZIP_MAP, DRIVER_INCENTIVES } from './constants';
import TrackingMap from './components/TrackingMap';
import ChatInterface from './components/ChatInterface';
import AIImageStudio from './components/AIImageStudio';
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

  const MarketPriceGuide = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <div>
            <h3 className="text-xl font-black tracking-tighter uppercase text-gray-900">Houston Market Guide</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Local vs Major Retailer Comparison</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-2">
          {PRODUCTS.filter(p => p.marketComparison).map((p) => (
            <div key={p.id} className="min-w-[320px] bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="flex gap-4 mb-4">
                <img src={p.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={p.name} />
                <div className="flex-1">
                  <h4 className="font-black text-xs text-gray-900 uppercase tracking-tight">{p.name}</h4>
                  <p className="text-[9px] text-pink-600 font-black uppercase mt-1">Typical Houston Store Range:</p>
                  <p className="text-sm font-black text-gray-900">${p.priceRange?.min.toFixed(2)} - ${p.priceRange?.max.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Sally</p>
                  <p className="text-[11px] font-black text-gray-900">${p.marketComparison?.sally?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="text-center border-x border-gray-50 px-2">
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Ulta</p>
                  <p className="text-[11px] font-black text-gray-900">${p.marketComparison?.ulta?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Amazon</p>
                  <p className="text-[11px] font-black text-gray-900">${p.marketComparison?.amazon?.toFixed(2) || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => startConfig(p)} className="w-full mt-6 py-4 bg-gray-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-colors">
                Runn This Price
              </button>
            </div>
          ))}
        </div>
      </div>
    );
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
            <h3 className="font-black text-2xl text-gray-900 uppercase">Aaliyah J.</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Member since 2024</p>
          </div>
        </div>

        <div className="grid gap-4">
          <button className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-receipt text-gray-400"></i>
              <span className="font-black text-xs uppercase tracking-widest text-gray-600">Order History</span>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-300"></i>
          </button>
          <button className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-all">
            <div className="flex items-center gap-4">
              <i className="fa-solid fa-credit-card text-gray-400"></i>
              <span className="font-black text-xs uppercase tracking-widest text-gray-600">Payment Methods</span>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-300"></i>
          </button>
          
          <div className="h-px bg-gray-100 my-4"></div>

          <h4 className="text-[10px] font-black text-pink-600 uppercase tracking-widest px-2">Owner Tools</h4>
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

          <button onClick={() => setIsAuthenticated(false)} className="flex items-center justify-center p-6 text-red-500 font-black uppercase text-xs tracking-widest mt-8">
            Log Out
          </button>
        </div>
      </div>
    )
  };

  const VendorView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const vendorProducts = PRODUCTS; 
    
    const filteredProducts = vendorProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topSellers = useMemo(() => {
      if (!selectedVendor?.topSellerIds) return [];
      return PRODUCTS
        .filter(p => selectedVendor.topSellerIds?.includes(p.id))
        .sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0));
    }, [selectedVendor]);

    return (
      <div className="animate-fadeIn space-y-10 pb-32">
        <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl py-4 z-50">
          <button onClick={() => setView('HOME')} className="text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-chevron-left"></i> Stores
          </button>
          <div className="relative" onClick={() => setView('CHECKOUT')}>
            <button className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
              <i className="fa-solid fa-cart-shopping text-sm"></i>
            </button>
            {cart.length > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                {cart.reduce((acc, i) => acc + i.quantity, 0)}
              </div>
            )}
          </div>
        </div>

        <div className="h-64 rounded-[40px] overflow-hidden relative shadow-2xl">
          {selectedVendor && <StorefrontImage vendor={selectedVendor} className="w-full h-full" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedVendor?.name}</h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Shop & Deliver Mode</span>
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
          <i className="fa-solid fa-magnifying-glass text-gray-300"></i>
          <input 
            type="text" 
            placeholder={`Search ${selectedVendor?.name}...`} 
            className="bg-transparent outline-none flex-1 font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {topSellers.length > 0 && searchQuery === '' && (
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 px-2 flex items-center gap-3">
              <i className="fa-solid fa-crown text-amber-500"></i> Local Favorites
            </h3>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-2">
              {topSellers.map((p) => (
                <div key={p.id} className="min-w-[220px] bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                  <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-4">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <h4 className="font-black text-[11px] text-gray-900 uppercase tracking-tight mb-1">{p.name}</h4>
                  <p className="text-[10px] text-pink-600 font-black mb-4">
                    Est. ${p.priceRange?.min.toFixed(2)} - ${p.priceRange?.max.toFixed(2)}
                  </p>
                  <button onClick={() => startConfig(p)} className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Pick My Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 px-2">Inventory</h3>
          <div className="grid gap-4">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[32px] border border-gray-100 flex items-center gap-6 group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                  <img src={p.image} className="w-full h-full object-cover group-hover:rotate-3 transition-transform" alt={p.name} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 uppercase tracking-tight text-xs mb-0.5">{p.name}</h4>
                  <p className="text-[10px] text-pink-600 font-black uppercase">Est. Range: ${p.priceRange?.min.toFixed(2)} - ${p.priceRange?.max.toFixed(2)}</p>
                </div>
                <button onClick={() => startConfig(p)} className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all">
                  <i className="fa-solid fa-plus text-sm"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TrackingView = () => {
    if (!currentOrder) return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <Logo size="lg" />
        <h3 className="text-2xl font-black uppercase tracking-tighter">No Active Runns</h3>
        <button onClick={() => setView('HOME')} className="bg-gray-900 text-white px-8 py-4 rounded-full font-black text-xs uppercase">Start Shopping</button>
      </div>
    );

    return (
      <div className="animate-fadeIn space-y-8 pb-32">
        <div className="bg-gray-900 rounded-[50px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-1">Status Tracking</p>
              <h2 className="text-4xl font-black tracking-tighter uppercase">{currentOrder.status.replace('_', ' ')}</h2>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-widest">{currentOrder.id}</span>
            </div>
          </div>
          
          <div className="mt-8 h-48 rounded-[32px] overflow-hidden">
            <TrackingMap status={currentOrder.status} />
          </div>

          <div className="mt-8 bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Shop & Deliver Adjustment</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${currentOrder.adjustedTotal ? 'bg-green-500 text-white' : 'bg-pink-500 text-white'}`}>
                  {currentOrder.adjustedTotal ? 'Adjusted to Receipt' : 'Initial Auth Hold'}
                </span>
             </div>
             <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                   <p className="text-[9px] font-black text-white/40 uppercase mb-1">Current Authorization</p>
                   <p className="text-lg font-black text-white">${currentOrder.holdFee.toFixed(2)}</p>
                </div>
                {currentOrder.adjustedTotal && (
                   <div className="text-right">
                      <p className="text-[9px] font-black text-white/40 uppercase mb-1">Final Charge (Receipt + Fee)</p>
                      <p className="text-2xl font-black text-[#D63384] animate-bounce">${currentOrder.adjustedTotal.toFixed(2)}</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-xl flex items-center gap-6">
          <img src={currentOrder.driverInfo?.image} className="w-16 h-16 rounded-3xl object-cover shadow-lg" alt="" />
          <div className="flex-1">
            <h4 className="font-black text-lg text-gray-900 tracking-tight">{currentOrder.driverInfo?.name}</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentOrder.driverInfo?.rating}★ • Certified Runner</p>
          </div>
          <button onClick={() => setIsChatOpen(true)} className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-message"></i>
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 px-2">Shopping List</h3>
          <div className="space-y-2">
            {currentOrder.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-3xl flex items-center gap-4 border border-gray-100">
                <img src={item.image} className="w-12 h-12 bg-white rounded-xl object-cover" alt="" />
                <div className="flex-1">
                  <h5 className="font-black text-[11px] uppercase tracking-tight text-gray-800">{item.name}</h5>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    {item.selectedOptions?.color ? `${item.selectedOptions.color} • ` : ''}
                    {item.selectedOptions?.length ? `${item.selectedOptions.length} • ` : ''}
                    Range: ${item.priceRange?.min.toFixed(2)} - ${item.priceRange?.max.toFixed(2)}
                  </p>
                </div>
                {currentOrder.status === OrderStatus.PRICE_CONFIRMED || currentOrder.status === OrderStatus.IN_TRANSIT ? (
                  <i className="fa-solid fa-check-circle text-green-500"></i>
                ) : (
                  <i className="fa-solid fa-circle-notch animate-spin text-pink-300"></i>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CheckoutView = () => {
     const minEst = cart.reduce((acc, i) => acc + (i.priceRange?.min || 0) * i.quantity, 0);
     const maxEst = cart.reduce((acc, i) => acc + (i.priceRange?.max || 0) * i.quantity, 0);
     const estimatedHold = Math.max(9.99, maxEst + 7.99); // hold max + service fee

     return (
        <div className="animate-fadeIn space-y-8 pb-32">
          <h2 className="text-4xl font-black tracking-tighter uppercase">My Selection</h2>
          
          <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl">
             <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Estimated Range</span>
                <span className="font-bold text-lg">${minEst.toFixed(2)} - ${maxEst.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-start border-t border-white/5 pt-4">
                <div>
                   <p className="text-xl font-black uppercase tracking-tighter">Auth Hold Required</p>
                   <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1">Based on brand market rates</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-[#D63384]">${estimatedHold.toFixed(2)}</p>
                </div>
             </div>
             <div className="bg-white/5 p-5 rounded-3xl text-[9px] font-bold text-white/60 leading-relaxed uppercase">
                <i className="fa-solid fa-info-circle mr-2 text-pink-600"></i>
                We use the actual store receipt. Your card is held for the upper range. Once Marcus pays at the counter, your charge is updated to: Receipt Price + $7.99 Service Fee.
             </div>
          </div>

          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="p-6 bg-white border border-gray-100 rounded-[32px] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                  <div>
                    <h4 className="font-black text-gray-900 uppercase tracking-tight text-xs">{item.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                      {item.selectedOptions?.color ? `${item.selectedOptions.color} | ` : ''}
                      {item.selectedOptions?.length ? `${item.selectedOptions.length} | ` : ''}
                      Est: ${item.priceRange?.min.toFixed(2)} - ${item.priceRange?.max.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={() => {
                      setCart(prev => prev.filter((_, i) => i !== idx));
                   }} className="w-8 h-8 bg-gray-50 text-gray-400 rounded-xl hover:text-red-500 transition-colors">
                      <i className="fa-solid fa-trash-can text-xs"></i>
                   </button>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={handlePlaceOrder} className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-lg uppercase shadow-2xl hover:bg-pink-600 transition-all active:scale-95">
             Authorize Range & Pay
          </button>
        </div>
     );
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

                <MarketPriceGuide />

                <div className="space-y-6">
                   <div className="flex justify-between items-center px-2">
                     <h3 className="text-xl font-black tracking-tighter uppercase text-gray-900">Trending Now</h3>
                     <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Live Picks</span>
                   </div>
                   <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-2">
                     {trendingItems.map((p) => (
                       <div key={p.id} className="min-w-[280px] bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
                         <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-4">
                           <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                         </div>
                         <div className="space-y-2">
                           <h4 className="font-black text-xs text-gray-900 uppercase tracking-tight line-clamp-1">{p.name}</h4>
                           <p className="text-[10px] text-pink-600 font-black uppercase">Est: ${p.priceRange?.min.toFixed(2)}+</p>
                           <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
                         </div>
                         <button onClick={() => startConfig(p)} className="w-full mt-4 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 transition-colors">
                           Pick My Details
                         </button>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between items-end px-2">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                        {selectedZip ? `Stores in ${selectedZip}` : `Supplies in ${selectedCity}`}
                      </h3>
                    </div>
                  </div>

                  {filteredVendors.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-[40px]">
                      <p className="text-gray-400 font-black uppercase text-[10px]">No stores matching this area.</p>
                      <button onClick={() => setIsLocationModalOpen(true)} className="text-[#D63384] font-black uppercase text-xs mt-2 border-b border-[#D63384]">Change ZIP</button>
                    </div>
                  ) : (
                    <div className="grid gap-8">
                      {filteredVendors.map(vendor => (
                        <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setView('VENDOR'); }} className="cursor-pointer group">
                          <div className="relative h-64 w-full rounded-[40px] overflow-hidden mb-4 shadow-xl">
                            <StorefrontImage vendor={vendor} className="w-full h-full group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-8 flex flex-col justify-end">
                               <h3 className="font-black text-2xl text-white uppercase">{vendor.name}</h3>
                               <p className="text-[10px] font-black uppercase text-white/70">
                                 {vendor.zipCode ? `Area: ${vendor.zipCode}` : 'Texas Citywide'} • {vendor.neighborhood || vendor.city}
                               </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : view === 'VENDOR' ? (
              <VendorView />
            ) : view === 'TRACKING' ? (
              <TrackingView />
            ) : view === 'CHECKOUT' ? (
              <CheckoutView />
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

      {/* CONFIGURATOR MODAL */}
      {configProduct && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xl flex items-end justify-center animate-fadeIn p-4">
          <div className="w-full max-w-xl bg-white rounded-[50px] p-8 max-h-[90vh] overflow-y-auto no-scrollbar space-y-8 animate-slideUp">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <img src={configProduct.image} className="w-20 h-20 rounded-3xl object-cover shadow-lg" alt="" />
                   <div>
                      <h2 className="text-2xl font-black tracking-tighter uppercase">{configProduct.name}</h2>
                      <p className="text-pink-600 font-black text-xs">Est: ${configProduct.priceRange?.min.toFixed(2)} - ${configProduct.priceRange?.max.toFixed(2)}</p>
                   </div>
                </div>
                <button onClick={() => setConfigProduct(null)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition-all">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>

             {configProduct.marketComparison && (
               <div className="bg-gray-50 p-6 rounded-[32px] space-y-3">
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400">Retail Comparison</h4>
                 <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-black text-gray-900">Major Retailer Avg:</p>
                      <p className="text-xl font-black text-pink-600">${configProduct.marketComparison.retailAvg?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                        Local Savings: Up to ${Math.max(0, (configProduct.marketComparison.retailAvg || 0) - (configProduct.priceRange?.min || 0)).toFixed(2)}
                      </p>
                    </div>
                 </div>
               </div>
             )}

             <div className="space-y-6">
                {configProduct.options?.colors && (
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Color</h4>
                      <div className="flex flex-wrap gap-2">
                         {configProduct.options.colors.map(c => (
                            <button key={c} onClick={() => setSelectedConfig({...selectedConfig, color: c})} className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedConfig.color === c ? 'bg-gray-900 text-white shadow-xl' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{c}</button>
                         ))}
                      </div>
                   </div>
                )}
                
                {configProduct.options?.lengths && (
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Length</h4>
                      <div className="flex flex-wrap gap-2">
                         {configProduct.options.lengths.map(l => (
                            <button key={l} onClick={() => setSelectedConfig({...selectedConfig, length: l})} className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedConfig.length === l ? 'bg-gray-900 text-white shadow-xl' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{l}</button>
                         ))}
                      </div>
                   </div>
                )}

                {configProduct.options?.types && (
                   <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Type</h4>
                      <div className="flex flex-wrap gap-2">
                         {configProduct.options.types.map(t => (
                            <button key={t} onClick={() => setSelectedConfig({...selectedConfig, type: t})} className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedConfig.type === t ? 'bg-gray-900 text-white shadow-xl' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{t}</button>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             <button onClick={() => addToCart(configProduct, selectedConfig)} className="w-full bg-[#D63384] text-white py-6 rounded-[30px] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                Add To My Runn
             </button>
          </div>
        </div>
      )}

      {isChatOpen && currentOrder && (
        <ChatInterface 
          recipientName={currentOrder.driverInfo?.name || "Runner"} 
          onClose={() => setIsChatOpen(false)} 
          role="CUSTOMER" 
        />
      )}

      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-md animate-fadeIn p-4">
          <div className="w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl space-y-8 animate-slideUp mb-safe">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Market Area</h2>
              <button onClick={() => setIsLocationModalOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsLocationModalOpen(false); }} className="space-y-6">
              <input 
                type="text" 
                maxLength={5}
                value={zipInputValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setZipInputValue(val);
                  if (val.length === 5) {
                    const city = ZIP_MAP[val];
                    if (city) { setSelectedCity(city); setSelectedZip(val); }
                    else { setSelectedZip(val); setSelectedCity('Houston'); }
                  }
                }}
                placeholder="ZIP Code" 
                className="w-full p-6 bg-gray-50 rounded-3xl outline-none border-2 border-transparent focus:border-[#D63384] font-black text-4xl text-center"
              />
              <button type="submit" className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Update Market</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
