import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import TrackingPage from './pages/TrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UnlockPage from './pages/UnlockPage';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top sticky navigation bar */}
      <Navbar />

      {/* Main page content area */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/track" element={<PageTransition><TrackingPage /></PageTransition>} />
          <Route path="/track/:orderId" element={<PageTransition><TrackingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          
          {/* User Protected Unlock Wizard */}
          <Route 
            path="/unlock" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <UnlockPage />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          
          {/* User Protected Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <UserDashboard />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute adminOnly={true}>
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-3xl font-extrabold text-rose-500 mb-2">404 - Not Found</h2>
              <p className="text-dark-muted">The page you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </main>

      {/* Footer copyright and links */}
      <Footer />
    </div>
  );
}

export default App;
