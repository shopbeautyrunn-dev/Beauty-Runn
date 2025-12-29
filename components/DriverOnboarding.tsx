
import React, { useState } from 'react';
import { DriverApplication, DriverOnboardingStatus } from '../types';
import { COLORS } from '../constants';

interface DriverOnboardingProps {
  onComplete: (data: DriverApplication) => void;
  onCancel: () => void;
}

const DriverOnboarding: React.FC<DriverOnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  // Fix: Added the missing 'status' property to the initial state to match the DriverApplication type definition in types.ts.
  const [formData, setFormData] = useState<DriverApplication>({
    fullName: '',
    dob: '',
    ssn: '',
    address: '',
    email: '',
    documents: {
      license: null,
      ssnCard: null,
      insurance: null,
    },
    consentBackgroundCheck: false,
    status: 'NOT_STARTED',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: keyof DriverApplication['documents']) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would be a secure upload to S3/Cloudinary
      // Here we simulate with a temporary blob URL for UI feedback
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
    if (step === 1) return formData.fullName && formData.dob && formData.ssn && formData.email;
    if (step === 2) return formData.documents.license && formData.documents.ssnCard && formData.documents.insurance;
    if (step === 3) return formData.consentBackgroundCheck;
    return true;
  };

  const renderProgress = () => (
    <div className="flex gap-2 mb-8">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-pink-600' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[500] bg-white safe-top safe-bottom flex flex-col animate-fadeIn">
      <nav className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          <i className="fa-solid fa-xmark mr-2"></i> Exit
        </button>
        <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-900">Runner Application</span>
        <div className="w-10" />
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8">
        <div className="max-w-md mx-auto">
          {renderProgress()}

          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-gray-900">Personal Info</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">Step 1: Identity Verification</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Legal Name</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="First and Last Name"
                    className="w-full p-6 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Date of Birth</label>
                    <input 
                      type="date"
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="w-full p-6 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Last 4 of SSN</label>
                    <input 
                      type="password"
                      maxLength={4}
                      value={formData.ssn}
                      onChange={e => setFormData({...formData, ssn: e.target.value})}
                      placeholder="****"
                      className="w-full p-6 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Home Address</label>
                  <input 
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Street, City, TX"
                    className="w-full p-6 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@beautyrunn.com"
                    className="w-full p-6 bg-gray-50 rounded-3xl outline-none focus:ring-2 focus:ring-pink-100 font-bold"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex gap-4">
                  <i className="fa-solid fa-shield-halved text-green-500 mt-1"></i>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-relaxed">Your sensitive data is encrypted before transit and stored in compliance with Texas PII laws.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-gray-900">Documents</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">Step 2: Credential Capture</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'license', label: "Driver's License", icon: 'fa-id-card' },
                  { id: 'ssnCard', label: "SSN Card", icon: 'fa-address-card' },
                  { id: 'insurance', label: "Car Insurance", icon: 'fa-car-burst' }
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
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50 group-hover:border-pink-300'
                    }`}>
                      {formData.documents[doc.id as keyof typeof formData.documents] ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <i className="fa-solid fa-check"></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-700">{doc.label} Ready</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                            <i className={`fa-solid ${doc.icon}`}></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Upload {doc.label}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-gray-900">Verification</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">Step 3: Background Consent</p>
              </div>

              <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-6">
                <i className="fa-solid fa-user-check text-4xl text-pink-500"></i>
                <h3 className="text-xl font-black uppercase tracking-tight">Standard Background Check</h3>
                <p className="text-[10px] text-white/60 font-medium leading-relaxed uppercase tracking-widest">
                  Beauty Runn partners with Checkr to conduct professional screening. 
                  This includes driving records, criminal history, and employment verification.
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setFormData({...formData, consentBackgroundCheck: !formData.consentBackgroundCheck})}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      formData.consentBackgroundCheck ? 'bg-pink-600' : 'bg-white/10'
                    }`}
                  >
                    {formData.consentBackgroundCheck && <i className="fa-solid fa-check text-sm"></i>}
                  </button>
                  <span className="text-[9px] font-black uppercase tracking-widest flex-1">
                    I authorize Beauty Runn to conduct a background check.
                  </span>
                </div>
              </div>

              <div className="space-y-2 px-4">
                <p className="text-[8px] font-black text-gray-400 uppercase leading-relaxed">
                  By clicking submit, you agree to our Runner Terms of Service and Privacy Policy. 
                  Verification typically takes 24-48 business hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 border-t border-gray-50 bg-white">
        <div className="max-w-md mx-auto flex gap-4">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-all"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
          <button 
            disabled={!isFormValid()}
            onClick={step === 3 ? () => onComplete(formData) : nextStep}
            className={`flex-1 py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none ${
              step === 3 ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
            }`}
          >
            {step === 3 ? 'Submit Application' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverOnboarding;
