import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Info, AlertTriangle, AlertCircle, CheckCircle, Flame } from 'lucide-react';

export interface CalloutProps {
  type: 'info' | 'warning' | 'danger' | 'success' | 'toxic' | 'red' | 'amber' | 'lime' | 'blue';
  title?: string;
  children: React.ReactNode;
  className?: string;
  role?: string;
}

export const Callout: React.FC<CalloutProps> = ({ type, title, children, className, role }) => {
  const styles: Record<string, { container: string; icon: React.ReactNode }> = {
    info: {
      container: "bg-blue-400/10 border-l-blue-400",
      icon: <Info className="w-4 h-4 text-blue-400" />,
    },
    blue: {
      container: "bg-blue-400/10 border-l-blue-400",
      icon: <Info className="w-4 h-4 text-blue-400" />,
    },
    warning: {
      container: "bg-yellow-400/10 border-l-yellow-400",
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    },
    amber: {
      container: "bg-yellow-400/10 border-l-yellow-400",
      icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    },
    danger: {
      container: "bg-red-400/10 border-l-red-400",
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    },
    red: {
      container: "bg-red-400/10 border-l-red-400",
      icon: <AlertCircle className="w-4 h-4 text-red-400" />,
    },
    toxic: {
      container: "bg-purple-400/10 border-l-purple-400",
      icon: <Flame className="w-4 h-4 text-purple-400" />,
    },
    success: {
      container: "bg-emerald-400/10 border-l-emerald-400",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    },
    lime: {
      container: "bg-emerald-400/10 border-l-emerald-400",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    },
  };

  const style = styles[type] || styles.info;

  const defaultRole = ['danger', 'warning', 'red', 'amber', 'toxic'].includes(type) ? 'alert' : 'status';
  const computedRole = role || defaultRole;

  return (
    <div role={computedRole} className={twMerge(clsx("flex gap-3.5 p-4 rounded-md my-5 border-l-[3px] font-sans text-[0.875rem] leading-[1.78]", style.container, className))}>
      <div className="shrink-0 mt-0.5">
        {style.icon}
      </div>
      <div className="flex-1">
        {title && (
          <span className="font-bold text-[#f0f6ff] block mb-1 font-sans text-[0.95rem]">
            {title}
          </span>
        )}
        <div className="text-[#94a3b8]">
          {children}
        </div>
      </div>
    </div>
  );
};
