
import React, { useState, useMemo, useEffect } from 'react';
import { BeautyVendor, Product, CartItem, Order, OrderStatus, AppNotification, OrderFees, AppRole } from './types';
import { VENDORS, PRODUCTS, CATEGORIES, FALLBACKS } from './constants';
import TrackingMap from './components/TrackingMap';
import VendorMap from './components/VendorMap';
import { calculateDistance, HOUSTON_ZIP_COORDS, validateStoresWithGemini } from './services/locationService';
import { generateStorefrontImage, validateStoreAuthenticity } from './services/geminiService';
import { calculateDynamicProductPrice, calculateOrderFees } from './services/pricingService';

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
  const [isStoreInfoVisible, setIsStoreInfoVisible] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<BeautyVendor | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [localStoreImages, setLocalStoreImages] = useState<Record<string, string>>({});
  const [verifiedStores, setVerifiedStores] = useState<Record<string, Partial<BeautyVendor>>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);

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
      list = list.filter(v => v.categories.includes(selectedCategoryFilter));
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
              onClick={() => { setRole('DRIVER'); setIsAuthenticated(true); }} 
              className="w-full bg-transparent text-[#1A1A1A] border border-[#1A1A1A] py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
            >
              Become a Runner
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
              <button onClick={() => setIsZipModalOpen(true)} className="bg-white/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm active:scale-95 transition-all">
                <i className="fa-solid fa-location-dot mr-2 text-[#C48B8B]"></i>
                {selectedZip || 'Search By Zip code'}
              </button>
            </div>
          </nav>

          <main className="px-8 py-10 max-w-5xl mx-auto w-full">
            {view === 'HOME' ? (
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
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B] cursor-pointer" onClick={() => setView('SEARCH_RESULTS')}>See All Stores</span>
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
                <div>
                  <h2 className="font-serif text-6xl italic text-[#1A1A1A]">Store Selection</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-3 flex items-center gap-3">
                    <i className="fa-solid fa-map-pin"></i> {searchResults.filter(v => v.zipCode === selectedZip).length} Neighborhood Hubs in {selectedZip}
                  </p>
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
                              <div key={p.id} onClick={() => setConfigProduct({ ...p, priceRange: dynamicPrice })} className="bg-white p-6 rounded-[40px] flex items-center gap-6 border border-[#1A1A1A]/5 shadow-sm hover:border-[#C48B8B] transition-all cursor-pointer group relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border border-amber-200 z-10"><i className="fa-solid fa-box"></i> Retail Verified</div>
                                <img 
                                  src={p.image} 
                                  className="w-28 h-36 rounded-2xl object-cover bg-gray-50 border border-gray-100" 
                                  alt={p.name}
                                  onError={(e) => {
                                    if (p.fallbackImage) (e.target as HTMLImageElement).src = p.fallbackImage;
                                  }}
                                />
                                <div className="flex-1 space-y-1">
                                  <h4 className="font-black text-[13px] uppercase text-[#1A1A1A]">{p.name}</h4>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B]">{p.brand}</p>
                                  <div className="flex items-center gap-2 pt-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Local Price:</span>
                                    <span className="text-sm font-black text-[#1A1A1A]">${dynamicPrice.min.toFixed(2)}</span>
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
            ) : view === 'CHECKOUT' ? (
              <div className="animate-fadeIn max-w-xl mx-auto space-y-12">
                <h2 className="font-serif text-5xl italic text-[#1A1A1A] text-center">Review My Runn</h2>
                <div className="bg-white p-8 rounded-[48px] shadow-luxury border border-[#1A1A1A]/5">
                  <div className="space-y-6 mb-10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#C48B8B]">Sourcing from neighborhood anchor: {selectedVendor?.name}</p>
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <img src={item.image} className="w-12 h-16 object-cover rounded-xl" alt="" />
                          <div className="flex flex-col">
                             <span className="text-xs font-black uppercase tracking-tight text-[#1A1A1A]">{item.name}</span>
                             <span className="text-[9px] font-bold text-gray-400 uppercase">{item.brand} • {item.quantity}x</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#1A1A1A]/40">${(item.priceRange.max * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <FeeBreakdown fees={calculatedFees} />
                </div>
                <button onClick={handlePlaceOrder} className="w-full bg-[#1A1A1A] text-white py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-[#C48B8B] transition-all rose-glow">Confirm Order & Dispatch</button>
              </div>
            ) : view === 'TRACKING' ? (
              <div className="animate-fadeIn space-y-10">
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="font-serif text-5xl italic text-[#1A1A1A]">Live Tracking</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C48B8B] mt-2">Verified Sourcing in Progress</p>
                  </div>
                  <div className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Runner Dispatched</div>
                </header>
                <div className="h-80 rounded-[48px] overflow-hidden shadow-2xl border border-[#EDE4DB]"><TrackingMap status={currentOrder?.status || ''} /></div>
              </div>
            ) : null}
          </main>

          {cart.length > 0 && view !== 'CHECKOUT' && view !== 'TRACKING' && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#1A1A1A] rounded-[40px] px-10 py-6 flex justify-between items-center z-[200] shadow-2xl border border-white/5 backdrop-blur-md">
               <div className="flex flex-col"><span className="text-[10px] font-black text-white/40 uppercase">Est. Total</span><span className="text-lg font-black text-white">${calculatedFees.authHoldTotal.toFixed(2)}</span></div>
               <button onClick={() => setView('CHECKOUT')} className="bg-[#C48B8B] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase">Review Runn List</button>
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
                    className="w-24 h-32 rounded-2xl object-cover shadow-xl border border-white/10" 
                    alt={configProduct.name}
                  />
                  <div>
                    <h2 className="font-serif text-4xl italic leading-tight">{configProduct.name}</h2>
                    <p className="text-[10px] font-black uppercase text-[#C48B8B] flex items-center gap-2 mt-2">
                       <i className="fa-solid fa-circle-check text-[8px]"></i> Retail Packaging Verified
                    </p>
                  </div>
                </div>
                <button onClick={() => setConfigProduct(null)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:text-[#C48B8B] transition-all"><i className="fa-solid fa-xmark"></i></button>
             </div>
             
             <div className="space-y-4">
               <div className="p-6 bg-white/50 rounded-3xl border border-black/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Local Retail Estimate</p>
                      <p className="text-2xl font-black text-[#1A1A1A]">${configProduct.priceRange.min.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed text-[#1A1A1A]/70 italic">
                    We match the actual retail sleeve and branding of {configProduct.brand}. Your runner will verify this exact packaging at the neighborhood store.
                  </p>
               </div>
             </div>

             <button onClick={() => { setCart([...cart, { ...configProduct, quantity: 1 }]); setConfigProduct(null); }} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95">Add to My Runn List</button>
          </div>
        </div>
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
  <div onClick={onSelect} className={`bg-white p-6 rounded-[40px] border transition-all cursor-pointer group animate-slideUp ${isLocal ? 'border-[#C48B8B] shadow-xl' : 'border-[#1A1A1A]/5 shadow-luxury hover:border-[#C48B8B]'}`}>
    <div className="relative h-48 w-full rounded-[32px] overflow-hidden mb-6 border border-[#1A1A1A]/5 bg-gray-50">
      <img 
        src={vendor.image} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        alt={vendor.name} 
      />
      {isLocal && (
        <div className="absolute top-4 right-4 bg-[#C48B8B] text-white px-4 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest z-20">
          <i className="fa-solid fa-house-chimney"></i> Neighborhood Hub
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent"></div>
    </div>
    
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="font-serif text-2xl italic text-[#1A1A1A] group-hover:text-[#C48B8B] transition-colors">{vendor.name}</h3>
          <p className="text-[9px] font-medium text-gray-400 mt-1 uppercase tracking-widest truncate">{vendor.address}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-0.5 justify-end mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <i key={star} className={`fa-solid fa-star text-[10px] ${star <= Math.round(vendor.rating) ? 'text-[#C48B8B]' : 'text-gray-200'}`}></i>
            ))}
          </div>
          <p className="text-[9px] font-black text-[#C48B8B] uppercase tracking-widest">{vendor.deliveryTime}</p>
        </div>
      </div>
    </div>
  </div>
);

export default App;
