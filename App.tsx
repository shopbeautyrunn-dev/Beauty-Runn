
import React, { useState, useMemo, useEffect } from 'react';
import { BeautyVendor, Product, CartItem, Order, OrderStatus, AppNotification, OrderFees, AppRole, DriverApplication } from './types';
import { VENDORS, PRODUCTS, CATEGORIES, FALLBACKS } from './constants';
import TrackingMap from './components/TrackingMap';
import VendorMap from './components/VendorMap';
import DriverOnboarding from './components/DriverOnboarding';
import AdminCommandCenter from './components/AdminCommandCenter';
import { calculateDistance, HOUSTON_ZIP_COORDS, validateStoresWithGemini } from './services/locationService';
import { generateStorefrontImage, validateStoreAuthenticity } from './services/geminiService';
import { calculateDynamicProductPrice, calculateOrderFees } from './services/pricingService';

// --- SHARED COMPONENTS ---

const ProductBadge: React.FC<{ product: Product }> = ({ product }) => {
  if (product.isOnSale) {
    return (
      <div className="absolute top-4 left-4 bg-[#C48B8B] text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest z-10 animate-pulse-subtle border border-white/20">
        <i className="fa-solid fa-tag text-[7px]"></i> On Sale Now
      </div>
    );
  }

  if (product.stockLevel !== undefined && product.stockLevel > 0 && product.stockLevel < 10) {
    return (
      <div className="absolute top-4 left-4 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 text-[8px] font-black uppercase tracking-widest z-10 font-black">
        <i className="fa-solid fa-fire-flame-curved text-[7px]"></i> Limited Stock
      </div>
    );
  }

  if (product.isBestSeller) {
    return (
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest z-10 border border-black/5 badge-shimmer">
        <i className="fa-solid fa-crown text-amber-500 text-[7px]"></i> Best Seller
      </div>
    );
  }

  if (product.isTrending) {
    return (
      <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-[8px] font-black uppercase tracking-widest z-10 border border-white/5">
        <i className="fa-solid fa-bolt text-[#C48B8B] text-[7px]"></i> Trending Near You
      </div>
    );
  }

  return null;
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
  const [searchViewType, setSearchViewType] = useState<'LIST' | 'MAP'>('LIST');
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

  useEffect(() => {
    if (view === 'SEARCH_RESULTS' && searchResults.length > 0) {
      const topStores = searchResults.slice(0, 3).filter(v => !verifiedStores[v.id]);
      topStores.forEach(async (v) => {
        const validation = await validateStoreAuthenticity(v.name, v.address);
        setVerifiedStores(prev => ({
          ...prev,
          [v.id]: {
            isAIVerified: validation.status === 'VERIFIED' || validation.accuracy === 'High',
            verificationNotes: validation.context
          }
        }));
      });
    }
  }, [view, searchResults]);

  const handleZipSearch = async (zip: string) => {
    if (zip.length === 5) {
      setSelectedZip(zip);
      setIsZipModalOpen(false);
      setView('SEARCH_RESULTS');
      validateStoresWithGemini(zip).catch(console.error);
    }
  };

  const generateStoreImage = async (vendor: BeautyVendor) => {
    setIsGeneratingImage(vendor.id);
    try {
      const imageUrl = await generateStorefrontImage(vendor.name, vendor.neighborhood || 'Houston');
      setLocalStoreImages(prev => ({ ...prev, [vendor.id]: imageUrl }));
      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor({ ...selectedVendor, image: imageUrl });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedVendor) return;
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
    setView('TRACKING');
  };

  const handleDriverOnboardingComplete = (data: DriverApplication) => {
    setDriverApp(data);
    setAllDriverApps(prev => [...prev.filter(a => a.email !== data.email), data]);
    if (data.status === 'APPROVED') {
      setRole('DRIVER');
      setView('RUNNER_DASHBOARD');
    }
  };

  if (showSplash) return (
    <div className="fixed inset-0 z-[1000] bg-[#EDE4DB] flex flex-col items-center justify-center animate-fadeIn" onClick={() => setShowSplash(false)}>
      <div className="text-center space-y-8 animate-splash-logo">
        <h1 className="font-serif text-9xl text-[#1A1A1A] tracking-tighter italic">B</h1>
        <div className="space-y-2">
          <h2 className="text-[#1A1A1A] font-black text-2xl uppercase tracking-[0.3em]">Beauty Runn</h2>
          <p className="text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest opacity-60">Houston's Neighborhood Beauty Store Delivery</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EDE4DB] flex flex-col font-inter safe-top pb-32">
      {!isAuthenticated ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 animate-fadeIn">
          <h1 className="font-serif text-9xl text-[#1A1A1A] tracking-tighter italic border-b-2 border-[#C48B8B] mb-12">B</h1>
          <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase mb-2 italic font-serif">Beauty Runn</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C48B8B] mb-16">Houston's Neighborhood Beauty Store Delivery</p>
          
          <div className="w-full max-w-xs space-y-4">
            <button 
              onClick={() => { setRole('CUSTOMER'); setIsAuthenticated(true); }} 
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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
              <h2 className="font-serif text-3xl italic text-[#1A1A1A]">B</h2>
              <span className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Runn</span>
            </div>
            <div className="flex items-center gap-4">
              {role === 'CUSTOMER' && (
                <button onClick={() => setIsZipModalOpen(true)} className="bg-white/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm active:scale-95 transition-all">
                  <i className="fa-solid fa-location-dot mr-2 text-[#C48B8B]"></i>
                  {selectedZip || 'Search By Zip code'}
                </button>
              )}
              <button onClick={() => { setIsAuthenticated(false); setRole('CUSTOMER'); setView('HOME'); }} className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#C48B8B] transition-all shadow-sm">
                <i className="fa-solid fa-power-off"></i>
              </button>
            </div>
          </nav>

          <main className="px-8 py-10 max-w-5xl mx-auto w-full">
            {view === 'HOME' && role === 'DRIVER' && !driverApp && (
              <DriverOnboarding onComplete={handleDriverOnboardingComplete} onCancel={() => setView('HOME')} />
            )}
            
            {view === 'HOME' && role === 'DRIVER' && driverApp && driverApp.status !== 'APPROVED' && (
              <DriverOnboarding existingApplication={driverApp} onComplete={handleDriverOnboardingComplete} onCancel={() => setView('HOME')} />
            )}

            {view === 'RUNNER_DASHBOARD' && role === 'DRIVER' && (
              <div className="animate-fadeIn space-y-10">
                <header className="flex justify-between items-start">
                  <div>
                    <h2 className="font-serif text-6xl italic text-[#1A1A1A]">Runner Hub</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-3">Welcome Back, {driverApp?.fullName.split(' ')[0]}</p>
                  </div>
                  <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all ${isOnline ? 'bg-[#10B981] text-white animate-pulse' : 'bg-[#1A1A1A] text-white opacity-40'}`}
                  >
                    {isOnline ? 'You Are Online' : 'Go Online'}
                  </button>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[40px] shadow-luxury border border-[#1A1A1A]/5">
                    <h4 className="text-[10px] font-black uppercase text-[#C48B8B] tracking-widest mb-4">Today's Earnings</h4>
                    <p className="text-4xl font-black text-[#1A1A1A]">$0.00</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">0 Runns Completed</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] shadow-luxury border border-[#1A1A1A]/5">
                    <h4 className="text-[10px] font-black uppercase text-[#C48B8B] tracking-widest mb-4">Rating</h4>
                    <p className="text-4xl font-black text-[#1A1A1A]">5.0 <span className="text-xl">★</span></p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">New Runner Bonus Active</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] shadow-luxury border border-[#1A1A1A]/5">
                    <h4 className="text-[10px] font-black uppercase text-[#C48B8B] tracking-widest mb-4">Active Zone</h4>
                    <p className="text-xl font-black text-[#1A1A1A] uppercase truncate">{driverApp?.zipCode} - Houston</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-4">Searching for Requests...</p>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] p-12 rounded-[60px] text-center space-y-6 shadow-2xl">
                  {!isOnline ? (
                    <>
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 text-3xl mx-auto border border-white/5">
                        <i className="fa-solid fa-satellite-dish"></i>
                      </div>
                      <h3 className="font-serif text-3xl italic text-white">Go online to start earning</h3>
                      <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Delivery requests in your current Houston neighborhood will appear here when you're online.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-[#C48B8B] rounded-3xl flex items-center justify-center text-white text-3xl mx-auto shadow-lg relative z-10">
                        <i className="fa-solid fa-radar animate-spin-slow"></i>
                      </div>
                      <h3 className="font-serif text-3xl italic text-white">Searching for Runns...</h3>
                      <p className="text-[10px] font-black text-[#C48B8B] uppercase tracking-[0.3em]">Live Dispatch Active</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {view === 'ADMIN' && (
              <AdminCommandCenter 
                onClose={() => { setView('HOME'); setRole('CUSTOMER'); setIsAuthenticated(false); }} 
                orders={[]} 
                applications={allDriverApps}
                appRole={role === 'OWNER' ? 'OWNER' : 'ADMIN'}
                onApproveApplication={(email) => {
                  const updated = allDriverApps.map(a => a.email === email ? { ...a, status: 'APPROVED' as any } : a);
                  setAllDriverApps(updated);
                  if (driverApp?.email === email) setDriverApp({ ...driverApp, status: 'APPROVED' as any });
                }}
                onRejectApplication={(email) => {
                  const updated = allDriverApps.map(a => a.email === email ? { ...a, status: 'REJECTED' as any } : a);
                  setAllDriverApps(updated);
                  if (driverApp?.email === email) setDriverApp({ ...driverApp, status: 'REJECTED' as any });
                }}
              />
            )}

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
                      <div key={v.id} onClick={() => { setSelectedVendor({ ...v, image: localStoreImages[v.id] || v.image }); setView('VENDOR'); }} className="group cursor-pointer">
                        <div className="relative h-72 w-full rounded-[48px] overflow-hidden shadow-2xl border border-[#EDE4DB]">
                          <img 
                            src={localStoreImages[v.id] || v.image} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            alt={v.name} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACKS.storefront;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent p-10 flex flex-col justify-end">
                            <h3 className="font-serif text-4xl italic text-white">{v.name}</h3>
                            <p className="text-[10px] font-black uppercase text-[#C48B8B] tracking-widest mt-2">{v.neighborhood} Store • {v.zipCode}</p>
                          </div>
                        </div>
                      </div>
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
                      <i className="fa-solid fa-map-pin"></i> {searchResults.length} Neighborhood Hubs in {selectedZip || 'Houston'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  <button 
                    onClick={() => setSelectedCategoryFilter(null)}
                    className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${!selectedCategoryFilter ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-400 border-gray-100 shadow-sm'}`}
                  >
                    All Stores
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategoryFilter === cat ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-400 border-gray-100 shadow-sm'}`}
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
                      onSelect={() => { setSelectedVendor({ ...v, image: localStoreImages[v.id] || v.image }); setView('VENDOR'); }} 
                      onGenerateImage={() => generateStoreImage(v)}
                      isGenerating={isGeneratingImage === v.id}
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
                    <div className="flex items-center gap-2 justify-end mt-2">
                       {selectedVendor?.isAIVerified && <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"><i className="fa-solid fa-shield-check"></i> AI Verified Hub</span>}
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B]">{selectedVendor?.neighborhood}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] overflow-hidden shadow-luxury border border-[#1A1A1A]/5">
                  <div className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C48B8B]">About this Neighborhood Hub</h4>
                        <p className="text-sm font-medium leading-relaxed text-[#1A1A1A]/70 italic">
                          {selectedVendor?.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest">{selectedVendor?.deliveryTime} Delivery</span>
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{selectedVendor?.address}</span>
                      </div>
                    </div>
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
                          {categoryProducts.map(p => {
                            const dynamicPrice = selectedVendor ? calculateDynamicProductPrice(p, selectedVendor) : p.priceRange;
                            return (
                              <div key={p.id} onClick={() => setConfigProduct({ ...p, priceRange: dynamicPrice })} className="bg-white p-6 rounded-[40px] flex items-center gap-6 border border-[#1A1A1A]/5 shadow-sm hover:border-[#C48B8B] transition-all cursor-pointer group relative overflow-hidden active:scale-98">
                                <ProductBadge product={p} />
                                <div className="w-28 h-40 shrink-0 relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                                  <img 
                                    src={p.image} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    alt={p.name}
                                    onError={(e) => {
                                      if (p.fallbackImage) (e.target as HTMLImageElement).src = p.fallbackImage;
                                      else (e.target as HTMLImageElement).src = FALLBACKS.product;
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                <div className="flex-1 space-y-1 flex flex-col justify-center">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#C48B8B]">{p.brand}</span>
                                    {p.stockLevel !== undefined && p.stockLevel < 20 && (
                                      <span className="text-[7px] font-black text-red-500 uppercase">{p.stockLevel} left</span>
                                    )}
                                  </div>
                                  <h4 className="font-black text-[14px] uppercase text-[#1A1A1A] leading-tight group-hover:text-[#C48B8B] transition-colors">{p.name}</h4>
                                  <p className="text-[9px] font-medium text-gray-400 line-clamp-1">{p.tagline}</p>
                                  <div className="flex items-center gap-2 pt-3">
                                    <div className="flex flex-col">
                                      {p.isOnSale && p.salePrice && (
                                        <span className="text-[9px] font-bold text-gray-300 line-through">${dynamicPrice.min.toFixed(2)}</span>
                                      )}
                                      <span className="text-sm font-black text-[#1A1A1A]">
                                        ${p.isOnSale && p.salePrice ? p.salePrice.toFixed(2) : dynamicPrice.min.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="ml-auto w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                                      <i className="fa-solid fa-plus"></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </main>
        </>
      )}
    </div>
  );
};

const VendorCard: React.FC<{ 
  vendor: BeautyVendor, 
  onSelect: () => void, 
  onGenerateImage?: () => void,
  isGenerating?: boolean,
  isLocal?: boolean 
}> = ({ vendor, onSelect, onGenerateImage, isGenerating, isLocal }) => (
  <div onClick={onSelect} className={`bg-white p-6 rounded-[40px] border transition-all cursor-pointer group animate-slideUp ${isLocal ? 'border-[#C48B8B] shadow-xl scale-[1.02]' : 'border-[#1A1A1A]/5 shadow-luxury hover:border-[#C48B8B]'}`}>
    <div className="relative h-56 w-full rounded-[32px] overflow-hidden mb-6 border border-[#1A1A1A]/5 bg-gray-50 flex items-center justify-center">
      <img 
        src={vendor.image} 
        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isGenerating ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
        alt={vendor.name} 
        onError={(e) => {
          (e.target as HTMLImageElement).src = FALLBACKS.storefront;
        }}
      />
      
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-40">
        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-4 text-white">
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Distance</span>
            <span className="text-[11px] font-black">{vendor.distance?.toFixed(1) || '0.0'} mi</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-widest opacity-40">Delivery</span>
            <span className="text-[11px] font-black">{vendor.deliveryTime}</span>
          </div>
        </div>
      </div>

      {isLocal && (
        <div className="absolute top-4 right-4 bg-[#C48B8B] text-white px-4 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest z-20">
          <i className="fa-solid fa-house-chimney"></i> Neighborhood Hub
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent"></div>
    </div>
    
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="font-serif text-3xl italic text-[#1A1A1A] group-hover:text-[#C48B8B] transition-colors leading-tight">{vendor.name}</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest truncate">{vendor.address}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="flex items-center gap-0.5 justify-end">
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className={`fa-solid fa-star text-[10px] ${star <= Math.round(vendor.rating) ? 'text-[#C48B8B]' : 'text-gray-200'}`}></i>
            ))}
          </div>
          <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{vendor.rating} / 5.0</span>
        </div>
      </div>
    </div>
  </div>
);

export default App;
