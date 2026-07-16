import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { ArrowLeft, Save } from 'lucide-react';

export function CreateTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('Medium');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Please fill in both Title and Description.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.createTicket({ title, description, category, priority });
      setSuccess('Ticket created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/employee');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create ticket.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/employee"
          className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Support Ticket</h1>
        <p className="text-gray-500 text-sm mt-1">Please describe your technical issue or support request in detail</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
            Ticket Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g. Cannot connect to Office Printer"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
            Detailed Description
          </label>
          <textarea
            id="description"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Provide step-by-step details about the issue..."
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Technical Issue">Technical Issue</option>
              <option value="Account Issue">Account Issue</option>
              <option value="Hardware Issue">Hardware Issue</option>
              <option value="Software Issue">Software Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
          <Link
            to="/employee"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-5 py-2 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Creating...' : 'Create Ticket'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
