import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const StatusBadge = ({ status, isDelayed }) => {
  if (isDelayed || status?.toLowerCase() === 'delayed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        Delayed
      </span>
    );
  }

  if (status?.toLowerCase() === 'delivered') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Delivered
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      {status || 'In Transit'}
    </span>
  );
};
