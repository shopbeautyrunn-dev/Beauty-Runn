
import React from 'react';
import { BeautyVendor } from '../types';
import { HOUSTON_BOUNDS, HOUSTON_ZIP_COORDS } from '../services/locationService';

interface VendorMapProps {
  vendors: BeautyVendor[];
  userZip: string;
  onSelectVendor: (v: BeautyVendor) => void;
}

const VendorMap: React.FC<VendorMapProps> = ({ vendors, userZip, onSelectVendor }) => {
  // Utility to project lat/lng to 0-100 SVG space based on Houston bounds
  const project = (lat: number, lng: number) => {
    const x = ((lng - HOUSTON_BOUNDS.minLng) / (HOUSTON_BOUNDS.maxLng - HOUSTON_BOUNDS.minLng)) * 100;
    const y = 100 - (((lat - HOUSTON_BOUNDS.minLat) / (HOUSTON_BOUNDS.maxLat - HOUSTON_BOUNDS.minLat)) * 100);
    return { x, y };
  };

  const userCoords = HOUSTON_ZIP_COORDS[userZip] || HOUSTON_ZIP_COORDS['77002'];
  const userPos = project(userCoords.lat, userCoords.lng);

  return (
    <div className="relative w-full h-[450px] bg-[#DED0C1] rounded-[40px] overflow-hidden border border-[#1A1A1A]/5 shadow-inner">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Houston Geographic Grid */}
        <path d="M0 25 H100 M0 50 H100 M0 75 H100 M25 0 V100 M50 0 V100 M75 0 V100" stroke="#C8B8A8" strokeWidth="0.2" fill="none" />
        
        {/* Houston Major Arterials (Simulated) */}
        <path d="M10 50 Q50 50 90 50" stroke="#C48B8B" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        <path d="M50 10 Q50 50 50 90" stroke="#C48B8B" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />

        {/* User Marker */}
        <g transform={`translate(${userPos.x}, ${userPos.y})`}>
          <circle r="2.5" fill="#1A1A1A" className="animate-pulse" />
          <text y="-5" fontSize="3" fontWeight="900" textAnchor="middle" className="uppercase tracking-widest font-black" fill="#1A1A1A">Current Location ({userZip})</text>
        </g>

        {/* Vendor Markers */}
        {vendors.map((v) => {
          const pos = project(v.lat, v.lng);
          return (
            <g key={v.id} transform={`translate(${pos.x}, ${pos.y})`} className="cursor-pointer group" onClick={() => onSelectVendor(v)}>
              <circle r="3.5" fill="#C48B8B" className="group-hover:scale-150 transition-transform shadow-xl" />
              <circle r="6" fill="#C48B8B" fillOpacity="0.2" className="animate-ping" />
              <g className="opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                <rect x="-20" y="-12" width="40" height="8" rx="2" fill="white" stroke="#1A1A1A" strokeWidth="0.2" />
                <text y="-7" fontSize="2.5" fontWeight="900" textAnchor="middle" className="uppercase tracking-widest font-black" fill="#1A1A1A">{v.name}</text>
              </g>
            </g>
          );
        })}
      </svg>
      
      <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl text-[8px] font-black uppercase tracking-[0.3em] text-[#1A1A1A] flex items-center gap-3 border border-white/50">
        <i className="fa-solid fa-satellite text-[#C48B8B] animate-pulse"></i>
        Live Houston Spatial Hub
      </div>

      <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-[7px] font-black uppercase text-gray-500">
        Projection: Houston Metro Area
      </div>
    </div>
  );
};

export default VendorMap;
