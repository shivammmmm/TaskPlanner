import React from 'react';
import { Link } from 'react-router-dom';

export default function StatCard({ icon: Icon, label, value, color = 'blue', trend, to }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  const content = (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow ${to ? 'cursor-pointer hover:border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );

  if (!to) return content;
  return <Link to={to} className="block rounded-xl focus:outline-none">{content}</Link>;
}
