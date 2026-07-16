import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';

// Pages
import { Login } from './pages/Login.jsx';
import { EmployeeDashboard } from './pages/EmployeeDashboard.jsx';
import { SupportDashboard } from './pages/SupportDashboard.jsx';
import { ManagerDashboard } from './pages/ManagerDashboard.jsx';
import { CreateTicket } from './pages/CreateTicket.jsx';
import { TicketDetails } from './pages/TicketDetails.jsx';
import { Unauthorized } from './pages/Unauthorized.jsx';
import { NotFound } from './pages/NotFound.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route
              path="/employee"
              element={
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              }
            />
            <Route
              path="/create-ticket"
              element={
                <Layout>
                  <CreateTicket />
                </Layout>
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['support']} />}>
            <Route
              path="/support"
              element={
                <Layout>
                  <SupportDashboard />
                </Layout>
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
            <Route
              path="/manager"
              element={
                <Layout>
                  <ManagerDashboard />
                </Layout>
              }
            />
          </Route>

          {/* Shared Protected Route for Ticket Details */}
          <Route element={<ProtectedRoute allowedRoles={['employee', 'support', 'manager']} />}>
            <Route
              path="/tickets/:id"
              element={
                <Layout>
                  <TicketDetails />
                </Layout>
              }
            />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
