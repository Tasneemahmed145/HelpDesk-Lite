import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    'Open': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Closed': 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const style = styles[status] || 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status}
    </span>
  );
}
