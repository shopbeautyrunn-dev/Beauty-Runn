import React, { useState, useMemo, useEffect } from 'react';
import { 
  BeautyVendor, Product, CartItem, Order, OrderStatus, 
  AppNotification, OrderFees, AppRole, DriverApplication, 
  DeliverySpeed, Area 
} from './types';
import { VENDORS, PRODUCTS, AREAS, ZIP_CODES } from './constants';
import DriverOnboarding from './components/DriverOnboarding';
import AIConcierge from './components/AIConcierge';
import TrackingMap from './components/TrackingMap';
import ChatInterface from './components/ChatInterface';
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

const CartModal: React.FC<{ 
  items: CartItem[], 
  onClose: () => void, 
  onRemove: (id: string) => void,
  onCheckout: () => void,
  vendor: BeautyVendor | null
}> = ({ items, onClose, onRemove, onCheckout, vendor }) => {
  const fees = useMemo(() => {
    if (!vendor) return null;
    return calculateOrderFees(items, vendor);
  }, [items, vendor]);

  return (
    <div className="fixed inset-0 z-[600] bg-[#1A1A1A]/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-3xl italic">Your Runn</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order from {vendor?.name}</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-black">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <i className="fa-solid fa-bag-shopping text-5xl text-gray-100"></i>
              <p className="text-[10px] font-black uppercase text-gray-400">Your bag is empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-3xl group relative">
                <img src={item.image} className="w-20 h-20 object-cover rounded-2xl bg-white border border-black/5" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] font-black text-[#C48B8B] uppercase tracking-widest">${item.priceRange.max}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Qty: {item.quantity}</span>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-all border border-red-50">
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && fees && (
          <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Items Subtotal</span>
                <span>${fees.shelfPriceEstimate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Runn Delivery Fee</span>
                <span>${fees.runnFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>Service Fee</span>
                <span>${fees.serviceFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Hold Total</p>
                <p className="text-3xl font-serif italic text-[#1A1A1A]">${fees.authHoldTotal.toFixed(2)}</p>
              </div>
              <button onClick={onCheckout} className="bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl rose-glow">
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ZipSearchModal: React.FC<{ onSearch: (zip: string) => void, onClose: () => void }> = ({ onSearch, onClose }) => {
  const [zip, setZip] = useState('');
  return (
    <div className="fixed inset-0 z-[700] bg-[#1A1A1A]/60 backdrop-blur-md flex items-center justify-center p-8 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-[60px] p-12 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B8B]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-[#EDE4DB] rounded-3xl flex items-center justify-center text-[#C48B8B] text-3xl mx-auto shadow-inner">
            <i className="fa-solid fa-location-dot animate-bounce"></i>
          </div>
          <h3 className="font-serif text-3xl italic">Find Local Shops</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enter your Houston ZIP</p>
        </div>
        <div className="space-y-4">
          <input 
            type="text" 
            maxLength={5}
            placeholder="e.g. 77004"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
            className="w-full p-8 bg-gray-50 rounded-[32px] outline-none text-center font-serif text-5xl italic border-2 border-transparent focus:border-[#C48B8B]/20 transition-all shadow-inner"
          />
          <button 
            disabled={zip.length !== 5}
            onClick={() => onSearch(zip)}
            className="w-full py-6 bg-[#1A1A1A] text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl rose-glow transition-all active:scale-95 disabled:bg-gray-100"
          >
            Locate Runners
          </button>
        </div>
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors"><i className="fa-solid fa-xmark"></i></button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'HOME' | 'STOREFRONT' | 'SEARCH_RESULTS' | 'TRACKING' | 'RUNNER_PORTAL'>('HOME');
  const [selectedZip, setSelectedZip] = useState<string>('');
  const [detectedArea, setDetectedArea] = useState<Area | null>(null);
  
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isDriverOnboardingOpen, setIsDriverOnboardingOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<BeautyVendor | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [userRole, setUserRole] = useState<AppRole>('CUSTOMER');

  const searchResults = useMemo(() => {
    if (!selectedZip) return [];
    return getStoresByZip(selectedZip, 10);
  }, [selectedZip]);

  const userCoords = useMemo(() => {
    if (!selectedZip) return undefined;
    const z = ZIP_CODES.find(x => x.zip === selectedZip);
    return z ? { lat: z.lat, lng: z.lng } : undefined;
  }, [selectedZip]);

  const handleZipSearch = async (zip: string) => {
    setSelectedZip(zip);
    setIsZipModalOpen(false);
    setView('SEARCH_RESULTS');
    setDetectedArea(findAreaByZip(zip));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: "Added to Bag",
      body: `${product.name} is ready for delivery.`,
      type: 'success',
      timestamp: Date.now()
    }, ...prev]);
  };

  const handleCheckout = () => {
    if (!selectedVendor) return;
    const fees = calculateOrderFees(cart, selectedVendor);
    const newOrder: Order = {
      id: `RUNN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: cart,
      fees,
      status: OrderStatus.PENDING,
      customerId: 'current-user',
      vendorId: selectedVendor.id,
      timestamp: Date.now(),
      address: 'Simulated Houston Residence',
      allowSubstitutes: true
    };
    setActiveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setView('TRACKING');
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: "Runn Dispatched",
      body: "A Runner is heading to the boutique.",
      type: 'success',
      timestamp: Date.now()
    }, ...prev]);
  };

  const handleDriverOnboardingComplete = (data: DriverApplication) => {
    setIsDriverOnboardingOpen(false);
    setUserRole('DRIVER');
    setView('RUNNER_PORTAL');
    setNotifications(prev => [{
      id: Date.now().toString(),
      title: "Runner Profile Active",
      body: "Welcome to the Beauty Runn fleet.",
      type: 'success',
      timestamp: Date.now()
    }, ...prev]);
  };

  const resetToHome = () => {
    setView('HOME');
    setSelectedZip('');
    setDetectedArea(null);
  };

  if (showSplash) return (
    <div className="fixed inset-0 z-[1000] bg-[#EDE4DB] flex flex-col items-center justify-center animate-fadeIn" onClick={() => setShowSplash(false)}>
      <div className="text-center space-y-8 animate-splash-logo flex flex-col items-center">
        <h1 className="font-serif text-9xl text-[#1A1A1A] italic border-b-2 border-[#C48B8B]">B</h1>
        <h2 className="text-[#1A1A1A] font-black text-2xl uppercase tracking-[0.3em]">Beauty Runn</h2>
        <p className="text-[#1A1A1A] text-[10px] font-bold uppercase tracking-widest opacity-60">Glow On. We'll Handle It.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EDE4DB] flex flex-col font-inter safe-top pb-32">
      {notifications.map(n => (
        <NotificationToast key={n.id} notification={n} onDismiss={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} />
      ))}

      {/* Primary Overlays */}
      {isCartOpen && (
        <CartModal 
          items={cart} 
          onClose={() => setIsCartOpen(false)} 
          onRemove={(id) => setCart(prev => prev.filter(x => x.id !== id))}
          onCheckout={handleCheckout}
          vendor={selectedVendor}
        />
      )}
      {isChatOpen && activeOrder && (
        <ChatInterface 
          recipientName={userRole === 'CUSTOMER' ? "Runner Jay" : "Customer Sarah"} 
          onClose={() => setIsChatOpen(false)} 
          role={userRole === 'CUSTOMER' ? 'CUSTOMER' : 'DRIVER'}
        />
      )}
      {isConciergeOpen && (
        <AIConcierge 
          onClose={() => setIsConciergeOpen(false)} 
          userCoords={userCoords}
        />
      )}
      
      {/* Navigation */}
      <nav className="px-8 py-6 flex items-center justify-between sticky top-0 z-[100] bg-[#EDE4DB]/95 backdrop-blur-xl border-b border-[#1A1A1A]/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetToHome}>
          <h2 className="font-serif text-3xl italic text-[#1A1A1A]">B</h2>
          <span className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Runn</span>
        </div>
        <div className="flex items-center gap-4">
          {cart.length > 0 && (
            <button onClick={() => setIsCartOpen(true)} className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/5 active:scale-90 transition-all">
              <i className="fa-solid fa-bag-shopping text-[#C48B8B]"></i>
              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>
            </button>
          )}
          {userRole === 'DRIVER' ? (
            <button onClick={() => setView('RUNNER_PORTAL')} className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest">Runner View</button>
          ) : (
            selectedZip && (
              <button onClick={() => setIsZipModalOpen(true)} className="bg-white/50 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-sm">
                <i className="fa-solid fa-location-dot mr-2 text-[#C48B8B]"></i>
                {selectedZip}
              </button>
            )
          )}
        </div>
      </nav>

      <main className="px-8 py-10 max-w-5xl mx-auto w-full flex-1">
        {view === 'HOME' && (
          <div className="animate-fadeIn space-y-12">
            <header className="text-center py-10 space-y-6">
              <h2 className="font-serif text-6xl italic text-[#1A1A1A] leading-tight uppercase">Neighborhood<br/>Beauty Delivery.</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C48B8B]">Real People. Local Shops. Fast Runns.</p>
            </header>

            <div className="max-w-xl mx-auto space-y-10">
               {/* Primary Zip Search Card */}
               <div className="bg-white p-12 rounded-[50px] shadow-luxury border border-[#1A1A1A]/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B8B]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="font-serif text-3xl italic">Order a Runn</h3>
                       <div className="w-12 h-12 bg-[#EDE4DB] rounded-2xl flex items-center justify-center text-[#C48B8B]"><i className="fa-solid fa-cart-shopping"></i></div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Enter your ZIP to find nearby independent boutiques</p>
                    <button 
                      onClick={() => setIsZipModalOpen(true)}
                      className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl rose-glow transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                       Start Shopping <i className="fa-solid fa-arrow-right-long"></i>
                    </button>
                  </div>
               </div>

               {/* Become a Runner Card */}
               <div className="bg-[#1A1A1A] p-12 rounded-[50px] shadow-luxury relative overflow-hidden group cursor-pointer" onClick={() => setIsDriverOnboardingOpen(true)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                     <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white text-2xl"><i className="fa-solid fa-car-side"></i></div>
                     <div className="text-center md:text-left flex-1">
                        <h3 className="font-serif text-3xl italic text-white">Join the Runners</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Earn delivery fees shopping in your neighborhood</p>
                     </div>
                     <i className="fa-solid fa-chevron-right text-white/20 group-hover:text-white transition-colors"></i>
                  </div>
               </div>

               {/* AI Concierge Card - Supplemental */}
               <div className="bg-[#EDE4DB] p-10 rounded-[40px] border border-[#1A1A1A]/5 text-center space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Can't find a specific item?</h4>
                  <button 
                    onClick={() => setIsConciergeOpen(true)}
                    className="text-[11px] font-black uppercase tracking-widest text-[#C48B8B] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-3 mx-auto"
                  >
                    <i className="fa-solid fa-sparkles"></i> Ask the AI Concierge
                  </button>
               </div>
            </div>
          </div>
        )}

        {view === 'SEARCH_RESULTS' && (
          <div className="animate-fadeIn space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C48B8B] mb-2">{detectedArea?.area_name || "Houston Zone"}</h1>
                <h2 className="font-serif text-5xl italic text-[#1A1A1A] leading-none">Local Shops</h2>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
              {searchResults.length > 0 ? (
                searchResults.map(v => (
                  <div key={v.id} onClick={() => { setSelectedVendor(v); setView('STOREFRONT'); }} className="bg-white p-6 rounded-[40px] border border-black/5 flex items-center gap-6 cursor-pointer hover:shadow-xl transition-all group">
                    <div className="w-32 h-32 shrink-0 rounded-3xl overflow-hidden bg-gray-50">
                      <img src={v.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                         <h3 className="font-serif text-3xl italic leading-none group-hover:text-[#C48B8B] transition-colors">{v.name}</h3>
                         <span className="text-[10px] font-black text-[#1A1A1A]"><i className="fa-solid fa-star text-[#C48B8B] mr-1"></i> {v.rating}</span>
                      </div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{v.address}</p>
                      <div className="flex items-center gap-3 pt-2">
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Delivered in {v.deliveryTime}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{v.neighborhood}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center space-y-8 bg-white/40 rounded-[60px] border border-dashed border-gray-200">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 text-3xl">
                      <i className="fa-solid fa-store-slash"></i>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase text-gray-400">No boutiques found in this ZIP yet</p>
                      <button onClick={() => setIsConciergeOpen(true)} className="bg-[#1A1A1A] text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest">Ask AI to find one</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'STOREFRONT' && selectedVendor && (
          <div className="animate-fadeIn space-y-12">
            <button onClick={() => setView('SEARCH_RESULTS')} className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#1A1A1A] shadow-sm active:scale-90 transition-all border border-gray-100"><i className="fa-solid fa-arrow-left"></i></button>
            
            <header className="flex flex-col md:flex-row gap-12">
               <div className="w-full md:w-2/5 aspect-[4/5] rounded-[60px] overflow-hidden border border-black/5 shadow-luxury relative">
                 <img src={selectedVendor.image} className="w-full h-full object-cover" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 via-transparent to-transparent"></div>
                 <div className="absolute bottom-10 left-10 text-white">
                    <h1 className="font-serif text-5xl italic leading-tight">{selectedVendor.name}</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-2">{selectedVendor.neighborhood}</p>
                 </div>
               </div>
               <div className="flex-1 space-y-10 py-4">
                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl italic text-[#1A1A1A]">Available Today</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Browse neighborhood staples for Runner pickup</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PRODUCTS.map(product => (
                      <div key={product.id} className="bg-white p-6 rounded-[40px] border border-black/5 shadow-sm space-y-4 group">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-black/5">
                           <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{product.name}</h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase mt-1">{product.brand}</p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-[11px] font-black text-[#C48B8B] tracking-widest">${product.priceRange.max}</span>
                            <button onClick={() => addToCart(product)} className="w-10 h-10 bg-[#1A1A1A] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </header>
          </div>
        )}

        {view === 'TRACKING' && activeOrder && (
          <div className="animate-fadeIn space-y-12">
            <header className="text-center">
              <span className="bg-[#EDE4DB] text-[#C48B8B] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Order # {activeOrder.id}</span>
              <h2 className="font-serif text-5xl italic">Runn in Progress</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 aspect-[16/9] md:aspect-auto h-[500px] rounded-[60px] overflow-hidden shadow-luxury border border-black/5">
                <TrackingMap status="IN_TRANSIT" />
              </div>
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[50px] border border-black/5 shadow-sm space-y-6">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#EDE4DB] rounded-[24px] flex items-center justify-center text-[#C48B8B] text-2xl">
                        <i className="fa-solid fa-person-running"></i>
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase tracking-widest">Runner Jay</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">4.9 Star Neighbor</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setIsChatOpen(true)} className="flex-1 py-4 bg-[#F9F6F3] rounded-2xl text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-black/5 active:scale-95 transition-all">
                        <i className="fa-solid fa-message mr-2"></i> Message
                      </button>
                      <button className="flex-1 py-4 bg-[#F9F6F3] rounded-2xl text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border border-black/5 active:scale-95 transition-all">
                        <i className="fa-solid fa-phone mr-2"></i> Call
                      </button>
                   </div>
                </div>

                <div className="bg-[#1A1A1A] p-10 rounded-[50px] shadow-2xl space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B8B] rounded-full blur-[80px] opacity-20"></div>
                   <div className="space-y-6 relative z-10 text-white">
                      {[
                        { time: '12:45 PM', status: 'Runn Accepted', completed: true },
                        { time: '12:52 PM', status: 'At Store - Picking Up', completed: true },
                        { time: 'Est. 1:10 PM', status: 'Heading to You', completed: false },
                      ].map((step, i) => (
                        <div key={i} className="flex gap-6">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${step.completed ? 'bg-[#C48B8B]' : 'bg-white/20'}`}></div>
                            {i < 2 && <div className={`w-0.5 h-10 ${step.completed ? 'bg-[#C48B8B]/40' : 'bg-white/10'}`}></div>}
                          </div>
                          <div>
                            <p className="text-[8px] font-black text-[#C48B8B] uppercase tracking-widest">{step.time}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${step.completed ? 'text-white' : 'text-white/40'}`}>{step.status}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'RUNNER_PORTAL' && (
          <div className="animate-fadeIn space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <span className="bg-[#1A1A1A] text-[#C48B8B] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Partner ID: RUNN-9981</span>
                <h2 className="font-serif text-5xl italic leading-none">Available Neighborhood Runns</h2>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-6 py-3 bg-green-50 rounded-full border border-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase text-green-600 tracking-widest">Online</span>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { id: 'R-1024', store: 'Beauty Empire - Almeda', zone: '001 (Third Ward)', payout: 8.50, items: 3, dist: 1.2 },
                 { id: 'R-1025', store: 'Beauty Empire - Griggs', zone: '003 (South)', payout: 12.00, items: 7, dist: 4.5 }
               ].map(runn => (
                 <div key={runn.id} className="bg-white p-10 rounded-[50px] border border-black/5 shadow-luxury flex flex-col justify-between group hover:border-[#C48B8B] transition-all">
                    <div className="space-y-6">
                       <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif text-3xl italic text-[#1A1A1A] group-hover:text-[#C48B8B] transition-colors">{runn.store}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">{runn.zone}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-2xl font-black text-[#1A1A1A]">${runn.payout.toFixed(2)}</p>
                             <p className="text-[8px] font-black text-[#C48B8B] uppercase tracking-widest">Runner Pay</p>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => { 
                      setActiveOrder({ id: runn.id, items: [], fees: {} as any, status: OrderStatus.PENDING, customerId: 'Sarah', vendorId: 'any', timestamp: Date.now(), address: '123 Test St', allowSubstitutes: true });
                      setIsChatOpen(true);
                    }} className="mt-10 w-full py-6 bg-[#1A1A1A] text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl rose-glow transition-all active:scale-95">Accept Runn</button>
                 </div>
               ))}
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