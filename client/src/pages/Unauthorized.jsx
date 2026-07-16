import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';

export function Unauthorized() {
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'employee') return '/employee';
    if (user.role === 'support') return '/support';
    if (user.role === 'manager') return '/manager';
    return '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 font-sans">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-center text-red-500">
          <ShieldAlert className="w-16 h-16" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">403 Unauthorized Access</h1>
          <p className="text-gray-500 text-sm">
            You do not have permission to view or modify this resource.
          </p>
        </div>
        <div>
          <Link
            to={getDashboardPath()}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
