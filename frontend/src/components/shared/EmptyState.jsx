import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 bg-blue-600 hover:bg-blue-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}