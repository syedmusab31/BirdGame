import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Birds from './pages/Birds';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/birds" element={<Birds />} />
                        <Route path="/deposits" element={<Deposits />} />
                        <Route path="/withdrawals" element={<Withdrawals />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;