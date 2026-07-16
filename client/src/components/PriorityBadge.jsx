import React from 'react';

export function PriorityBadge({ priority }) {
  const styles = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-orange-100 text-orange-800',
    'High': 'bg-red-100 text-red-800',
  };

  const style = styles[priority] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${style}`}>
      {priority}
    </span>
  );
}
