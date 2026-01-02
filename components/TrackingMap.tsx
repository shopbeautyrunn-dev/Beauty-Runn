
import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants';

interface TrackingMapProps {
  status: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ status }) => {
  const [driverPos, setDriverPos] = useState({ x: 20, y: 20 });
  
  useEffect(() => {
    if (status === 'IN_TRANSIT' || status === 'PICKING_UP' || status === 'ACCEPTED') {
      const interval = setInterval(() => {
        setDriverPos(prev => ({
          x: Math.min(prev.x + 0.5, 80),
          y: Math.min(prev.y + 0.3, 70)
        }));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="relative w-full h-full bg-[#EDE4DB] rounded-xl overflow-hidden border border-[#1A1A1A]/5">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Simplified Map Roads - Refined Palette */}
        <path d="M0 20 H100 M20 0 V100 M80 0 V100 M0 70 H100" stroke="#DED0C1" strokeWidth="1" fill="none" />
        
        {/* Vendor Icon */}
        <circle cx="20" cy="20" r="4" fill="#C48B8B" />
        <text x="12" y="14" fontSize="3" fontWeight="900" fill="#1A1A1A" className="uppercase tracking-widest font-black">Hub</text>
        
        {/* Destination Icon */}
        <circle cx="80" cy="70" r="4" fill="#1A1A1A" />
        <text x="75" y="80" fontSize="3" fontWeight="900" fill="#1A1A1A" className="uppercase tracking-widest font-black">You</text>
        
        {/* Path line */}
        <path d={`M20 20 L${driverPos.x} ${driverPos.y}`} stroke="#C48B8B" strokeWidth="0.5" strokeDasharray="2" />
        
        {/* Driver marker */}
        <g transform={`translate(${driverPos.x - 3}, ${driverPos.y - 3})`}>
          <circle cx="3" cy="3" r="3" fill="#C48B8B" className="animate-pulse" />
          <path d="M3 0 L6 6 L0 6 Z" fill="white" transform="scale(0.5) translate(3, 3)" />
        </g>
      </svg>
      
      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl text-[9px] border border-[#1A1A1A]/5 font-black uppercase tracking-[0.2em] text-[#1A1A1A]">
        <i className="fa-solid fa-satellite-dish mr-2 text-[#C48B8B] animate-pulse"></i>
        Live GPS Tracking
      </div>
    </div>
  );
};

export default TrackingMap;
