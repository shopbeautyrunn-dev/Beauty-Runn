
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppRole, BeautyVendor, Product, CartItem, Order, OrderStatus, CustomItem, AppNotification, TeamMember, DriverOnboardingStatus, DriverEarnings, Incentive } from './types';
import { VENDORS, PRODUCTS, COLORS, CITY_COORDS, ZIP_MAP, DRIVER_INCENTIVES } from './constants';
import TrackingMap from './components/TrackingMap';
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

const PrivacyBanner: React.FC<{ centered?: boolean }> = ({ centered = true }) => (
  <div className={`flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-6 ${centered ? 'mx-auto max-w-sm' : 'w-full'}`}>
    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink-600 shadow-sm shrink-0">
      <i className="fa-solid fa-user-shield text-[10px]"></i>
    </div>
    <div className="text-left">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-0.5">Privacy First</p>
      <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
        Your security is our priority. Beauty Runn ensures all personal and order data is encrypted, securely stored, and will <span className="text-pink-600">never be sold or disclosed</span> to third parties.
      </p>
    </div>
  </div>
);

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
  const [view, setView] = useState<'HOME' | 'VENDOR' | 'CHECKOUT' | 'TRACKING' | 'PROFILE' | 'ADMIN_DASHBOARD' | 'DRIVER_PORTAL'>('HOME');
  const [showStaffOptions, setShowStaffOptions] = useState(false);
  
  // Admin State
  const [adminSection, setAdminSection] = useState<'OVERVIEW' | 'LOGISTICS' | 'VENDORS' | 'TEAM' | 'CATALOG'>('OVERVIEW');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Aaliyah J.', email: 'admin@beautyrunn.com', role: 'ADMIN', lastActive: Date.now() }
  ]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  // Location State
  const [selectedCity, setSelectedCity] = useState<string>('Houston');
  const [selectedZip, setSelectedZip] = useState<string>('');
  const [zipInputValue, setZipInputValue] = useState<string>('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  // Ordering & Alerts
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<BeautyVendor | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  const [allowSubstitutes, setAllowSubstitutes] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [storeTypeFilter, setStoreTypeFilter] = useState<'LOCAL' | 'MAJOR' | 'ALL'>('ALL');
  const [deliverySpeed, setDeliverySpeed] = useState<'STANDARD' | 'RUSH' | 'SCHEDULED'>('STANDARD');
  
  // Dynamic Vendor State
  const [dynamicVendors, setDynamicVendors] = useState<BeautyVendor[]>([]);
  const [isSearchingVendors, setIsSearchingVendors] = useState(false);

  // Driver Specific State
  const [onboardingStatus, setOnboardingStatus] = useState<DriverOnboardingStatus>('BACKGROUND_CHECK');
  const [backgroundProcessing, setBackgroundProcessing] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState({ id: false, insurance: false });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [earnings, setEarnings] = useState<DriverEarnings>({
    total: 125.50,
    basePay: 80.00,
    tips: 30.50,
    incentives: 15.00,
    pendingBalance: 45.00
  });

  const [driverReviews] = useState([
    { id: 'rev1', customer: 'Tasha W.', rating: 5, comment: 'Super fast! She found exactly the bundles I needed.', date: '2h ago' },
    { id: 'rev2', customer: 'Mya R.', rating: 5, comment: 'Great communication about the lace glue being out of stock.', date: 'Yesterday' },
    { id: 'rev3', customer: 'Keisha L.', rating: 4, comment: 'Very professional Runner. Will use again.', date: '2 days ago' }
  ]);

  const addNotification = (title: string, body: string, type: 'order' | 'promo' | 'message' = 'order') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, body, type, timestamp: Date.now() };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const searchNearbyVendors = async () => {
    setIsSearchingVendors(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const locationPrompt = selectedZip ? `ZIP code ${selectedZip}` : `the city of ${selectedCity}`;
    const coords = CITY_COORDS[selectedCity] || { lat: 29.7604, lng: -95.3698 };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find all major hair and beauty supply stores within a 50-mile radius of ${locationPrompt}. Focus on hair shops, beauty supply stores, and professional salons in Texas, New Orleans, or Columbus Georgia.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: coords.lat,
                longitude: coords.lng
              }
            }
          }
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const discovered: BeautyVendor[] = groundingChunks
          .filter((chunk: any) => chunk.maps)
          .map((chunk: any, index: number) => ({
            id: `dynamic-${index}-${Date.now()}`,
            name: chunk.maps.title,
            image: `https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800`,
            rating: 4.0 + Math.random(),
            deliveryTime: `${15 + Math.floor(Math.random() * 30)} min`,
            category: 'Beauty Supply',
            description: `Professional products at ${chunk.maps.title}.`,
            city: selectedCity as any,
            zipCode: selectedZip,
            isMajorHub: false, // AI discovered tend to be local listings
            neighborhood: 'Nearby'
          }));
        
        setDynamicVendors(discovered);
        if (discovered.length > 0) {
          addNotification("Stores Found", `We discovered ${discovered.length} additional shops in your area!`, "promo");
        }
      }
    } catch (error) {
      console.error("Maps Discovery Error:", error);
    } finally {
      setIsSearchingVendors(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'CUSTOMER') {
      searchNearbyVendors();
    }
  }, [selectedCity, selectedZip, isAuthenticated]);

  const allVendors = useMemo(() => {
    const staticFiltered = VENDORS.filter(v => {
      const cityMatch = v.city.toLowerCase() === selectedCity.toLowerCase();
      const zipMatch = selectedZip === '' || v.zipCode === selectedZip;
      if (selectedZip !== '') return zipMatch;
      return cityMatch;
    });
    const uniqueDynamic = dynamicVendors.filter(dv => 
      !staticFiltered.some(sv => sv.name.toLowerCase() === dv.name.toLowerCase())
    );
    const combined = [...staticFiltered, ...uniqueDynamic];
    
    if (storeTypeFilter === 'LOCAL') return combined.filter(v => !v.isMajorHub);
    if (storeTypeFilter === 'MAJOR') return combined.filter(v => v.isMajorHub);
    return combined;
  }, [selectedCity, selectedZip, dynamicVendors, storeTypeFilter]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    addNotification("Added to Bag", `${product.name} ready for checkout.`);
  };

  const handlePlaceOrder = () => {
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const speedCharge = deliverySpeed === 'RUSH' ? 14.99 : deliverySpeed === 'SCHEDULED' ? 2.99 : 5.99;
    
    const newOrder: Order = {
      id: `BR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cart],
      customRequest: customDescription ? { description: customDescription, allowSubstitutes } : undefined,
      holdFee: 10.00,
      total: subtotal + speedCharge + 10.00,
      status: OrderStatus.HOLD_PAID,
      customerId: 'user1',
      customerName: 'Aaliyah J.',
      vendorId: selectedVendor?.id || 'v1',
      timestamp: Date.now(),
      address: selectedZip !== '' ? `ZIP: ${selectedZip}` : selectedCity,
      allowSubstitutes: allowSubstitutes,
      deliverySpeed: deliverySpeed
    };
    setCurrentOrder(newOrder);
    setAllOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setCustomDescription('');
    setView('TRACKING');
    
    addNotification("Hold Paid", "Your $10 concierge fee is secured. A Runner is moving to verify your order.", "order");
    
    setTimeout(() => {
      setCurrentOrder(prev => prev ? { ...prev, status: OrderStatus.RUNNER_AT_STORE } : null);
      setAllOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: OrderStatus.RUNNER_AT_STORE } : o));
      addNotification("Runner at Store", "Your Runner has arrived and is checking stock/pricing.", "order");
    }, 8000);
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipInputValue.length === 5) {
      const city = ZIP_MAP[zipInputValue];
      if (city) {
        setSelectedCity(city);
        setSelectedZip(zipInputValue);
        setIsLocationModalOpen(false);
        addNotification("Zip Code Verified", `Found beauty stores in ${city} for ${zipInputValue}`, "promo");
      } else {
        setSelectedZip(zipInputValue);
        setIsLocationModalOpen(false);
        addNotification("Searching Zip", `Searching for shops in ${zipInputValue}...`, "order");
      }
    }
  };

  // --- DRIVER PORTAL COMPONENTS ---

  const DriverPortal = () => {
    const runBackgroundCheck = () => {
      setBackgroundProcessing(true);
      setTimeout(() => {
        setBackgroundProcessing(false);
        setOnboardingStatus('DOCUMENTS');
        addNotification("Eligibility Confirmed", "Your initial background scan is complete. Please upload documents.", "promo");
      }, 3000);
    };

    const handleEmergencyCall = () => {
      if (confirm("This will call 9-1-1 Emergency Services. Proceed?")) {
        window.location.href = "tel:911";
      }
    };

    const progressPercentage = {
      'BACKGROUND_CHECK': 20,
      'DOCUMENTS': 40,
      'VEHICLE_INFO': 60,
      'TERMS': 85,
      'APPROVED': 100
    }[onboardingStatus as string] || 0;

    if (onboardingStatus !== 'APPROVED') {
      return (
        <div className="animate-fadeIn max-w-xl mx-auto space-y-10 py-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter uppercase">Become a Runner</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Onboarding Progress • {progressPercentage}%</p>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
               <div className={`h-full bg-pink-600 transition-all duration-1000`} style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          {onboardingStatus === 'BACKGROUND_CHECK' && (
            <div className="bg-white border border-gray-100 p-10 rounded-[50px] shadow-xl space-y-8 animate-slideUp">
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 text-2xl">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight uppercase">Eligibility Verification</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Beauty Runn requires a standard safety verification for all partners. We use Checkr to securely process your details. 
                  This step is mandatory to access high-value beauty concierge runs.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Status</p>
                  <p className="text-sm font-bold text-gray-800">{backgroundProcessing ? 'Processing...' : 'Awaiting Authorization'}</p>
                </div>
                {backgroundProcessing && <i className="fa-solid fa-spinner animate-spin text-pink-600"></i>}
              </div>
              <button 
                onClick={runBackgroundCheck} 
                disabled={backgroundProcessing}
                className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {backgroundProcessing ? 'Verifying Identity...' : 'Authorize Background Check'}
              </button>
            </div>
          )}

          {onboardingStatus === 'DOCUMENTS' && (
            <div className="bg-white border border-gray-100 p-10 rounded-[50px] shadow-xl space-y-8 animate-slideUp">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl">
                <i className="fa-solid fa-file-invoice"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight uppercase">Document Upload</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Please provide clear photos of your legal documents to verify your identity and vehicle protection.
                </p>
              </div>
              <div className="space-y-4">
                <div 
                  onClick={() => setDocumentsUploaded(prev => ({ ...prev, id: true }))}
                  className={`p-6 border-2 border-dashed rounded-[32px] cursor-pointer transition-all flex items-center justify-between ${documentsUploaded.id ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-pink-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fa-solid ${documentsUploaded.id ? 'fa-check-circle text-green-500' : 'fa-id-card text-gray-400'} text-xl`}></i>
                    <span className="font-bold text-sm text-gray-700">Driver's License / ID</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{documentsUploaded.id ? 'Uploaded' : 'Tap to Upload'}</span>
                </div>
                <div 
                  onClick={() => setDocumentsUploaded(prev => ({ ...prev, insurance: true }))}
                  className={`p-6 border-2 border-dashed rounded-[32px] cursor-pointer transition-all flex items-center justify-between ${documentsUploaded.insurance ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 hover:border-pink-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fa-solid ${documentsUploaded.insurance ? 'fa-check-circle text-green-500' : 'fa-car-burst text-gray-400'} text-xl`}></i>
                    <span className="font-bold text-sm text-gray-700">Proof of Insurance</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{documentsUploaded.insurance ? 'Uploaded' : 'Tap to Upload'}</span>
                </div>
              </div>
              <button 
                onClick={() => setOnboardingStatus('VEHICLE_INFO')}
                disabled={!documentsUploaded.id || !documentsUploaded.insurance}
                className="w-full bg-blue-600 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50"
              >
                Continue to Vehicle Info
              </button>
            </div>
          )}

          {onboardingStatus === 'VEHICLE_INFO' && (
            <div className="bg-white border border-gray-100 p-10 rounded-[50px] shadow-xl space-y-8 animate-slideUp">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl">
                <i className="fa-solid fa-car"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight uppercase">Vehicle Details</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  Provide your vehicle information so customers can identify their Runner during drop-off.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Car Model (e.g. Camry)" className="p-6 bg-gray-50 rounded-3xl outline-none font-bold text-xs border border-transparent focus:border-blue-500" />
                <input placeholder="Color" className="p-6 bg-gray-50 rounded-3xl outline-none font-bold text-xs border border-transparent focus:border-blue-500" />
                <input placeholder="License Plate" className="col-span-2 p-6 bg-gray-50 rounded-3xl outline-none font-bold text-xs border border-transparent focus:border-blue-500 uppercase" />
              </div>
              <button 
                onClick={() => setOnboardingStatus('TERMS')}
                className="w-full bg-blue-600 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl"
              >
                Review Agreement
              </button>
            </div>
          )}

          {onboardingStatus === 'TERMS' && (
            <div className="bg-white border border-gray-100 p-10 rounded-[50px] shadow-xl space-y-8 animate-slideUp">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black tracking-tight uppercase">Terms & Agreement</h3>
                <div className="bg-gray-50 p-6 rounded-[32px] max-h-60 overflow-y-auto no-scrollbar space-y-6 border border-gray-100">
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-2">Driver Pay Policy</h4>
                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                      Runners receive a competitive base pay per delivery, plus 100% of all customer tips. Concierge bonuses are applied for high-value runs or complex pick-ups. Payments are settled weekly every Monday.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-2">Tax Responsibility (1099)</h4>
                    <p className="text-[11px] font-bold text-gray-900 leading-relaxed italic">
                      As a Runner, you are an independent contractor, not an employee. You are responsible for reporting and paying all applicable federal and state taxes on your earnings.
                    </p>
                    <p className="text-[11px] font-medium text-gray-600 mt-2 leading-relaxed">
                      Beauty Runn will provide you with a 1099-NEC form at the end of the year if your total earnings exceed $600. Please consult a tax professional for guidance.
                    </p>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-pink-600 mb-2">Code of Conduct</h4>
                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                      Runners must maintain a professional standard, ensure product integrity, and prioritize safe driving at all times. Failure to comply may lead to account deactivation.
                    </p>
                  </section>
                </div>
              </div>
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-pink-600 border-pink-600' : 'border-gray-200 group-hover:border-pink-300'}`}>
                  {agreedToTerms && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                </div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">I understand and agree to the Runner Agreement & Tax Terms</p>
              </div>
              <button 
                onClick={() => { setOnboardingStatus('APPROVED'); addNotification("Welcome Runner", "You are now active. Start accepting beauty runs!", "promo"); }}
                disabled={!agreedToTerms}
                className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50"
              >
                Complete Onboarding
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="animate-fadeIn space-y-10 py-6">
        {/* Driver Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gray-900 p-10 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-2">Runner Dashboard • Drive Safe</p>
             <h2 className="text-4xl font-black tracking-tighter uppercase mb-1">Aaliyah J.</h2>
             <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><i className="fa-solid fa-star text-yellow-500"></i> 4.95</span>
                <span>•</span>
                <span className="text-green-500 uppercase">Online</span>
             </div>
           </div>
           <div className="flex gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10 min-w-[140px]">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Total Earned</p>
                 <p className="text-2xl font-black tracking-tighter">${earnings.total.toFixed(2)}</p>
              </div>
              <div className="bg-pink-600 p-6 rounded-[32px] shadow-lg shadow-pink-900/20 min-w-[140px]">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Available</p>
                 <p className="text-2xl font-black tracking-tighter">${earnings.pendingBalance.toFixed(2)}</p>
              </div>
           </div>
           <div className="absolute right-0 top-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

        {/* Safety Center Section */}
        <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black tracking-tighter uppercase">Safety Center</h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
              Emergency Services
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
              onClick={handleEmergencyCall}
              className="bg-red-600 text-white p-6 rounded-[32px] flex items-center justify-between group hover:bg-red-700 transition-all shadow-xl shadow-red-200"
             >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">
                    <i className="fa-solid fa-phone-volume"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-100">Immediate Action</p>
                    <p className="text-lg font-black tracking-tighter uppercase">Dispatch 9-1-1</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
             </button>

             <button 
              onClick={() => setIsSafetyModalOpen(true)}
              className="bg-gray-50 border border-gray-100 text-gray-900 p-6 rounded-[32px] flex items-center justify-between group hover:bg-gray-100 transition-all"
             >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-lg">
                    <i className="fa-solid fa-shield-heart"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Runner Wellness</p>
                    <p className="text-lg font-black tracking-tighter uppercase">Safety Toolkit</p>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs opacity-50 group-hover:translate-x-1 transition-transform"></i>
             </button>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase text-center tracking-widest">Always prioritize your safety. If you feel unsafe, end the run immediately.</p>
        </div>

        {/* Customer Reviews Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black tracking-tighter uppercase">Customer Feedback</h3>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-star text-yellow-500 text-[10px]"></i>
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Latest Ratings</span>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
            {driverReviews.map(review => (
              <div key={review.id} className="min-w-[280px] bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fa-solid fa-star text-[10px] ${i < review.rating ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                    ))}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">{review.date}</span>
                </div>
                <p className="text-sm font-bold text-gray-800 leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-lg flex items-center justify-center text-pink-600 text-[8px] font-black">
                    {review.customer.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{review.customer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incentive Pay Section */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-black tracking-tighter uppercase">Incentive Pay</h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-pink-600">Active Promos</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DRIVER_INCENTIVES.map(inc => (
                <div key={inc.id} className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm relative overflow-hidden group hover:border-pink-200 transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 text-lg group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors">
                        <i className={`fa-solid ${inc.type === 'streak' ? 'fa-fire' : 'fa-chart-simple'}`}></i>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bonus</p>
                        <p className="text-2xl font-black text-green-600 tracking-tighter">+${inc.amount.toFixed(2)}</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">{inc.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase leading-relaxed">{inc.description}</p>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-pink-600">{inc.progress} / {inc.requirement} Complete</span>
                            <span>{Math.round((inc.progress / inc.requirement) * 100)}%</span>
                         </div>
                         <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-600 transition-all duration-1000" style={{ width: `${(inc.progress / inc.requirement) * 100}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Tax Information Summary */}
        <div className="bg-pink-50 border border-pink-100 p-8 rounded-[40px] flex items-center gap-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-pink-600 text-xl shadow-sm">
            <i className="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">Tax Awareness</h4>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase leading-relaxed">
              You are an Independent Contractor. Track your expenses for your 1099 filing at year-end.
            </p>
          </div>
          <button className="px-4 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-pink-600 border border-pink-100">Info</button>
        </div>

        {/* Available Runs List */}
        <div className="space-y-6">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-black tracking-tighter uppercase">Available Runs</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Live Updates</span>
              </div>
           </div>
           
           <div className="space-y-4">
              {[
                { id: 'R1', vendor: 'Sally Beauty', city: 'Houston', pay: 18.50, distance: '2.4 mi' },
                { id: 'R2', vendor: 'Uptown Beauty', city: 'Houston', pay: 22.00, distance: '4.1 mi' }
              ].map(run => (
                <div key={run.id} className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900">
                        <i className="fa-solid fa-shop text-lg"></i>
                     </div>
                     <div>
                        <h5 className="font-black text-gray-900 uppercase tracking-tight">{run.vendor}</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{run.city} • {run.distance}</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className="font-black text-xl text-gray-900 tracking-tighter">${run.pay.toFixed(2)}</span>
                     <button className="px-6 py-2 bg-gray-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-pink-600 transition-all">Accept Run</button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Detailed Earnings Summary */}
        <div className="bg-gray-50 p-10 rounded-[50px] border border-gray-100 space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tighter">Earnings Breakdown</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Base Pay</p>
                 <p className="text-xl font-black text-gray-900">${earnings.basePay.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Tips</p>
                 <p className="text-xl font-black text-gray-900">${earnings.tips.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Incentive Bonuses</p>
                 <p className="text-xl font-black text-pink-600">${earnings.incentives.toFixed(2)}</p>
              </div>
           </div>
           <button className="w-full py-5 bg-white border border-gray-200 rounded-3xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all">Request Instant Payout</button>
        </div>
      </div>
    );
  };

  // --- ADMIN COMPONENTS ---

  const AdminDashboard = () => {
    const isEditor = role === 'EDITOR';

    const menuItems = [
      { id: 'OVERVIEW', label: 'Overview', icon: 'fa-chart-pie', visible: !isEditor },
      { id: 'LOGISTICS', label: 'Order Command', icon: 'fa-truck-bolt', visible: !isEditor },
      { id: 'VENDORS', label: 'Partner Hub', icon: 'fa-shop', visible: true },
      { id: 'CATALOG', label: 'Catalog Edit', icon: 'fa-list-check', visible: true },
      { id: 'TEAM', label: 'Team Control', icon: 'fa-users-gear', visible: !isEditor }
    ].filter(i => i.visible);

    const stats = [
      { label: 'Live Orders', value: allOrders.filter(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED).length, icon: 'fa-bolt', color: 'text-blue-600' },
      { label: 'Total Hold Fees', value: `$${(allOrders.length * 10).toFixed(2)}`, icon: 'fa-piggy-bank', color: 'text-green-600' },
      { label: 'Market Depth', value: allVendors.length, icon: 'fa-map-pin', color: 'text-pink-600' }
    ];

    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden fixed inset-0 z-[1000] animate-fadeIn">
        {/* Admin Sidebar */}
        <aside className="w-72 bg-gray-900 flex flex-col h-full border-r border-gray-800">
          <div className="p-8 border-b border-gray-800 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">B</div>
            <div>
              <p className="text-white font-black text-xs uppercase tracking-widest">Beauty Runn</p>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{role} Portal</p>
            </div>
          </div>
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setAdminSection(item.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adminSection === item.id ? 'bg-pink-600 text-white shadow-xl shadow-pink-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
              >
                <i className={`fa-solid ${item.icon} w-5`}></i>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-8 border-t border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs font-bold">AJ</div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">Aaliyah J.</p>
               </div>
            </div>
            <button onClick={() => { setIsAuthenticated(false); setRole('CUSTOMER'); setShowStaffOptions(false); }} className="w-full py-4 rounded-2xl border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/30 transition-all">Sign Out</button>
          </div>
        </aside>

        {/* Admin Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="px-10 py-8 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">{adminSection.replace('_', ' ')}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Global System Control • Live Update</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
               </div>
               <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><i className="fa-solid fa-bell"></i></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar p-10">
            {adminSection === 'OVERVIEW' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map(s => (
                    <div key={s.label} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${s.color} text-xl shadow-inner`}>
                        <i className={`fa-solid ${s.icon}`}></i>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                        <p className="text-3xl font-black tracking-tighter text-gray-900">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-900 text-white p-12 rounded-[50px] flex justify-between items-center relative overflow-hidden shadow-2xl">
                   <div className="relative z-10">
                     <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">Expansion Mode</h3>
                     <p className="text-gray-400 text-sm max-w-sm">Beauty Runn is actively discovering stores in Texas, Louisiana, and Georgia via Gemini AI grounding.</p>
                   </div>
                   <div className="w-32 h-32 bg-pink-600/20 rounded-full blur-3xl absolute -right-10 -top-10"></div>
                   <button onClick={() => setAdminSection('VENDORS')} className="bg-white text-gray-900 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all">Audit Partners</button>
                </div>
              </div>
            )}

            {adminSection === 'LOGISTICS' && (
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h4 className="font-black text-lg tracking-tight uppercase">Order Command Center</h4>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase">CSV Export</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/30 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                        <th className="px-8 py-6">Reference</th>
                        <th className="px-8 py-6">Market</th>
                        <th className="px-8 py-6">Customer</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {allOrders.length === 0 ? (
                        <tr><td colSpan={5} className="py-20 text-center text-gray-300 font-black uppercase text-[10px] tracking-widest">Standby for live traffic</td></tr>
                      ) : (
                        allOrders.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-6 font-black">{o.id}</td>
                            <td className="px-8 py-6 text-xs text-gray-500 font-bold uppercase">{o.address}</td>
                            <td className="px-8 py-6 font-bold">{o.customerName}</td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-[8px] font-black uppercase tracking-widest">{o.status}</span>
                            </td>
                            <td className="px-8 py-6">
                               <button className="text-blue-600 font-black text-[9px] uppercase tracking-widest">Detail View</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminSection === 'VENDORS' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {allVendors.map(v => (
                  <div key={v.id} className="bg-white p-6 rounded-[40px] border border-gray-100 flex items-center gap-6 shadow-sm group">
                    <div className="w-24 h-24 rounded-[30px] overflow-hidden flex-shrink-0">
                      <img src={v.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-xl tracking-tighter text-gray-900">{v.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{v.city} • {v.category}</p>
                      <div className="mt-4 flex gap-2">
                        <button className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100">Edit Shop</button>
                        <button className="px-4 py-2 bg-gray-50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-100">Inventory</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminSection === 'TEAM' && (
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Team Control</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Manage internal permissions and editors</p>
                  </div>
                  <button onClick={() => setIsAddingMember(true)} className="bg-pink-600 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-pink-200">Invite New Editor</button>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/30 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                        <th className="px-8 py-6">Member</th>
                        <th className="px-8 py-6">Access Role</th>
                        <th className="px-8 py-6">Activity</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {teamMembers.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-xs font-bold">{m.name.charAt(0)}</div>
                              <div>
                                <p className="font-black text-gray-900">{m.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${m.role === 'ADMIN' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                              {m.role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-400 font-bold">Today, 2:44 PM</td>
                          <td className="px-8 py-6"><div className="w-2 h-2 bg-green-500 rounded-full"></div></td>
                          <td className="px-8 py-6">
                            <button className="w-10 h-10 rounded-xl hover:bg-gray-100 text-gray-400"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminSection === 'CATALOG' && (
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">Global Catalog</h3>
                  <button className="text-pink-600 font-black uppercase text-[10px] tracking-widest">+ Add Beauty Product</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {PRODUCTS.map(p => (
                     <div key={p.id} className="bg-white p-6 rounded-[32px] border border-gray-100 flex gap-4 shadow-sm group">
                       <img src={p.image} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                       <div className="flex-1">
                         <h5 className="font-black text-gray-900 text-sm">{p.name}</h5>
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">${p.price}</p>
                         <button className="mt-2 text-blue-600 text-[9px] font-black uppercase tracking-widest">Edit Details</button>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  };

  const CustomerHome = () => {
    const hairCategories = ['All', 'Packaged Hair', 'Synthetic Hair', 'Human Hair', 'Braiding Hair', 'Bundles', 'Other Beauty Essentials', 'Lace Adhesives/ Bond Glue', 'Shampoo & Conditioner', 'Hair Dye', 'Headwraps & Hair Ties', 'Hot Tools'];
    
    return (
      <div className="animate-fadeIn space-y-10 pb-32">
        {/* Marketplace Selection Header */}
        <div className="bg-gray-900 p-8 rounded-[40px] shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
             <div>
               <h2 className="text-white text-3xl font-black tracking-tighter uppercase">Marketplace</h2>
               <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mt-1">Shop Local or Major Brands</p>
             </div>
             <i className="fa-solid fa-bag-shopping text-pink-600 text-3xl opacity-20"></i>
          </div>
          <div className="flex bg-white/10 p-2 rounded-[28px] border border-white/5">
            <button 
              onClick={() => setStoreTypeFilter('ALL')}
              className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${storeTypeFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400'}`}>All</button>
            <button 
              onClick={() => setStoreTypeFilter('LOCAL')}
              className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${storeTypeFilter === 'LOCAL' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400'}`}>Local Supply</button>
            <button 
              onClick={() => setStoreTypeFilter('MAJOR')}
              className={`flex-1 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${storeTypeFilter === 'MAJOR' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400'}`}>Major Brands</button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-[28px] border border-gray-100 shadow-sm">
          <i className="fa-solid fa-magnifying-glass text-gray-300 text-lg"></i>
          <input type="text" placeholder="Search bundles, braiding hair..." className="bg-transparent outline-none flex-1 text-sm font-bold placeholder:text-gray-300" />
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
          {hairCategories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${activeCategory === cat ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-gray-900">{storeTypeFilter === 'LOCAL' ? 'Local Gems' : storeTypeFilter === 'MAJOR' ? 'Major Retailers' : 'Nearby Shops'}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Specializing in {activeCategory === 'All' ? 'Professional Beauty' : activeCategory}</p>
            </div>
            {isSearchingVendors && (
              <div className="flex items-center gap-2 text-pink-600 animate-pulse">
                <i className="fa-solid fa-compass animate-spin text-sm"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">Scanning...</span>
              </div>
            )}
          </div>

          <div className="grid gap-10">
            {allVendors.length === 0 && !isSearchingVendors ? (
              <div className="py-20 text-center space-y-4">
                <i className="fa-solid fa-store-slash text-gray-100 text-7xl"></i>
                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No shops in this area yet.</p>
                <button onClick={() => setIsLocationModalOpen(true)} className="text-[#D63384] font-black uppercase text-xs">Change Location</button>
              </div>
            ) : (
              allVendors.map(vendor => (
                <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setView('VENDOR'); }} className="cursor-pointer group">
                  <div className="relative h-72 w-full rounded-[40px] overflow-hidden mb-6 shadow-2xl transition-transform duration-500 group-hover:scale-[0.98]">
                    <img src={vendor.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={vendor.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-6 left-6 bg-pink-600 text-white px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                      {vendor.isMajorHub ? 'Major Brand' : 'Local Supply'}
                    </div>
                    <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white flex items-center gap-2 border border-white/20">
                      <i className="fa-solid fa-star text-yellow-400"></i> {vendor.rating.toFixed(1)}
                    </div>
                    <div className="absolute bottom-6 left-6 text-white">
                       <h3 className="font-black text-2xl tracking-tight mb-1">{vendor.name}</h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/70">{vendor.deliveryTime} Delivery • {vendor.neighborhood || vendor.city}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const VendorView = () => {
    const filteredProducts = activeCategory === 'All' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === activeCategory);

    return (
      <div className="animate-fadeIn space-y-10 pb-32">
        <div className="flex justify-between items-center">
          <button onClick={() => setView('HOME')} className="text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"><i className="fa-solid fa-chevron-left"></i> Back</button>
          <div className="relative" onClick={() => setView('CHECKOUT')}>
             <button className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
               <i className="fa-solid fa-cart-shopping text-sm"></i>
             </button>
             {cart.length > 0 && (
               <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white animate-bounce">
                 {cart.reduce((acc, i) => acc + i.quantity, 0)}
               </div>
             )}
          </div>
        </div>
        <div className="h-80 rounded-[50px] overflow-hidden relative shadow-2xl">
          <img src={selectedVendor?.image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-10 flex flex-col justify-end">
            <h2 className="text-5xl font-black text-white tracking-tighter">{selectedVendor?.name}</h2>
            <p className="text-white/60 text-xs font-black uppercase tracking-widest mt-2">{selectedVendor?.category} • {selectedVendor?.deliveryTime}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <div key={p.id} className="p-6 bg-white border border-gray-100 rounded-[32px] flex gap-6 shadow-sm group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-gray-900 text-lg tracking-tight">{p.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{p.description}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-black text-2xl text-gray-900 tracking-tighter">${p.price}</span>
                    <button onClick={() => addToCart(p)} className="bg-gray-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-[#D63384] transition-all"><i className="fa-solid fa-plus text-xs"></i></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No products found in this category.</p>
              <button onClick={() => setActiveCategory('All')} className="mt-4 text-pink-600 font-black uppercase text-xs">Show All Products</button>
            </div>
          )}
        </div>
        <div className="mt-8 bg-pink-50 p-8 rounded-[40px] space-y-4 border border-pink-100">
          <div className="flex items-center gap-3">
              <i className="fa-solid fa-hand-holding-heart text-pink-600"></i>
              <h4 className="font-black text-gray-900">Custom Concierge Order</h4>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
              Can't find it? Describe it below. Pay a <span className="text-pink-600">$10 hold fee</span> to send a Runner to the shop. 
              They'll confirm availability and exact price before you pay for the items.
          </p>
          <textarea value={customDescription} onChange={e => setCustomDescription(e.target.value)} placeholder="Ex: '3 boxes of Kiss Powerflex Glue', 'Ebin Edge Control 24hr'..." className="w-full p-6 bg-white rounded-3xl outline-none border-2 border-transparent focus:border-[#D63384] text-sm h-32 shadow-sm" />
        </div>
      </div>
    );
  };

  const CheckoutView = () => {
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const speedCharge = deliverySpeed === 'RUSH' ? 14.99 : deliverySpeed === 'SCHEDULED' ? 2.99 : 5.99;
    const totalDue = subtotal + speedCharge + 10.00;

    return (
      <div className="animate-fadeIn space-y-10 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
           <button onClick={() => setView('VENDOR')} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><i className="fa-solid fa-chevron-left"></i></button>
           <h2 className="text-4xl font-black tracking-tighter">Concierge Check</h2>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
           {cart.map(item => (
             <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl overflow-hidden"><img src={item.image} className="w-full h-full object-cover" alt=""/></div>
                   <div>
                     <p className="font-black text-gray-900 text-sm">{item.name}</p>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.quantity}x • ${item.price}</p>
                   </div>
                </div>
                <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
             </div>
           ))}
        </div>

        {/* Delivery Speed Selection */}
        <div className="space-y-6">
           <h3 className="text-xl font-black uppercase tracking-tight">Select Delivery Speed</h3>
           <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setDeliverySpeed('STANDARD')}
                className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between ${deliverySpeed === 'STANDARD' ? 'bg-pink-50 border-pink-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deliverySpeed === 'STANDARD' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-400'}`}><i className="fa-solid fa-truck"></i></div>
                   <div className="text-left">
                     <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Standard Runn</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase">30-60 mins delivery</p>
                   </div>
                </div>
                <span className="font-black text-gray-900 tracking-tighter">$5.99</span>
              </button>

              <button 
                onClick={() => setDeliverySpeed('RUSH')}
                className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between ${deliverySpeed === 'RUSH' ? 'bg-pink-50 border-pink-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deliverySpeed === 'RUSH' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-400'}`}><i className="fa-solid fa-bolt"></i></div>
                   <div className="text-left">
                     <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Rush Runn</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase">Under 25 mins • Top Priority</p>
                   </div>
                </div>
                <span className="font-black text-gray-900 tracking-tighter">$14.99</span>
              </button>

              <button 
                onClick={() => setDeliverySpeed('SCHEDULED')}
                className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between ${deliverySpeed === 'SCHEDULED' ? 'bg-pink-50 border-pink-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deliverySpeed === 'SCHEDULED' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-400'}`}><i className="fa-solid fa-calendar-check"></i></div>
                   <div className="text-left">
                     <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Scheduled Runn</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase">Select a future time slot</p>
                   </div>
                </div>
                <span className="font-black text-gray-900 tracking-tighter">$2.99</span>
              </button>
           </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 p-10 rounded-[50px] space-y-6 shadow-inner">
          <div className="flex justify-between items-center text-gray-400 font-black uppercase text-[10px] tracking-widest">
              <span>Items Total</span>
              <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400 font-black uppercase text-[10px] tracking-widest">
              <span>Delivery Speed ({deliverySpeed})</span>
              <span>${speedCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-pink-600 font-black uppercase text-[10px] tracking-widest">
              <span>Concierge Holding Fee</span>
              <span>$10.00</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-pink-100">
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed italic">
                The $10 fee secures your Runner. Once they confirm availability and exact pricing at the store, 
                you will receive a link to pay the remaining balance for the items.
            </p>
          </div>
          <div className="border-t border-gray-200 pt-8 flex justify-between font-black text-3xl text-gray-900 tracking-tighter"><span>DUE NOW</span><span>$10.00</span></div>
        </div>
        
        <PrivacyBanner centered={false} />
        <button onClick={handlePlaceOrder} className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-2xl shadow-2xl hover:bg-[#D63384] transition-all transform hover:-translate-y-1">Confirm Hold & Pay $10</button>
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

      {isAuthenticated && (role === 'ADMIN' || role === 'EDITOR') ? (
        <AdminDashboard />
      ) : (
        <>
          {isAuthenticated && (
            <nav className="px-8 py-6 flex items-center justify-between border-b border-gray-50 safe-top bg-white/90 backdrop-blur-xl sticky top-0 z-[100]">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('HOME')}>
                <span className="font-black text-2xl tracking-tighter uppercase text-gray-900 group-hover:text-[#D63384] transition-colors">Beauty Runn</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsLocationModalOpen(true)} className="flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-widest border border-gray-100">
                  <i className="fa-solid fa-location-arrow text-[#D63384]"></i>
                  {selectedZip || selectedCity}
                </button>
                <button onClick={() => setView('PROFILE')} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                  <i className="fa-solid fa-bars-staggered text-sm"></i>
                </button>
              </div>
            </nav>
          )}

          <main className="flex-1 px-8 py-10 overflow-y-auto no-scrollbar mx-auto w-full max-w-5xl">
            {!isAuthenticated ? (
                <div className="min-h-[80vh] flex flex-col items-center justify-center text-center animate-fadeIn">
                  <Logo size="xl" />
                  <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase mb-4 mt-8">Beauty Runn</h1>
                  <p className="text-gray-400 font-bold text-sm tracking-[0.2em] uppercase mb-12 max-w-[200px]">Don't Stress, Let Beauty Runn It</p>
                  <div className="w-full max-w-sm space-y-5">
                    <button onClick={() => { setRole('CUSTOMER'); setIsAuthenticated(true); setView('HOME'); }} className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xl shadow-2xl hover:bg-[#D63384] transition-all transform hover:-translate-y-1">Shop Beauty Products</button>
                    <button onClick={() => { setRole('DRIVER'); setIsAuthenticated(true); setView('DRIVER_PORTAL'); }} className="w-full bg-white text-gray-900 border-2 border-gray-900 py-6 rounded-full font-black text-xl transition-all">Become a Runner</button>
                    
                    <div className="pt-4 flex flex-col items-center gap-4">
                       <button onClick={() => setShowStaffOptions(!showStaffOptions)} className="text-gray-300 font-black uppercase text-[10px] tracking-widest hover:text-pink-600 transition-colors flex items-center gap-2">
                         <i className={`fa-solid ${showStaffOptions ? 'fa-caret-down' : 'fa-lock'} text-[8px]`}></i>
                         {showStaffOptions ? 'Hide Management Access' : 'Staff & Admin Access'}
                       </button>
                       {showStaffOptions && (
                         <div className="flex gap-3 animate-fadeIn">
                            <button onClick={() => { setRole('ADMIN'); setIsAuthenticated(true); setAdminSection('OVERVIEW'); }} className="bg-pink-600/10 text-pink-600 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-pink-100 hover:bg-pink-600 hover:text-white transition-all shadow-sm">Admin Entry</button>
                            <button onClick={() => { setRole('EDITOR'); setIsAuthenticated(true); setAdminSection('VENDORS'); }} className="bg-blue-600/10 text-blue-600 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm">Editor Entry</button>
                         </div>
                       )}
                    </div>
                  </div>
                  <PrivacyBanner />
                </div>
            ) : (
              role === 'DRIVER' ? (
                <DriverPortal />
              ) : role === 'CUSTOMER' ? (
                view === 'HOME' ? <CustomerHome /> : 
                view === 'VENDOR' ? <VendorView /> : 
                view === 'CHECKOUT' ? <CheckoutView /> :
                view === 'TRACKING' ? <div className="space-y-8 pb-32"><h3 className="text-4xl font-black tracking-tighter uppercase">Live Activity</h3><TrackingMap status={currentOrder?.status || 'PENDING'} /></div> : 
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-fadeIn">
                  <Logo size="lg" />
                  <h3 className="text-4xl font-black tracking-tighter uppercase mt-4">My Account</h3>
                  <button onClick={() => { setIsAuthenticated(false); setRole('CUSTOMER'); setShowStaffOptions(false); }} className="p-6 bg-pink-50 text-[#D63384] rounded-3xl font-black uppercase tracking-widest text-[10px] border border-pink-100 mt-6 w-full max-w-sm">Log Out</button>
                </div>
              ) : <div className="py-20 text-center uppercase font-black tracking-widest text-gray-300">Portal Standby</div>
            )}
          </main>

          {isAuthenticated && (role === 'CUSTOMER' || (role === 'DRIVER' && onboardingStatus === 'APPROVED')) && (
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-50 px-12 py-6 flex justify-around items-center safe-bottom z-[100] shadow-luxury">
              {role === 'CUSTOMER' ? (
                <>
                  <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-2 transition-all ${view === 'HOME' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-magnifying-glass text-xl"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">Explore</span></button>
                  <button onClick={() => setView('TRACKING')} className={`flex flex-col items-center gap-2 transition-all ${view === 'TRACKING' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-map-location-dot text-xl"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">Activity</span></button>
                  <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-2 transition-all ${view === 'PROFILE' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-user-circle text-xl"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">Account</span></button>
                </>
              ) : (
                <>
                  <button onClick={() => setView('DRIVER_PORTAL')} className={`flex flex-col items-center gap-2 transition-all ${view === 'DRIVER_PORTAL' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-bolt text-xl"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">Runs</span></button>
                  <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-2 transition-all ${view === 'PROFILE' ? 'text-[#D63384] scale-110' : 'text-gray-300'}`}><i className="fa-solid fa-wallet text-xl"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">Earnings</span></button>
                  <button onClick={() => { setIsAuthenticated(false); setRole('CUSTOMER'); setShowStaffOptions(false); }} className="flex flex-col items-center gap-2 text-gray-300"><i className="fa-solid fa-door-open text-xl"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">Exit</span></button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 backdrop-blur-md animate-fadeIn p-4">
          <div className="w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl space-y-8 animate-slideUp mb-safe">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tighter">Set Delivery Zip</h2>
              <button onClick={() => setIsLocationModalOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleZipSubmit} className="space-y-4">
              <input 
                type="text" 
                maxLength={5}
                value={zipInputValue}
                onChange={(e) => setZipInputValue(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 5-digit Zip Code" 
                className="w-full p-6 bg-gray-50 rounded-3xl outline-none border-2 border-transparent focus:border-[#D63384] font-black text-xl tracking-[0.3em] text-center"
              />
              <button type="submit" className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50" disabled={zipInputValue.length !== 5}>Find Stores</button>
            </form>
          </div>
        </div>
      )}

      {/* Safety Toolkit Modal */}
      {isSafetyModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-fadeIn p-6">
          <div className="w-full max-w-lg bg-white rounded-[50px] p-10 shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl">
                  <i className="fa-solid fa-shield-heart"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">Safety Toolkit</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Runner Protection Program</p>
                </div>
              </div>
              <button onClick={() => setIsSafetyModalOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-pink-50 border border-pink-100 rounded-[32px] flex items-center gap-5">
                <i className="fa-solid fa-location-dot text-pink-600 text-2xl"></i>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">Location Sharing</h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Your real-time GPS is always shared with Beauty Runn dispatch for your protection.</p>
                </div>
              </div>
              <div className="p-6 bg-blue-50 border border-blue-100 rounded-[32px] flex items-center gap-5">
                <i className="fa-solid fa-user-check text-blue-600 text-2xl"></i>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">Customer Verification</h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">All customers must have a verified payment method before a run starts.</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border border-gray-100 rounded-[32px] flex items-center gap-5">
                <i className="fa-solid fa-headset text-gray-900 text-2xl"></i>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">24/7 Support Line</h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-relaxed">Priority support for Runners is available at the tap of a button during any run.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if(confirm("Dial 9-1-1 immediately?")) window.location.href = "tel:911";
              }}
              className="w-full bg-red-600 text-white py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-phone-volume animate-pulse"></i>
              Dial 9-1-1 Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;