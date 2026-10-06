import React from 'react';

export const KpiCard = ({ title, value, subtitle, icon: Icon, variant = 'blue', onClick }) => {
  const variantStyles = {
    blue: 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0369A1] icon-bg-[#BAE6FD]',
    cyan: 'bg-[#ECFEFF] border-[#A5F3FC] text-[#0891B2] icon-bg-[#A5F3FC]',
    yellow: 'bg-[#FEF9C3] border-[#FDE047] text-[#CA8A04] icon-bg-[#FDE047]',
    pink: 'bg-[#FFE4E6] border-[#FDA4AF] text-[#E11D48] icon-bg-[#FDA4AF]',
  };

  const currentVariant = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${currentVariant} flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-xs flex items-center justify-center shadow-xs">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">{value}</h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</p>
        {subtitle && <span className="text-[11px] text-slate-500 font-medium block mt-1">{subtitle}</span>}
      </div>
    </div>
  );
};
