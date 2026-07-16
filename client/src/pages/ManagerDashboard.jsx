import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { TicketTable } from '../components/TicketTable.jsx';
import { Search, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function ManagerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTickets({ search, category, priority, status });
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [category, priority, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  // Stats calculation
  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedClosedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Global read-only overview of all support tickets</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Global Tickets</span>
            <span className="text-xl font-bold text-gray-900">{total}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-full">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Open</span>
            <span className="text-xl font-bold text-gray-900">{openCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-bold text-gray-900">{inProgressCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Resolved/Closed</span>
            <span className="text-xl font-bold text-gray-900">{resolvedClosedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Account Issue">Account Issue</option>
              <option value="Hardware Issue">Hardware Issue</option>
              <option value="Software Issue">Software Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            
            <button
              type="submit"
              className="inline-flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-colors"
              title="Apply Search"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm font-medium">Fetching support tickets...</p>
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}
