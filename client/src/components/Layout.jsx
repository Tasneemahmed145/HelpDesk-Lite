import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, LifeBuoy, PlusCircle, LayoutDashboard, User } from 'lucide-react';

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'employee') return '/employee';
    if (user.role === 'support') return '/support';
    if (user.role === 'manager') return '/manager';
    return '/unauthorized';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded text-white">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">HelpDesk <span className="text-blue-600 font-medium">Lite</span></span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{user?.role}</span>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-24 space-y-6">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3 px-3">Navigation</span>
              <nav className="space-y-1">
                <Link
                  to={getDashboardPath()}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    isActive(getDashboardPath())
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {user?.role === 'employee' && (
                  <Link
                    to="/create-ticket"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                      isActive('/create-ticket')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Ticket</span>
                  </Link>
                )}
              </nav>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-3 px-3">
                <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-gray-800 truncate">{user?.name}</span>
                  <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
