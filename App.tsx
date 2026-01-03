
import React, { useState, useMemo, useEffect } from 'react';
import { BeautyVendor, Product, CartItem, Order, OrderStatus, AppNotification, OrderFees, AppRole, DriverApplication } from './types';
import { VENDORS, PRODUCTS, CATEGORIES, FALLBACKS } from './constants';
import TrackingMap from './components/TrackingMap';
import VendorMap from './components/VendorMap';
import DriverOnboarding from './components/DriverOnboarding';
import AdminCommandCenter from './components/AdminCommandCenter';
import { calculateDistance, HOUSTON_ZIP_COORDS, validateStoresWithGemini } from './services/locationService';
import { generateStorefrontImage, validateStoreAuthenticity, generateRealisticProductVisual } from './services/geminiService';
import { calculateDynamicProductPrice, calculateOrderFees } from './services/pricingService';

// --- SHARED COMPONENTS ---

const ProductBadge: React.FC<{ product: Product, onClick?: () => void }> = ({ product, onClick }) => {
  const content = (() => {
    if (product.isOnSale) return { bg: 'bg-[#C48B8B]', icon: 'fa-tag', text: 'On Sale' };
    if (product.stockLevel !== undefined && product.stockLevel > 0 && product.stockLevel < 10) return { bg: 'bg-red-500', icon: 'fa-fire-flame-curved', text: 'Low Stock' };
    if (product.isBestSeller) return { bg: 'bg-white', icon: 'fa-crown', text: 'Best Seller', textCol: 'text-gray-900' };
    if (product.isTrending) return { bg: 'bg-black', icon: 'fa-bolt', text: 'Trending' };
    return null;
  })();

  if (!content) return null;

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`absolute top-4 left-4 ${content.bg} ${content.textCol || 'text-white'} px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest z-10 border border-white/10 cursor-pointer active:scale-95 transition-all`}
    >
      <i className={`fa-solid ${content.icon} text-[7px]`}></i> {content.text}
    </div>
  );
};

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

const FeeBreakdown: React.FC<{ fees: OrderFees }> = ({ fees }) => (
  <div className="space-y-4 pt-6 border-t border-[#1A1A1A]/5">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase text-[#1A1A1A]/40 tracking-widest">Store Price (Est.)</span>
        <div className="group relative">
          <i className="fa-solid fa-circle-info text-[10px] text-[#C48B8B] cursor-help"></i>
          <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-[#1A1A1A] text-white text-[8px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium leading-relaxed">
            We pass through the exact store receipt price. No markups added.
          </div>
        </div>
      </div>
      <span className="text-sm font-black text-[#1A1A1A]">${fees.shelfPriceEstimate.toFixed(2)}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black uppercase text-[#1A1A1A]/40 tracking-widest">Runner Fee</span>
      <span className="text-sm font-black text-[#1A1A1A]">${fees.runnFee.toFixed(2)}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black uppercase text-[#1A1A1A]/40 tracking-widest">Service Fee</span>
      <span className="text-sm font-black text-[#1A1A1A]">${fees.serviceFee.toFixed(2)}</span>
    </div>
    <div className="flex justify-between items-center pt-4 border-t border-[#1A1A1A]/5">
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase text-[#C48B8B] tracking-[0.2em]">Authorization Hold</span>
        <span className="text-[8px] font-bold uppercase text-[#1A1A1A]/30">Final charge settled via store receipt</span>
      </div>
      <span className="text-xl font-black text-[#1A1A1A]">${fees.authHoldTotal.toFixed(2)}</span>
    </div>
  </div>
);

const ZipSearchModal: React.FC<{ onSearch: (zip: string) => void, onClose: () => void }> = ({ onSearch, onClose }) => {
  const [zip, setZip] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="fixed inset-0 z-[500] bg-[#1A1A1A]/90 backdrop-blur-xl flex items-center justify-center p-8 animate-fadeIn">
      <div className="w-full max-w-md bg-[#EDE4DB] rounded-[60px] p-12 text-center space-y-10 animate-slideUp shadow-2xl relative border border-[#C48B8B]/20">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        
        <div className="space-y-4">
          <h2 className="font-serif text-5xl italic text-[#1A1A1A]">Neighborhood Stores</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">Search beauty supply in your area</p>
        </div>

        <div className="relative">
          <input 
            type="text" 
            maxLength={5} 
            value={zip}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter ZIP Code" 
            className={`w-full bg-white rounded-3xl p-8 text-center text-2xl font-black outline-none transition-all border-2 ${isFocused ? 'border-[#C48B8B] shadow-xl' : 'border-transparent shadow-sm'}`}
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[#C48B8B]">
            <i className="fa-solid fa-location-crosshairs animate-pulse"></i>
          </div>
        </div>

        <button 
          onClick={() => onSearch(zip)}
          className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest rose-glow active:scale-95 transition-all shadow-xl"
        >
          See Local Stores
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<AppRole>('CUSTOMER');
  const [view, setView] = useState<'HOME' | 'VENDOR' | 'CHECKOUT' | 'TRACKING' | 'SEARCH_RESULTS' | 'RUNNER_DASHBOARD' | 'ADMIN'>('HOME');
  const [selectedZip, setSelectedZip] = useState<string>('');
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'DISTANCE' | 'AVAILABILITY' | 'FASTEST'>('DISTANCE');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<BeautyVendor | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [localStoreImages, setLocalStoreImages] = useState<Record<string, string>>({});
  const [verifiedStores, setVerifiedStores] = useState<Record<string, Partial<BeautyVendor>>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [isGeneratingProductVisual, setIsGeneratingProductVisual] = useState(false);
  const [productVisuals, setProductVisuals] = useState<Record<string, string>>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isEmergencyPaused, setIsEmergencyPaused] = useState(false);
  
  // DRIVER STATE
  const [driverApp, setDriverApp] = useState<DriverApplication | null>(null);
  const [allDriverApps, setAllDriverApps] = useState<DriverApplication[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  const calculatedFees = useMemo((): OrderFees => {
    if (!selectedVendor) return { shelfPriceEstimate: 0, runnFee: 0, serviceFee: 0, authHoldTotal: 0 };
    return calculateOrderFees(cart, selectedVendor);
  }, [cart, selectedVendor]);

  const searchResults = useMemo(() => {
    const userCoords = HOUSTON_ZIP_COORDS[selectedZip] || HOUSTON_ZIP_COORDS['77002'];
    
    let list = VENDORS.map(v => {
      const verifiedData = verifiedStores[v.id] || {};
      return {
        ...v,
        image: localStoreImages[v.id] || v.image,
        distance: calculateDistance(userCoords.lat, userCoords.lng, v.lat, v.lng),
        isAIVerified: verifiedData.isAIVerified ?? false,
        verificationNotes: verifiedData.verificationNotes ?? ''
      };
    });

    if (selectedCategoryFilter) {
      list = list.filter(v => v.categories.some(cat => cat.toLowerCase().includes(selectedCategoryFilter.toLowerCase())));
    }

    return list.sort((a, b) => {
      if (a.zipCode === selectedZip && b.zipCode !== selectedZip) return -1;
      if (b.zipCode === selectedZip && a.zipCode !== selectedZip) return 1;
      if (sortBy === 'DISTANCE') return (a.distance || 0) - (b.distance || 0);
      if (sortBy === 'AVAILABILITY') return b.categories.length - a.categories.length;
      if (sortBy === 'FASTEST') return (a.velocity || 0) - (b.velocity || 0);
      return 0;
    });
  }, [selectedZip, sortBy, selectedCategoryFilter, localStoreImages, verifiedStores]);

  const addNotification = (title: string, body: string, type: AppNotification['type'] = 'order') => {
    const newNotif: AppNotification = { id: Math.random().toString(), title, body, type, timestamp: Date.now() };
    setNotifications(prev => [...prev, newNotif]);
  };

  const handleZipSearch = async (zip: string) => {
    if (zip.length !== 5) return;
    setSelectedZip(zip);
    setIsZipModalOpen(false);
    setView('SEARCH_RESULTS');
    
    VENDORS.forEach(async (v) => {
      if (v.zipCode === zip && !localStoreImages[v.id]) {
        setIsGeneratingImage(v.id);
        try {
          const img = await generateStorefrontImage(v.name, v.neighborhood || v.city);
          setLocalStoreImages(prev => ({ ...prev, [v.id]: img }));
        } catch (e) {
          console.error("Failed to generate store image", e);
        } finally {
          setIsGeneratingImage(null);
        }
      }
    });

    try {
      const validationResult = await validateStoresWithGemini(zip);
      if (validationResult) {
        addNotification("Neighborhood Verified", `Located verified beauty supply hubs in ${zip}.`, 'success');
      }
    } catch (err) {
      console.error("Zip validation error:", err);
    }
  };

  const verifyProductVisual = async (product: Product) => {
    if (isGeneratingProductVisual) return;
    setIsGeneratingProductVisual(true);
    try {
      const visual = await generateRealisticProductVisual(product.name, product.brand, product.description);
      if (visual) {
        setProductVisuals(prev => ({ ...prev, [product.id]: visual }));
        addNotification("Visual Verified", "Retail packaging has been sourced and verified.", "success");
      }
    } catch (e) {
      addNotification("Sourcing Error", "Could not generate verified visual. Using standard catalog.");
    } finally {
      setIsGeneratingProductVisual(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedVendor || isPlacingOrder) return;
    setIsPlacingOrder(true);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const newOrder: Order = {
      id: `BR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cart],
      fees: calculatedFees,
      status: OrderStatus.HOLD_PAID,
      customerId: 'user1',
      vendorId: selectedVendor.id,
      timestamp: Date.now(),
      address: selectedZip || 'Houston Service Area',
      allowSubstitutes: true
    };
    
    setCurrentOrder(newOrder);
    setCart([]);
    setIsPlacingOrder(false);
    setView('TRACKING');
    addNotification("Runner Dispatched", `Your Beauty Runn from ${selectedVendor.name} is underway.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    addNotification("Item Removed", "Your list has been updated.");
  };

  const addToCart = (product: Product) => {
    if (isEmergencyPaused) {
      addNotification("System Paused", "Operations are temporarily paused by the founder. Try again shortly.");
      return;
    }
    setCart(prev => [...prev, { ...product, quantity: 1 }]);
    setConfigProduct(null);
    addNotification("Added to List", `${product.name} added to your Runn.`);
  };

  if (showSplash) return (
    <div className="fixed inset-0 z-[1000] bg-[#EDE4DB] flex flex-col items-center justify-center animate-fadeIn" onClick={() => setShowSplash(false)}>
      <div className="text-center space-y-8 animate-splash-logo flex flex-col items-center">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-9xl text-[#1A1A1A] tracking-tighter italic">B</h1>
          <i className="fa-solid fa-heart text-[#C48B8B] text-5xl animate-floating-heart mt-8"></i>
        </div>
        <div className="space-y-2">
          <h2 className="text-[#1A1A1A] font-black text-2xl uppercase tracking-[0.3em]">Beauty Runn</h2>
          <p className="text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest opacity-60">Houston's Neighborhood Beauty Store Delivery</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EDE4DB] flex flex-col font-inter safe-top pb-32">
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} onDismiss={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} />
      ))}

      {!isAuthenticated ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 animate-fadeIn">
          <div className="flex items-center gap-4 mb-12">
            <h1 className="font-serif text-9xl text-[#1A1A1A] tracking-tighter italic border-b-2 border-[#C48B8B]">B</h1>
            <i className="fa-solid fa-heart text-[#C48B8B] text-5xl animate-floating-heart mt-8"></i>
          </div>
          <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase mb-2 italic font-serif">Beauty Runn</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C48B8B] mb-16">Houston's Neighborhood Beauty Store Delivery</p>
          
          <div className="w-full max-w-xs space-y-4">
            <button 
              onClick={() => { setRole('CUSTOMER'); setIsAuthenticated(true); setView('HOME'); }} 
              className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95"
            >
              Order from a Local Store
            </button>
            <button 
              onClick={() => { setRole('DRIVER'); setView('HOME'); setIsAuthenticated(true); }} 
              className="w-full bg-transparent text-[#1A1A1A] border border-[#1A1A1A] py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
            >
              Become a Runner
            </button>
            <button 
              onClick={() => { setRole('OWNER'); setIsAuthenticated(true); setView('ADMIN'); }} 
              className="w-full bg-transparent text-[#1A1A1A]/40 py-2 font-black text-[9px] uppercase tracking-widest hover:text-[#1A1A1A] transition-all"
            >
              Owner Login (Command Center)
            </button>
          </div>
        </div>
      ) : (
        <>
          <nav className="px-8 py-6 flex items-center justify-between sticky top-0 z-[100] bg-[#EDE4DB]/95 backdrop-blur-xl border-b border-[#1A1A1A]/5">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('HOME')}>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif text-3xl italic text-[#1A1A1A]">B</h2>
                <i className="fa-solid fa-heart text-[#C48B8B] text-xs animate-floating-heart mb-2"></i>
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Runn</span>
            </div>
            <div className="flex items-center gap-4">
              {role === 'CUSTOMER' && (
                <button onClick={() => setIsZipModalOpen(true)} className="bg-white/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm active:scale-95 transition-all">
                  <i className="fa-solid fa-location-dot mr-2 text-[#C48B8B]"></i>
                  {selectedZip || 'Search By Zip code'}
                </button>
              )}
              <button onClick={() => { setIsAuthenticated(false); setRole('CUSTOMER'); setView('HOME'); setCart([]); }} className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#C48B8B] transition-all shadow-sm">
                <i className="fa-solid fa-power-off"></i>
              </button>
            </div>
          </nav>

          <main className="px-8 py-10 max-w-5xl mx-auto w-full">
            {view === 'HOME' && role === 'CUSTOMER' && (
              <div className="animate-fadeIn space-y-12">
                <header className="text-center py-10 space-y-4">
                  <h2 className="font-serif text-6xl md:text-7xl italic text-[#1A1A1A] shimmer-text leading-tight">Glow On.<br/>We’ll Handle It.</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C48B8B]">Retail-Verified Beauty Supply</p>
                </header>

                <div 
                  onClick={() => setIsZipModalOpen(true)}
                  className="bg-white p-10 rounded-[50px] shadow-luxury flex flex-col md:flex-row items-center justify-between gap-8 border border-[#1A1A1A]/5 cursor-pointer hover:border-[#C48B8B] transition-all group"
                >
                  <div className="space-y-4 text-center md:text-left">
                    <h3 className="font-serif text-4xl italic">Find Local Store</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">Search beauty supply in your Houston ZIP</p>
                  </div>
                  <div className="w-16 h-16 bg-[#1A1A1A] text-white rounded-3xl flex items-center justify-center text-xl group-hover:bg-[#C48B8B] transition-colors shadow-xl">
                    <i className="fa-solid fa-store"></i>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="flex justify-between items-end">
                      <h4 className="font-serif text-3xl italic text-[#1A1A1A]">Neighborhood Favorites</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B] cursor-pointer" onClick={() => { setView('SEARCH_RESULTS'); setSelectedCategoryFilter(null); }}>See All Stores</span>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                    {VENDORS.slice(0, 2).map(v => (
                      <VendorCard 
                        key={v.id} 
                        vendor={v} 
                        onSelect={() => { setSelectedVendor(v); setView('VENDOR'); }}
                        isLocal={v.zipCode === selectedZip} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : view === 'SEARCH_RESULTS' ? (
              <div className="animate-fadeIn space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div>
                    <h2 className="font-serif text-6xl italic text-[#1A1A1A]">Store Selection</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-3 flex items-center gap-3">
                      <i className="fa-solid fa-map-pin"></i> {searchResults.length} Hubs in {selectedZip || 'Houston'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <button 
                    onClick={() => setSelectedCategoryFilter(null)}
                    className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${!selectedCategoryFilter ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                    All Stores
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategoryFilter === cat ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {searchResults.map(v => (
                    <VendorCard 
                      key={v.id} 
                      vendor={v} 
                      onSelect={() => { setSelectedVendor(v); setView('VENDOR'); }} 
                      isLocal={v.zipCode === selectedZip}
                    />
                  ))}
                </div>
              </div>
            ) : view === 'VENDOR' ? (
              <div className="animate-fadeIn space-y-10">
                <div className="flex justify-between items-start">
                  <button onClick={() => setView('SEARCH_RESULTS')} className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-sm active:scale-90 transition-all border border-gray-100 hover:text-[#C48B8B]"><i className="fa-solid fa-arrow-left"></i></button>
                  <div className="text-right">
                    <h3 className="font-serif text-4xl italic text-[#1A1A1A] leading-tight">{selectedVendor?.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B]">{selectedVendor?.neighborhood}</p>
                  </div>
                </div>

                <div className="space-y-14">
                  {CATEGORIES.map(cat => {
                    const categoryProducts = PRODUCTS.filter(p => p.category === cat);
                    if (categoryProducts.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-6">
                        <div className="flex items-center gap-4"><h4 className="font-serif text-2xl italic text-[#1A1A1A]">{cat}</h4><div className="h-px flex-1 bg-gray-200"></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {categoryProducts.map(p => (
                            <div key={p.id} onClick={() => setConfigProduct(p)} className="bg-white p-6 rounded-[40px] flex items-center gap-6 border border-[#1A1A1A]/5 shadow-sm hover:border-[#C48B8B] transition-all cursor-pointer group relative overflow-hidden active:scale-98">
                              <ProductBadge product={p} />
                              <img src={p.image} className="w-24 h-32 object-cover rounded-2xl shadow-sm" alt="" />
                              <div className="flex-1">
                                <span className="text-[8px] font-black uppercase text-[#C48B8B] tracking-widest">{p.brand}</span>
                                <h4 className="font-black text-xs uppercase text-[#1A1A1A] mt-1">{p.name}</h4>
                                <div className="flex items-center gap-2 mt-4">
                                  <span className="text-sm font-black text-[#1A1A1A]">${p.priceRange.min.toFixed(2)}</span>
                                  <i className="fa-solid fa-plus ml-auto text-gray-300 group-hover:text-[#C48B8B]"></i>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : view === 'CHECKOUT' ? (
              <div className="animate-fadeIn max-w-xl mx-auto space-y-12 pb-40">
                <h2 className="font-serif text-5xl italic text-[#1A1A1A] text-center">Your Runn List</h2>
                <div className="bg-white p-8 rounded-[48px] shadow-luxury border border-[#1A1A1A]/5">
                  <div className="space-y-6 mb-10">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <img src={item.image} className="w-12 h-16 object-cover rounded-xl border border-gray-100" alt="" />
                          <div className="flex flex-col">
                             <span className="text-xs font-black uppercase text-[#1A1A1A]">{item.name}</span>
                             <span className="text-[9px] font-bold text-gray-400 uppercase">{item.brand} • 1x</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90">
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    ))}
                    {cart.length === 0 && (
                      <div className="py-20 text-center">
                        <i className="fa-solid fa-bag-shopping text-4xl text-gray-100 mb-4"></i>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Your list is empty.</p>
                        <button onClick={() => setView('HOME')} className="text-[#C48B8B] text-[9px] font-black uppercase underline mt-4">Start Sourcing</button>
                      </div>
                    )}
                  </div>
                  {cart.length > 0 && <FeeBreakdown fees={calculatedFees} />}
                </div>
                {cart.length > 0 && (
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={isPlacingOrder || isEmergencyPaused}
                    className={`w-full py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all rose-glow flex items-center justify-center gap-4 ${isPlacingOrder ? 'bg-gray-100 text-gray-400' : 'bg-[#1A1A1A] text-white active:scale-95'}`}
                  >
                    {isPlacingOrder ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i> Dispatching Runner...
                      </>
                    ) : (
                      'Confirm Order & Dispatch'
                    )}
                  </button>
                )}
              </div>
            ) : view === 'TRACKING' ? (
              <div className="animate-fadeIn space-y-10">
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="font-serif text-5xl italic text-[#1A1A1A]">Live Tracking</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-2">Verified Sourcing in Progress</p>
                  </div>
                  <div className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">In Route</div>
                </header>
                <div className="h-96 rounded-[48px] overflow-hidden shadow-2xl border border-[#EDE4DB]"><TrackingMap status={currentOrder?.status || ''} /></div>
                <button onClick={() => setView('HOME')} className="w-full py-6 rounded-3xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] shadow-sm">Back to Dashboard</button>
              </div>
            ) : null}
          </main>

          {cart.length > 0 && view !== 'CHECKOUT' && view !== 'TRACKING' && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#1A1A1A] rounded-[40px] px-10 py-6 flex justify-between items-center z-[200] shadow-2xl border border-white/5 backdrop-blur-md animate-slideUp">
               <div className="flex flex-col"><span className="text-[10px] font-black text-white/40 uppercase">Est. Total</span><span className="text-lg font-black text-white">${calculatedFees.authHoldTotal.toFixed(2)}</span></div>
               <button onClick={() => setView('CHECKOUT')} className="bg-[#C48B8B] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Review List</button>
            </div>
          )}

          {isZipModalOpen && <ZipSearchModal onSearch={handleZipSearch} onClose={() => setIsZipModalOpen(false)} />}
        </>
      )}

      {configProduct && (
        <div className="fixed inset-0 z-[1000] bg-[#1A1A1A]/80 backdrop-blur-xl flex items-end justify-center p-4">
          <div className="w-full max-w-xl bg-[#EDE4DB] rounded-[50px] p-10 space-y-10 animate-slideUp border-t border-[#C48B8B]/20">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-32 rounded-2xl overflow-hidden shadow-xl border border-white/10 relative">
                    <img src={productVisuals[configProduct.id] || configProduct.image} className="w-full h-full object-cover" alt="" />
                    {isGeneratingProductVisual && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <i className="fa-solid fa-sparkles text-white animate-spin"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-serif text-4xl italic leading-tight">{configProduct.name}</h2>
                    <p className="text-[10px] font-black uppercase text-[#C48B8B] mt-2">Retail Packaging Verified</p>
                  </div>
                </div>
                <button onClick={() => setConfigProduct(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:text-[#C48B8B] transition-all"><i className="fa-solid fa-xmark"></i></button>
             </div>
             
             <div className="space-y-4">
               <div className="p-6 bg-white/50 rounded-3xl border border-black/5">
                  <p className="text-2xl font-black text-[#1A1A1A]">${configProduct.priceRange.min.toFixed(2)}</p>
                  <p className="text-[11px] font-medium leading-relaxed text-[#1A1A1A]/70 italic mt-2">
                    {configProduct.description}
                  </p>
               </div>
               
               <button 
                  onClick={() => verifyProductVisual(configProduct)}
                  className="w-full py-4 rounded-2xl border border-dashed border-[#C48B8B]/40 text-[9px] font-black uppercase tracking-widest text-[#C48B8B] flex items-center justify-center gap-3 hover:bg-[#C48B8B]/5 transition-all"
               >
                 <i className={`fa-solid ${isGeneratingProductVisual ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
                 {isGeneratingProductVisual ? 'Sourcing Packaging Visual...' : 'Verify Real Packaging Visual'}
               </button>
             </div>

             <button onClick={() => addToCart(configProduct)} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95">Add to My Runn List</button>
          </div>
        </div>
      )}
    </div>
  );
};

const VendorCard: React.FC<{ 
  vendor: BeautyVendor, 
  onSelect: () => void, 
  isLocal?: boolean 
}> = ({ vendor, onSelect, isLocal }) => (
  <div onClick={onSelect} className={`bg-white p-6 rounded-[40px] border transition-all cursor-pointer group animate-slideUp ${isLocal ? 'border-[#C48B8B] shadow-xl scale-[1.02]' : 'border-[#1A1A1A]/5 shadow-luxury hover:border-[#C48B8B]'}`}>
    <div className="relative h-56 w-full rounded-[32px] overflow-hidden mb-6 border border-[#1A1A1A]/5 bg-gray-50 flex items-center justify-center">
      <img src={vendor.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={vendor.name} />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-40">
        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-4 text-white">
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase opacity-40">Distance</span>
            <span className="text-[11px] font-black">{vendor.distance?.toFixed(1) || '0.0'} mi</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase opacity-40">Delivery</span>
            <span className="text-[11px] font-black">{vendor.deliveryTime}</span>
          </div>
        </div>
      </div>
      {isLocal && (
        <div className="absolute top-4 right-4 bg-[#C48B8B] text-white px-4 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest z-20">
          Neighborhood Hub
        </div>
      )}
    </div>
    
    <div className="space-y-2 px-2">
      <h3 className="font-serif text-3xl italic text-[#1A1A1A] group-hover:text-[#C48B8B] transition-colors leading-tight">{vendor.name}</h3>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{vendor.address}</p>
    </div>
  </div>
);

export default App;
