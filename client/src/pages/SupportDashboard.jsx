import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { TicketTable } from '../components/TicketTable.jsx';
import { Search, RefreshCw, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function SupportDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab control
  const [activeTab, setActiveTab] = useState('all'); // all, mine, unassigned

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

  // Filter based on active tab
  const getFilteredTickets = () => {
    if (activeTab === 'mine') {
      return tickets.filter(t => t.assigned_to === user.id);
    }
    if (activeTab === 'unassigned') {
      return tickets.filter(t => t.assigned_to === null);
    }
    return tickets;
  };

  // Stats calculation
  const totalAvailable = tickets.length;
  const mineCount = tickets.filter(t => t.assigned_to === user.id).length;
  const unassignedCount = tickets.filter(t => t.assigned_to === null).length;
  const resolvedCount = tickets.filter(t => t.assigned_to === user.id && t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Staff Portal</h1>
        <p className="text-gray-500 text-sm mt-1">Manage, assign, and resolve client support requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Assigned to Me</span>
            <span className="text-xl font-bold text-gray-900">{mineCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-full">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Unassigned</span>
            <span className="text-xl font-bold text-gray-900">{unassignedCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Available</span>
            <span className="text-xl font-bold text-gray-900">{totalAvailable}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center space-x-3 shadow-xs">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">My Resolved</span>
            <span className="text-xl font-bold text-gray-900">{resolvedCount}</span>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Available ({totalAvailable})
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`pb-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'mine'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assigned to Me ({mineCount})
          </button>
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`pb-4 px-1 border-b-2 font-bold text-sm transition-colors ${
              activeTab === 'unassigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Unassigned ({unassignedCount})
          </button>
        </nav>
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
          <p className="mt-4 text-gray-500 text-sm font-medium">Fetching support dashboard tickets...</p>
        </div>
      ) : (
        <TicketTable tickets={getFilteredTickets()} />
      )}
    </div>
  );
}
