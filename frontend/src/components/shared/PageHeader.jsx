import React from 'react';

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight break-words">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap [&>button]:max-sm:flex-1">{actions}</div>}
    </div>
  );
}
