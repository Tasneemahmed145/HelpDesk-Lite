import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { PriorityBadge } from '../components/PriorityBadge.jsx';
import { ArrowLeft, User, Calendar, Tag, ShieldAlert, Award, CheckSquare, Clipboard, RefreshCw } from 'lucide-react';

export function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');

  // Fixed support staff dropdown list (v1 limitation to prevent adding extra APIs)
  const SUPPORT_STAFF = [
    { id: 3, name: 'Carol Davis' },
    { id: 4, name: 'David Wilson' },
  ];

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTicket(id);
      setTicket(data);
      if (data.assigned_to) {
        setAssigneeId(data.assigned_to.toString());
      } else {
        setAssigneeId('');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assigneeId) return;

    setSubmitting(true);
    setError('');
    try {
      const updated = await api.assignTicket(id, parseInt(assigneeId, 10));
      // Re-fetch ticket details to refresh names and history logs
      await fetchTicketDetails();
    } catch (err) {
      setError(err.message || 'Failed to update assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    // Simple confirmation dialog
    if (!window.confirm(`Are you sure you want to transition the ticket to "${newStatus}"?`)) {
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.updateTicketStatus(id, newStatus);
      await fetchTicketDetails();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBackPath = () => {
    if (user?.role === 'employee') return '/employee';
    if (user?.role === 'support') return '/support';
    if (user?.role === 'manager') return '/manager';
    return '/';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading ticket details...</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700">
          {error}
        </div>
        <Link to={getBackPath()} className="inline-flex items-center space-x-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Navigation */}
      <div className="flex justify-between items-center">
        <Link
          to={getBackPath()}
          className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-sm font-bold text-gray-400">Ticket #{ticket.id}</span>
      </div>

      {/* Title & Core Meta */}
      <div className="border-b border-gray-200 pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{ticket.title}</h1>
          <div className="flex items-center space-x-2 shrink-0">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-700">Category:</span>
            <span>{ticket.category}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-700">Created:</span>
            <span>{formatDate(ticket.created_at)}</span>
          </div>
          {ticket.closed_at && (
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-emerald-700">Closed:</span>
              <span className="text-emerald-600 font-medium">{formatDate(ticket.closed_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Description vs Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Ticket Description</h3>
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Status History Logs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Clipboard className="w-5 h-5 text-gray-400" />
              <span>Status History Log</span>
            </h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {ticket.history && ticket.history.map((log, idx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {idx !== ticket.history.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                            <RefreshCw className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Status changed {log.previous_status ? `from "${log.previous_status}" ` : ''}to{' '}
                              <span className="font-semibold text-gray-900">"{log.new_status}"</span> by{' '}
                              <span className="font-semibold text-gray-900">{log.changed_by_name}</span>
                            </p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-gray-400">
                            {formatDate(log.changed_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Meta & Action Panel */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">People</h3>
            
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
              <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 block font-semibold uppercase">Created By</span>
                <span className="text-sm font-semibold text-gray-800">{ticket.created_by_name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 block font-semibold uppercase">Assigned Agent</span>
                <span className="text-sm font-semibold text-gray-800">{ticket.assigned_to_name}</span>
              </div>
            </div>
          </div>

          {/* Error inside Action Panel */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Action Card (Only for Support role) */}
          {user?.role === 'support' && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-6">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Support Actions</h3>
              
              {/* Assignment Form */}
              <form onSubmit={handleAssign} className="space-y-3">
                <label htmlFor="assign" className="block text-xs font-bold text-gray-500 uppercase">
                  Assign Ticket To
                </label>
                <div className="flex gap-2">
                  <select
                    id="assign"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={submitting || ticket.status === 'Closed'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">-- Select Support Staff --</option>
                    {SUPPORT_STAFF.map(staff => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={submitting || !assigneeId || ticket.status === 'Closed'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded shadow-sm disabled:opacity-50 transition-colors shrink-0"
                  >
                    Assign
                  </button>
                </div>
              </form>

              {/* Status workflow transitions */}
              {ticket.assigned_to === user.id && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <span className="block text-xs font-bold text-gray-500 uppercase">
                    Workflow Actions
                  </span>
                  
                  <div className="flex flex-col gap-2">
                    {ticket.status === 'Open' && (
                      <button
                        onClick={() => handleStatusChange('In Progress')}
                        disabled={submitting}
                        className="w-full text-center py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded shadow-sm transition-colors"
                      >
                        Start Progress (Open → In Progress)
                      </button>
                    )}
                    
                    {ticket.status === 'In Progress' && (
                      <button
                        onClick={() => handleStatusChange('Resolved')}
                        disabled={submitting}
                        className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded shadow-sm transition-colors"
                      >
                        Resolve Ticket (In Progress → Resolved)
                      </button>
                    )}

                    {ticket.status === 'Resolved' && (
                      <button
                        onClick={() => handleStatusChange('Closed')}
                        disabled={submitting}
                        className="w-full text-center py-2 bg-gray-700 hover:bg-gray-800 text-white font-bold text-sm rounded shadow-sm transition-colors"
                      >
                        Close Ticket (Resolved → Closed)
                      </button>
                    )}

                    {ticket.status === 'Closed' && (
                      <div className="bg-gray-50 border border-gray-200 text-gray-500 p-3 rounded text-center text-xs font-medium">
                        This ticket is closed and cannot be modified.
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Alert message if support user is not assigned but tries to change status */}
              {ticket.status !== 'Closed' && ticket.assigned_to !== user.id && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded text-xs text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>You must assign this ticket to yourself to perform status updates.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
