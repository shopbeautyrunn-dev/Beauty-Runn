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
    <div className="relative w-full h-full bg-pink-50 rounded-xl overflow-hidden border border-pink-100">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Simplified Map Roads */}
        <path d="M0 20 H100 M20 0 V100 M80 0 V100 M0 70 H100" stroke="#fce7f3" strokeWidth="2" fill="none" />
        
        {/* Vendor Icon */}
        <circle cx="20" cy="20" r="4" fill={COLORS.primary} />
        <text x="12" y="14" fontSize="3" fontWeight="900" fill={COLORS.dark} className="uppercase tracking-tighter">Hub</text>
        
        {/* Destination Icon */}
        <circle cx="80" cy="70" r="4" fill="#10b981" />
        <text x="75" y="80" fontSize="3" fontWeight="900" fill={COLORS.dark} className="uppercase tracking-tighter">You</text>
        
        {/* Path line */}
        <path d={`M20 20 L${driverPos.x} ${driverPos.y}`} stroke={COLORS.primary} strokeWidth="0.5" strokeDasharray="2" />
        
        {/* Driver marker */}
        <g transform={`translate(${driverPos.x - 3}, ${driverPos.y - 3})`}>
          <circle cx="3" cy="3" r="3" fill={COLORS.primary} className="animate-pulse" />
          <path d="M3 0 L6 6 L0 6 Z" fill="white" transform="scale(0.5) translate(3, 3)" />
        </g>
      </svg>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-lg text-[10px] border border-pink-100 font-black uppercase tracking-widest text-pink-600">
        <i className="fa-solid fa-satellite-dish mr-2 animate-pulse"></i>
        Runner GPS: Active
      </div>
    </div>
  );
};

export default TrackingMap;
