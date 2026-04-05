import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskBadge, RiskLevel } from './RiskBadge';

export interface ThreatCardProps {
  title: React.ReactNode;
  severity: RiskLevel;
  children: React.ReactNode;
  className?: string;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({ title, severity, children, className }) => {
  const gradientColors = {
    critical: 'from-red-500',
    high: 'from-yellow-400',
    medium: 'from-blue-500',
    info: 'from-cyan-400',
  };

  return (
    <div className={twMerge(clsx("bg-[#1c2333] border border-[#2a3548] rounded-lg p-5 relative overflow-hidden transition-colors duration-200 hover:border-[#4a6080]", className))}>
      {/* Top Gradient Line */}
      <div 
        className={clsx("absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r to-transparent", gradientColors[severity])}
      />
      
      <h3 className="font-sans font-bold text-[0.95rem] text-[#f0f6ff] mb-1">
        {title}
      </h3>
      
      <div className="mb-3">
        <RiskBadge level={severity}>{severity}</RiskBadge>
      </div>
      
      <div className="text-[0.82rem] text-slate-200 leading-[1.7]">
        {children}
      </div>
    </div>
  );
};
