
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
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#C48B8B]' : 'bg-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] bg-[#EDE4DB] safe-top safe-bottom flex flex-col animate-fadeIn">
      <nav className="px-8 py-6 border-b border-[#1A1A1A]/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
        <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A]">
          <i className="fa-solid fa-xmark mr-2"></i> Exit Application
        </button>
        <span className="font-serif text-xl italic text-[#1A1A1A]">Beauty Runn Partner Portal</span>
        <div className="w-10" />
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-md mx-auto h-full flex flex-col">
          
          {step < 7 && renderProgress()}

          {/* SCREEN 1: INTRO */}
          {step === 1 && (
            <div className="space-y-10 animate-fadeIn h-full flex flex-col justify-center py-10">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-[#1A1A1A] rounded-[40px] flex items-center justify-center text-[#C48B8B] text-4xl mx-auto shadow-2xl">
                  <i className="fa-solid fa-bolt-lightning"></i>
                </div>
                <h1 className="font-serif text-5xl italic text-[#1A1A1A]">The Runner Network</h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C48B8B]">Houston's Elite Delivery Team</p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: 'fa-hand-holding-dollar', title: 'Earn on Your Terms', body: 'Keep 100% of tips + competitive Runner fees per delivery.' },
                  { icon: 'fa-calendar-heart', title: 'Ultimate Flexibility', body: 'Work whenever you have a few minutes or a full day.' },
                  { icon: 'fa-shield-heart', title: 'Houston Community', body: 'Support local beauty supply hubs and salon owners.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                    <div className="w-12 h-12 bg-[#EDE4DB] rounded-2xl flex items-center justify-center shrink-0 text-[#C48B8B] text-xl">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <h3 className="font-black text-[10px] uppercase tracking-widest text-[#1A1A1A]">{item.title}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <button onClick={nextStep} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95">Begin Enrollment</button>
              </div>
            </div>
          )}

          {/* SCREEN 2: PERSONAL INFO */}
          {step === 2 && (
            <div className="space-y-8 animate-slideUp">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Profile Details</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Let's start with the basics. Your information is encrypted and never shared.</p>
              </header>

              <div className="space-y-5">
                {[
                  { label: 'Full Legal Name', val: formData.fullName, key: 'fullName', type: 'text', placeholder: 'Legal Name' },
                  { label: 'Date of Birth', val: formData.dob, key: 'dob', type: 'date' },
                  { label: 'Email Address', val: formData.email, key: 'email', type: 'email', placeholder: 'Email Address' },
                  { label: 'Phone Number', val: formData.phone, key: 'phone', type: 'tel', placeholder: 'Phone Number' },
                  { label: 'Home Address', val: formData.address, key: 'address', type: 'text', placeholder: 'Street Address' },
                  { label: 'ZIP Code', val: formData.zipCode, key: 'zipCode', type: 'text', placeholder: 'Houston ZIP' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">{field.label}</label>
                    <input 
                      type={field.type}
                      value={field.val}
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                      placeholder={field.placeholder}
                      className="w-full p-6 bg-white rounded-3xl outline-none focus:ring-2 focus:ring-[#C48B8B]/20 font-bold border border-[#1A1A1A]/5 shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 3: IDENTITY VERIFICATION */}
          {step === 3 && (
            <div className="space-y-8 animate-slideUp">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Verification Scan</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Securely upload your credentials. We use these for identity and insurance compliance.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'licenseFront', label: "License (Front)", icon: 'fa-id-card' },
                  { id: 'licenseBack', label: "License (Back)", icon: 'fa-id-card' },
                  { id: 'ssnCard', label: "SSN Card / ID", icon: 'fa-address-card' },
                  { id: 'insurance', label: "Auto Insurance", icon: 'fa-car-burst' }
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
                      : 'border-white bg-white/50 group-hover:border-[#C48B8B]'
                    }`}>
                      {formData.documents[doc.id as keyof typeof formData.documents] ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-lg">
                            <i className="fa-solid fa-check"></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981]">{doc.label} Scanned</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm group-hover:text-[#C48B8B]">
                            <i className={`fa-solid ${doc.icon}`}></i>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Scan {doc.label}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 4: VEHICLE INFO */}
          {step === 4 && (
            <div className="space-y-8 animate-slideUp">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Runn Logistics</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Tell us about the vehicle you'll be using for your Runns.</p>
              </header>

              <div className="space-y-5">
                {[
                  { label: 'Vehicle Make', val: formData.vehicle.make, key: 'make', placeholder: 'e.g. Toyota' },
                  { label: 'Vehicle Model', val: formData.vehicle.model, key: 'model', placeholder: 'e.g. Camry' },
                  { label: 'Vehicle Year', val: formData.vehicle.year, key: 'year', placeholder: 'e.g. 2024' },
                  { label: 'License Plate', val: formData.vehicle.plate, key: 'plate', placeholder: 'e.g. ABC-1234' },
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
                      className="w-full p-6 bg-white rounded-3xl outline-none focus:ring-2 focus:ring-[#C48B8B]/20 font-bold border border-[#1A1A1A]/5 shadow-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 5: BACKGROUND CHECK */}
          {step === 5 && (
            <div className="space-y-8 animate-slideUp">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Safety Commitment</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">To ensure neighborhood trust, we conduct a standard background check for all Runners.</p>
              </header>

              <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C48B8B] rounded-full blur-[80px] opacity-20"></div>
                <div className="w-16 h-16 bg-[#C48B8B] rounded-3xl flex items-center justify-center text-2xl shadow-lg relative z-10">
                  <i className="fa-solid fa-shield-check"></i>
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="font-serif text-3xl italic">Authorization</h3>
                  <p className="text-[11px] font-medium leading-relaxed opacity-60 uppercase tracking-widest">I authorize Beauty Runn to use third-party screening services to verify my eligibility, including driving records and criminal history check.</p>
                </div>
                
                <div 
                  onClick={() => setFormData({...formData, consentBackgroundCheck: !formData.consentBackgroundCheck})}
                  className="flex items-center gap-4 pt-8 border-t border-white/10 cursor-pointer group relative z-10"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2 ${
                    formData.consentBackgroundCheck ? 'bg-[#C48B8B] border-[#C48B8B]' : 'bg-transparent border-white/20 group-hover:border-white/40'
                  }`}>
                    {formData.consentBackgroundCheck && <i className="fa-solid fa-check text-white text-xs"></i>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] flex-1">
                    I agree to the background screening process
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6: RUNNER AGREEMENT */}
          {step === 6 && (
            <div className="space-y-8 animate-slideUp">
              <header>
                <h2 className="font-serif text-4xl italic text-[#1A1A1A]">Partner Contract</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 leading-relaxed">Final step. Please review and sign the Independent Contractor agreement.</p>
              </header>

              <div className="bg-white p-8 rounded-[40px] h-64 overflow-y-auto border border-[#1A1A1A]/5 text-[10px] font-medium leading-relaxed text-gray-600 uppercase tracking-widest no-scrollbar shadow-inner">
                <p className="mb-6">As a Beauty Runn Partner, you are an independent contractor, not an employee.</p>
                <p className="mb-6">1. PROFESSIONALISM: Runners must act with the highest degree of professionalism when interacting with Boutique owners and Customers.</p>
                <p className="mb-6">2. COMPLIANCE: You must maintain valid insurance and a clean driving record while active on the platform.</p>
                <p className="mb-6">3. PRIVACY: Customer data is strictly confidential. Outside contact is prohibited.</p>
                <p className="mb-6">4. QUALITY: You will verify product packaging via the "Verify Real Packaging" tool when prompted to ensure accuracy.</p>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-4">Electronic Signature</label>
                <input 
                  type="text"
                  value={formData.signature}
                  onChange={e => setFormData({...formData, signature: e.target.value})}
                  placeholder="Full Legal Name"
                  className="w-full p-8 bg-[#1A1A1A] text-white rounded-[32px] outline-none focus:ring-4 focus:ring-[#C48B8B]/20 font-serif text-3xl italic shadow-xl text-center"
                />
              </div>
            </div>
          )}

          {/* SCREEN 7: SUBMITTED / STATUS */}
          {step === 7 && (
            <div className="space-y-12 animate-fadeIn h-full flex flex-col justify-center text-center py-10">
              <div className="space-y-6">
                <div className="w-32 h-32 bg-white rounded-[50px] flex items-center justify-center text-[#C48B8B] text-5xl mx-auto shadow-2xl border border-gray-100">
                  {formData.status === 'APPROVED' ? <i className="fa-solid fa-party-horn"></i> : <i className="fa-solid fa-hourglass-clock animate-pulse"></i>}
                </div>
                <div className="space-y-3">
                  <h1 className="font-serif text-5xl italic text-[#1A1A1A]">
                    {formData.status === 'APPROVED' ? "Activation Ready" : "Sourcing Approval"}
                  </h1>
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C48B8B]">
                    Status: {formData.status === 'APPROVED' ? "Approved Partner" : "Verification in Progress"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[50px] border border-[#1A1A1A]/5 shadow-luxury">
                <p className="text-[11px] font-medium leading-relaxed text-[#1A1A1A]/70 italic">
                  {formData.status === 'APPROVED' 
                    ? "Welcome to the Beauty Runn network. Your account is active. You can now toggle your status to Online to begin receiving neighborhood requests."
                    : "Excellent work. Your documents are being verified by our compliance team. You'll receive a notification as soon as your background check clears (usually 24-48h)."}
                </p>
              </div>

              {formData.status === 'APPROVED' ? (
                <button 
                  onClick={() => onComplete({ ...formData, status: 'APPROVED' })} 
                  className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl rose-glow transition-all active:scale-95"
                >
                  Start First Runn
                </button>
              ) : (
                <button onClick={onCancel} className="w-full bg-[#1A1A1A] text-white py-7 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95">Return to App</button>
              )}
            </div>
          )}

          {/* BUTTONS FOOTER FOR FLOW */}
          {step < 7 && (
            <div className="p-8 border-t border-[#1A1A1A]/5 bg-[#EDE4DB]/80 backdrop-blur-md sticky bottom-0 -mx-8 z-50">
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
                  className={`flex-1 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:bg-gray-300 disabled:text-gray-100 disabled:shadow-none ${
                    step === 6 ? 'bg-[#10B981] text-white shadow-[#10B981]/20' : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {step === 6 ? 'Sign & Complete' : step === 5 ? 'Authorize & Continue' : 'Next Step'}
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
