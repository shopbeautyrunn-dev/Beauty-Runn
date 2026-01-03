
import React, { useState } from 'react';
import { DriverApplication, DriverOnboardingStatus } from '../types';
import { COLORS } from '../constants';

interface DriverOnboardingProps {
  onComplete: (data: DriverApplication) => void;
  onCancel: () => void;
  existingApplication?: DriverApplication | null;
}

const DriverOnboarding: React.FC<DriverOnboardingProps> = ({ onComplete, onCancel, existingApplication }) => {
  const [step, setStep] = useState(existingApplication ? 7 : 1);
  const [formData, setFormData] = useState<DriverApplication>(existingApplication || {
    fullName: '',
    dob: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    ssn: '',
    documents: {
      licenseFront: null,
      licenseBack: null,
      ssnCard: null,
      insurance: null,
    },
    vehicle: {
      make: '',
      model: '',
      year: '',
      plate: '',
    },
    consentBackgroundCheck: false,
    signature: '',
    status: 'NOT_STARTED',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof DriverApplication['documents']) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [type]: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = () => {
    if (step === 2) return formData.fullName && formData.dob && formData.email && formData.phone && formData.address && formData.zipCode;
    if (step === 3) return formData.documents.licenseFront && formData.documents.licenseBack && formData.documents.ssnCard && formData.documents.insurance;
    if (step === 4) return formData.vehicle.make && formData.vehicle.model && formData.vehicle.year && formData.vehicle.plate;
    if (step === 5) return formData.consentBackgroundCheck;
    if (step === 6) return formData.signature.length > 2;
    return true;
  };

  const renderProgress = () => (
    <div className="flex gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#C48B8B]' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] bg-[#EDE4DB] safe-top safe-bottom flex flex-col animate-fadeIn">
      <nav className="px-8 py-6 border-b border-[#1A1A1A]/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
        <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A]">
          <i className="fa-solid fa-xmark mr-2"></i> Exit
        </button>
        <span className="font-serif text-xl italic text-[#1A1A1A]">Runner Hub</span>
        <div className="w-10" />
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-md mx-auto h-full flex flex-col">
          
          {step < 7 && renderProgress()}

          {/* SCREEN 1: INTRO */}
          {step === 1 && (
            <div className="space-y-10 animate-fadeIn h-full flex flex-col justify-center py-10">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-[40px] flex items-center justify-center text-white text-4xl mx-auto shadow-2xl">
                  <i className="fa-solid fa-person-running"></i>
                </div>
                <h1 className="font-serif text-5xl italic text-[#1A1A1A]">Become a Runner</h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C48B8B]">Earn with Beauty Runn</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><i className="fa-solid fa-money-bill-trend-up text-[#C48B8B]"></i></div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Earnings Potential</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Keep 100% of your Runner fees and tips. Top earners make $25+/hr.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><i className="fa-solid fa-calendar-check text-[#C48B8B]"></i></div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Flexible Schedule</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Work when you want. Set your own availability through the Runner app.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><i className="fa-solid fa-heart text-[#C48B8B]"></i></div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-[#1A1A1A]">Supportive Community</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">We're here for our Runners. In-app support available 24/7 during your Runns.</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button onClick={nextStep} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95">Start Application</button>
              </div>
            </div>
          )}

          {/* SCREEN 2: PERSONAL INFO */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Let's Get to Know You</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">We need a few details to create your Runner profile. This information is kept secure and private.</p>
              </header>

              <div className="space-y-5">
                {[
                  { label: 'Full Legal Name', val: formData.fullName, key: 'fullName', type: 'text', placeholder: 'Jane Doe' },
                  { label: 'Date of Birth', val: formData.dob, key: 'dob', type: 'date' },
                  { label: 'Email Address', val: formData.email, key: 'email', type: 'email', placeholder: 'jane@example.com' },
                  { label: 'Phone Number', val: formData.phone, key: 'phone', type: 'tel', placeholder: '(555) 000-0000' },
                  { label: 'Home Address', val: formData.address, key: 'address', type: 'text', placeholder: '123 Main St' },
                  { label: 'ZIP Code', val: formData.zipCode, key: 'zipCode', type: 'text', placeholder: '77002' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">{field.label}</label>
                    <input 
                      type={field.type}
                      value={field.val}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                      placeholder={field.placeholder}
                      className="w-full p-6 bg-white/50 rounded-3xl outline-none focus:ring-2 focus:ring-[#C48B8B]/20 font-bold border border-[#1A1A1A]/5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 3: IDENTITY VERIFICATION */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Verify Your Identity</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Upload required documents to confirm eligibility. This helps keep Beauty Runn safe for everyone.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'licenseFront', label: "Driver's License (Front)", icon: 'fa-id-card' },
                  { id: 'licenseBack', label: "Driver's License (Back)", icon: 'fa-id-card' },
                  { id: 'ssnCard', label: "Social Security Card", icon: 'fa-address-card' },
                  { id: 'insurance', label: "Proof of Auto Insurance", icon: 'fa-car-burst' }
                ].map(doc => (
                  <div key={doc.id} className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleFileUpload(e, doc.id as any)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className={`p-8 rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 ${
                      formData.documents[doc.id as keyof typeof formData.documents] 
                      ? 'border-[#10B981] bg-[#10B981]/5' 
                      : 'border-white bg-white/30 group-hover:border-[#C48B8B]'
                    }`}>
                      {formData.documents[doc.id as keyof typeof formData.documents] ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-lg">
                            <i className="fa-solid fa-check"></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981]">{doc.label} Uploaded</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm group-hover:text-[#C48B8B]">
                            <i className={`fa-solid ${doc.icon}`}></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Add {doc.label}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/50 p-6 rounded-[32px] border border-[#1A1A1A]/5 flex gap-4 items-center">
                <i className="fa-solid fa-lock text-[#C48B8B]"></i>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Your information is encrypted and protected using bank-level security.</p>
              </div>
            </div>
          )}

          {/* SCREEN 4: VEHICLE INFO */}
          {step === 4 && (
            <div className="space-y-8 animate-fadeIn">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Your Vehicle Details</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Tell us about the vehicle you'll use for deliveries. It must be insured and in good working condition.</p>
              </header>

              <div className="space-y-5">
                {[
                  { label: 'Vehicle Make', val: formData.vehicle.make, key: 'make', placeholder: 'Toyota' },
                  { label: 'Vehicle Model', val: formData.vehicle.model, key: 'model', placeholder: 'Camry' },
                  { label: 'Vehicle Year', val: formData.vehicle.year, key: 'year', placeholder: '2022' },
                  { label: 'License Plate Number', val: formData.vehicle.plate, key: 'plate', placeholder: 'ABC-1234' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">{field.label}</label>
                    <input 
                      type="text"
                      value={field.val}
                      onChange={e => setFormData({
                        ...formData, 
                        vehicle: { ...formData.vehicle, [field.key]: e.target.value }
                      })}
                      placeholder={field.placeholder}
                      className="w-full p-6 bg-white/50 rounded-3xl outline-none focus:ring-2 focus:ring-[#C48B8B]/20 font-bold border border-[#1A1A1A]/5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 5: BACKGROUND CHECK */}
          {step === 5 && (
            <div className="space-y-8 animate-fadeIn">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Authorization</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Beauty Runn conducts background checks to ensure a safe experience for customers and Runners.</p>
              </header>

              <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white space-y-8 shadow-2xl">
                <div className="w-16 h-16 bg-[#C48B8B] rounded-3xl flex items-center justify-center text-2xl shadow-lg">
                  <i className="fa-solid fa-shield-check"></i>
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-3xl italic">Safety Check</h3>
                  <p className="text-[11px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">We partner with professional screening providers to conduct driving records, criminal history, and identity verification.</p>
                </div>
                
                <div 
                  onClick={() => setFormData({...formData, consentBackgroundCheck: !formData.consentBackgroundCheck})}
                  className="flex items-center gap-4 pt-8 border-t border-white/10 cursor-pointer group"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2 ${
                    formData.consentBackgroundCheck ? 'bg-[#C48B8B] border-[#C48B8B]' : 'bg-transparent border-white/20 group-hover:border-white/40'
                  }`}>
                    {formData.consentBackgroundCheck && <i className="fa-solid fa-check text-white text-xs"></i>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] flex-1">
                    I authorize Beauty Runn to conduct a background check.
                  </span>
                </div>
              </div>

              <p className="text-[8px] font-black text-gray-400 uppercase text-center tracking-[0.2em] px-8">Read our <span className="text-[#C48B8B] cursor-pointer underline">Privacy Policy</span> regarding background screenings.</p>
            </div>
          )}

          {/* SCREEN 6: RUNNER AGREEMENT */}
          {step === 6 && (
            <div className="space-y-8 animate-fadeIn">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Runner Agreement</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Please review the agreement outlining expectations, responsibilities, and conduct.</p>
              </header>

              <div className="bg-white p-8 rounded-[40px] h-64 overflow-y-auto border border-[#1A1A1A]/5 text-[10px] font-medium leading-relaxed text-gray-600 uppercase tracking-widest no-scrollbar">
                <p className="mb-6">As a Beauty Runn Partner, you agree to provide high-quality delivery services to our customers.</p>
                <p className="mb-6">1. CONDUCT: Runners must maintain a professional demeanor at all times during pickups and deliveries.</p>
                <p className="mb-6">2. COMPLIANCE: You agree to follow all local, state, and federal laws, including traffic and vehicle safety regulations.</p>
                <p className="mb-6">3. SOURCING: You will verify all product packaging as requested by the app to ensure retail accuracy.</p>
                <p className="mb-6">4. INDEPENDENT CONTRACTOR: You acknowledge you are an independent contractor, not an employee of Beauty Runn.</p>
                <p className="mb-6">5. DATA PRIVACY: You agree to protect customer data and never contact customers outside the app interface.</p>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Type Legal Name to Sign</label>
                <input 
                  type="text"
                  value={formData.signature}
                  onChange={e => setFormData({...formData, signature: e.target.value})}
                  placeholder="Your Full Name"
                  className="w-full p-8 bg-[#1A1A1A] text-white rounded-[32px] outline-none focus:ring-4 focus:ring-[#C48B8B]/20 font-serif text-3xl italic shadow-xl"
                />
              </div>
            </div>
          )}

          {/* SCREEN 7: SUBMITTED / STATUS */}
          {step === 7 && (
            <div className="space-y-12 animate-fadeIn h-full flex flex-col justify-center text-center py-10">
              <div className="space-y-6">
                <div className="w-32 h-32 bg-white rounded-[50px] flex items-center justify-center text-[#10B981] text-5xl mx-auto shadow-2xl border border-gray-100">
                  {formData.status === 'APPROVED' ? <i className="fa-solid fa-circle-check"></i> : <i className="fa-solid fa-hourglass-half animate-pulse"></i>}
                </div>
                <div className="space-y-3">
                  <h1 className="font-serif text-5xl italic text-[#1A1A1A]">
                    {formData.status === 'APPROVED' ? "You're Approved!" : "Application Submitted"}
                  </h1>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C48B8B]">
                    Status: {formData.status === 'APPROVED' ? "Runner Activated" : "Under Review"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[50px] border border-[#1A1A1A]/5 shadow-luxury">
                <p className="text-[11px] font-medium leading-relaxed text-[#1A1A1A]/70 italic">
                  {formData.status === 'APPROVED' 
                    ? "Welcome to Beauty Runn. You can now accept delivery requests and start earning. Go online to see live requests in your neighborhood."
                    : "Thanks for applying! Our team is reviewing your documents and vehicle details. Verification typically takes 24-48 hours. We'll notify you via email."}
                </p>
              </div>

              {formData.status === 'APPROVED' ? (
                <button 
                  onClick={() => onComplete({ ...formData, status: 'APPROVED' })} 
                  className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95"
                >
                  Go Online
                </button>
              ) : (
                <button onClick={onCancel} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95">Back to Home</button>
              )}
            </div>
          )}

          {/* BUTTONS FOOTER FOR FLOW */}
          {step < 7 && (
            <div className="p-8 border-t border-[#1A1A1A]/5 bg-[#EDE4DB]/80 backdrop-blur-md sticky bottom-0 -mx-8">
              <div className="max-w-md mx-auto flex gap-4">
                {step > 1 && (
                  <button 
                    onClick={prevStep}
                    className="w-16 h-16 rounded-2xl bg-white text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100 shadow-sm"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                )}
                <button 
                  disabled={!isFormValid()}
                  onClick={step === 6 ? () => { setStep(7); onComplete({ ...formData, status: 'SUBMITTED' }); } : nextStep}
                  className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none ${
                    step === 6 ? 'bg-[#10B981] text-white shadow-[#10B981]/20' : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {step === 6 ? 'Agree & Finish' : step === 5 ? 'Agree & Submit' : 'Continue'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DriverOnboarding;
