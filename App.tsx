
import React, { useState, useMemo, useEffect } from 'react';
import { BeautyVendor, Product, CartItem, Order, OrderStatus, AppNotification, OrderFees, AppRole } from './types';
import { VENDORS, PRODUCTS, CATEGORIES, FALLBACKS } from './constants';
import TrackingMap from './components/TrackingMap';
import VendorMap from './components/VendorMap';
import { calculateDistance, HOUSTON_ZIP_COORDS, validateStoresWithGemini } from './services/locationService';

// --- SHARED COMPONENTS ---

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
  const [view, setView] = useState<'HOME' | 'VENDOR' | 'CHECKOUT' | 'TRACKING' | 'SEARCH_RESULTS'>('HOME');
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

  const calculatedFees = useMemo((): OrderFees => {
    const shelfEst = cart.reduce((acc, item) => acc + (item.priceRange.max * item.quantity), 0);
    const runnerBase = 4.99;
    const runnerDistance = 2.50; 
    const serviceFlat = 2.99;
    const serviceVariable = shelfEst * 0.05;
    const runnFee = runnerBase + runnerDistance;
    const serviceFee = serviceFlat + serviceVariable;
    return { shelfPriceEstimate: shelfEst, runnFee, serviceFee, authHoldTotal: shelfEst + runnFee + serviceFee };
  }, [cart]);

  const searchResults = useMemo(() => {
    const userCoords = HOUSTON_ZIP_COORDS[selectedZip] || HOUSTON_ZIP_COORDS['77002'];
    
    return VENDORS.map(v => ({
      ...v,
      distance: calculateDistance(userCoords.lat, userCoords.lng, v.lat, v.lng)
    })).sort((a, b) => {
      // Logic: Exact ZIP matches always come first
      if (a.zipCode === selectedZip && b.zipCode !== selectedZip) return -1;
      if (b.zipCode === selectedZip && a.zipCode !== selectedZip) return 1;

      // Secondary sort based on user preference
      if (sortBy === 'DISTANCE') return (a.distance || 0) - (b.distance || 0);
      if (sortBy === 'AVAILABILITY') return b.categories.length - a.categories.length;
      if (sortBy === 'FASTEST') return (a.velocity || 0) - (b.velocity || 0);
      return 0;
    });
  }, [selectedZip, sortBy]);

  const handleZipSearch = async (zip: string) => {
    if (zip.length === 5) {
      setSelectedZip(zip);
      setIsZipModalOpen(false);
      setView('SEARCH_RESULTS');
      validateStoresWithGemini(zip).catch(console.error);
    }
  };

  const addNotification = (title: string, body: string) => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, body, type: 'order', timestamp: Date.now() };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: `BR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cart],
      fees: calculatedFees,
      status: OrderStatus.HOLD_PAID,
      customerId: 'user1',
      vendorId: selectedVendor?.id || 'v1',
      timestamp: Date.now(),
      address: selectedZip || 'Houston Service Area',
      allowSubstitutes: true,
      driverInfo: {
        name: "Marcus K.",
        image: "https://i.pravatar.cc/150?u=marcus",
        carModel: "Silver Sedan",
        rating: 4.9,
        phone: "713-555-0123"
      }
    };
    setCurrentOrder(newOrder);
    setCart([]);
    setView('TRACKING');
    addNotification("Runn Initiated", "Runner is heading to your neighborhood store.");
  };

  if (showSplash) return (
    <div className="fixed inset-0 z-[1000] bg-[#EDE4DB] flex flex-col items-center justify-center animate-fadeIn" onClick={() => setShowSplash(false)}>
      <div className="text-center space-y-8 animate-splash-logo">
        <h1 className="font-serif text-9xl text-[#1A1A1A] tracking-tighter italic">B</h1>
        <div className="space-y-2">
          <h2 className="text-[#1A1A1A] font-black text-2xl uppercase tracking-[0.3em]">Beauty Runn</h2>
          <p className="text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest opacity-60">Houston's Neighborhood Store Delivery</p>
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
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C48B8B] mb-16">Houston's Neighborhood Store Delivery</p>
          
          <div className="w-full max-w-xs space-y-4">
            <button 
              onClick={() => { setRole('CUSTOMER'); setIsAuthenticated(true); }} 
              className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95"
            >
              Order from a Local Store
            </button>
            <button 
              onClick={() => { setRole('DRIVER'); setIsAuthenticated(true); }} 
              className="w-full bg-transparent text-[#1A1A1A] border border-[#1A1A1A] py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
            >
              Become a Runner
            </button>
          </div>
          
          <p className="mt-12 text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/30">Serving Houston's Neighborhoods</p>
        </div>
      ) : (
        <>
          <nav className="px-8 py-6 flex items-center justify-between sticky top-0 z-[100] bg-[#EDE4DB]/95 backdrop-blur-xl border-b border-[#1A1A1A]/5">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
              <h2 className="font-serif text-3xl italic text-[#1A1A1A]">B</h2>
              <span className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Runn</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsZipModalOpen(true)} className="bg-white/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm active:scale-95 transition-all">
                <i className="fa-solid fa-location-dot mr-2 text-[#C48B8B]"></i>
                {selectedZip || 'Set Store Zip'}
              </button>
            </div>
          </nav>

          <main className="px-8 py-10 max-w-5xl mx-auto w-full">
            {view === 'HOME' ? (
              <div className="animate-fadeIn space-y-12">
                <header className="text-center py-10 space-y-4">
                  <h2 className="font-serif text-6xl md:text-7xl italic text-[#1A1A1A] shimmer-text leading-tight">Glow On.<br/>We’ll Handle It.</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C48B8B]">Neighborhood Store Delivery</p>
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
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B] cursor-pointer" onClick={() => setView('SEARCH_RESULTS')}>See All Stores</span>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                    {VENDORS.slice(0, 2).map(v => (
                      <div key={v.id} onClick={() => { setSelectedVendor(v); setView('VENDOR'); }} className="group cursor-pointer">
                        <div className="relative h-72 w-full rounded-[48px] overflow-hidden shadow-2xl border border-[#EDE4DB]">
                          <img 
                            src={v.image} 
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="font-serif text-6xl italic text-[#1A1A1A]">Store Selection</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-3 flex items-center gap-3">
                      <i className="fa-solid fa-map-pin"></i> {searchResults.filter(v => v.zipCode === selectedZip).length} Neighborhood Stores in {selectedZip}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="bg-white/80 p-1.5 rounded-2xl flex gap-1 border border-[#1A1A1A]/5 shadow-sm">
                      <button onClick={() => setSearchViewType('LIST')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchViewType === 'LIST' ? 'bg-[#1A1A1A] text-white shadow-xl' : 'text-[#1A1A1A]/40'}`}>List</button>
                      <button onClick={() => setSearchViewType('MAP')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${searchViewType === 'MAP' ? 'bg-[#1A1A1A] text-white shadow-xl' : 'text-[#1A1A1A]/40'}`}>Map</button>
                    </div>
                  </div>
                </div>

                {searchViewType === 'MAP' ? (
                  <VendorMap vendors={searchResults} userZip={selectedZip || 'HOU'} onSelectVendor={(v) => { setSelectedVendor(v); setView('VENDOR'); }} />
                ) : (
                  <div className="space-y-12">
                    {searchResults.filter(v => v.zipCode === selectedZip).length > 0 && (
                      <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C48B8B]">Stores in ZIP {selectedZip}</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          {searchResults.filter(v => v.zipCode === selectedZip).map(v => (
                            <VendorCard key={v.id} vendor={v} onSelect={() => { setSelectedVendor(v); setView('VENDOR'); }} isLocal />
                          ))}
                        </div>
                      </section>
                    )}

                    {searchResults.filter(v => v.zipCode !== selectedZip).length > 0 && (
                      <section className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]/30">Nearby Houston Areas</h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          {searchResults.filter(v => v.zipCode !== selectedZip).map(v => (
                            <VendorCard key={v.id} vendor={v} onSelect={() => { setSelectedVendor(v); setView('VENDOR'); }} />
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            ) : view === 'VENDOR' ? (
              <div className="animate-fadeIn space-y-10">
                <div className="flex justify-between items-center">
                  <button onClick={() => setView(selectedZip ? 'SEARCH_RESULTS' : 'HOME')} className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-sm active:scale-90 transition-all border border-gray-100 hover:text-[#C48B8B]"><i className="fa-solid fa-arrow-left"></i></button>
                  <div className="text-right">
                    <h3 className="font-serif text-4xl italic text-[#1A1A1A]">{selectedVendor?.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B]">{selectedVendor?.neighborhood} • Local Beauty Supply</p>
                    <p className="text-[9px] text-gray-400 font-medium">{selectedVendor?.address}</p>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  <button onClick={() => setSelectedCategoryFilter(null)} className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${!selectedCategoryFilter ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-400'}`}>Full Catalog</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategoryFilter(cat)} className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategoryFilter === cat ? 'bg-[#1A1A1A] text-white' : 'bg-white text-gray-400'}`}>{cat}</button>
                  ))}
                </div>

                <div className="space-y-14">
                  {CATEGORIES.filter(cat => !selectedCategoryFilter || selectedCategoryFilter === cat).map(cat => {
                    const categoryProducts = PRODUCTS.filter(p => p.category === cat);
                    if (categoryProducts.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-6">
                        <div className="flex items-center gap-4"><h4 className="font-serif text-2xl italic text-[#1A1A1A]">{cat}</h4><div className="h-px flex-1 bg-gray-200"></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {categoryProducts.map(p => (
                            <div key={p.id} onClick={() => setConfigProduct(p)} className="bg-white p-6 rounded-[40px] flex items-center gap-6 border border-[#1A1A1A]/5 shadow-sm hover:border-[#C48B8B] transition-all cursor-pointer group">
                              <img 
                                src={p.image} 
                                className="w-28 h-28 rounded-3xl object-cover" 
                                alt={p.name}
                                onError={(e) => {
                                  if (p.fallbackImage) (e.target as HTMLImageElement).src = p.fallbackImage;
                                }}
                              />
                              <div className="flex-1 space-y-1">
                                <h4 className="font-black text-[13px] uppercase text-[#1A1A1A]">{p.name}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B]">{p.tagline}</p>
                                <div className="flex items-center gap-2 pt-2"><span className="text-[10px] font-black text-gray-400 uppercase">Est. Price:</span><span className="text-sm font-black text-[#1A1A1A]">${p.priceRange.min.toFixed(2)}</span></div>
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
              <div className="animate-fadeIn max-w-xl mx-auto space-y-12">
                <h2 className="font-serif text-5xl italic text-[#1A1A1A] text-center">My Runn List</h2>
                <div className="bg-white p-8 rounded-[48px] shadow-luxury border border-[#1A1A1A]/5">
                  <div className="space-y-6 mb-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B]">Sourcing from: {selectedVendor?.name}</p>
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#EDE4DB] rounded-xl flex items-center justify-center text-[10px] font-black">{item.quantity}x</div>
                          <span className="text-xs font-black uppercase tracking-tight text-[#1A1A1A]">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-[#1A1A1A]/40">${(item.priceRange.max * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <FeeBreakdown fees={calculatedFees} />
                </div>
                <button onClick={handlePlaceOrder} className="w-full bg-[#1A1A1A] text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-[#C48B8B] transition-all rose-glow">Confirm Auth & Dispatch</button>
              </div>
            ) : view === 'TRACKING' ? (
              <div className="animate-fadeIn space-y-10">
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="font-serif text-5xl italic text-[#1A1A1A]">Live Tracking</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-2">Hold: ${currentOrder?.fees.authHoldTotal.toFixed(2)}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Order ID: {currentOrder?.id}</p>
                  </div>
                  <div className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Store Selection Made</div>
                </header>
                <div className="h-80 rounded-[48px] overflow-hidden shadow-2xl border border-[#EDE4DB]"><TrackingMap status={currentOrder?.status || ''} /></div>
              </div>
            ) : null}
          </main>

          {cart.length > 0 && view !== 'CHECKOUT' && view !== 'TRACKING' && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#1A1A1A] rounded-[40px] px-10 py-6 flex justify-between items-center z-[200] shadow-2xl border border-white/5 backdrop-blur-md">
               <div className="flex flex-col"><span className="text-[10px] font-black text-white/40 uppercase">Est. Hold</span><span className="text-lg font-black text-white">${calculatedFees.authHoldTotal.toFixed(2)}</span></div>
               <button onClick={() => setView('CHECKOUT')} className="bg-[#C48B8B] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase">Review List</button>
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
                  <img 
                    src={configProduct.image} 
                    className="w-24 h-24 rounded-2xl object-cover shadow-xl" 
                    alt={configProduct.name}
                    onError={(e) => {
                      if (configProduct.fallbackImage) (e.target as HTMLImageElement).src = configProduct.fallbackImage;
                    }}
                  />
                  <div>
                    <h2 className="font-serif text-4xl italic leading-tight">{configProduct.name}</h2>
                    <p className="text-[10px] font-black uppercase text-[#C48B8B]">{configProduct.tagline}</p>
                  </div>
                </div>
                <button onClick={() => setConfigProduct(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><i className="fa-solid fa-xmark"></i></button>
             </div>
             <div className="p-6 bg-white/50 rounded-3xl border border-black/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Local Stock Note</p>
                <p className="text-[11px] font-medium leading-relaxed">Neighborhood stores in {selectedVendor?.neighborhood} typically stock multiple brands for this product type.</p>
             </div>
             <button onClick={() => { setCart([...cart, { ...configProduct, quantity: 1 }]); setConfigProduct(null); addNotification("List Updated", "Added to your runn."); }} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow">Add to List</button>
          </div>
        </div>
      )}
    </div>
  );
};

// UI Component for Vendor Cards
const VendorCard: React.FC<{ vendor: BeautyVendor, onSelect: () => void, isLocal?: boolean }> = ({ vendor, onSelect, isLocal }) => (
  <div onClick={onSelect} className={`bg-white p-8 rounded-[50px] border transition-all cursor-pointer group animate-slideUp ${isLocal ? 'border-[#C48B8B] shadow-xl' : 'border-[#1A1A1A]/5 shadow-luxury hover:border-[#C48B8B]'}`}>
    <div className="flex items-center gap-6 mb-8">
      <div className="relative">
        <img 
          src={vendor.image} 
          className="w-24 h-24 rounded-[36px] object-cover group-hover:scale-105 transition-transform" 
          alt={vendor.name} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACKS.storefront;
          }}
        />
        {isLocal && (
          <div className="absolute -top-2 -right-2 bg-[#C48B8B] text-white w-8 h-8 rounded-full shadow-md flex items-center justify-center text-[14px]">
            <i className="fa-solid fa-house-chimney text-[10px]"></i>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-serif text-3xl italic text-[#1A1A1A]">{vendor.name}</h3>
        <p className="text-[9px] font-medium text-gray-400 mt-1">{vendor.address}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] bg-[#C48B8B]/10 px-3 py-1 rounded-full">{vendor.distance?.toFixed(1)} mi</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]/40">{vendor.deliveryTime}</span>
        </div>
      </div>
    </div>
    <div className="space-y-4">
       <div className="flex flex-wrap gap-2">
        {vendor.categories.map((cat, i) => (
          <span key={i} className="px-4 py-2 bg-[#EDE4DB]/30 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/60 border border-[#1A1A1A]/5">{cat}</span>
        ))}
      </div>
      <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/20">Verified ZIP {vendor.zipCode} Store</span>
         <i className="fa-solid fa-arrow-right text-[#C48B8B] group-hover:translate-x-2 transition-transform"></i>
      </div>
    </div>
  </div>
);

export default App;
