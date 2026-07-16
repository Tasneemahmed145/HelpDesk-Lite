import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import { PriorityBadge } from './PriorityBadge.jsx';
import { ArrowUpRight } from 'lucide-react';

export function TicketTable({ tickets }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
        <p className="text-gray-500 font-medium">No tickets found matching current criteria.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Created Date
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                #{ticket.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900 truncate max-w-xs sm:max-w-sm">
                  {ticket.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {ticket.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(ticket.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-900 transition-colors"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
