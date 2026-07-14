import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, AlertCircle, ShieldAlert, KeyRound, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLoginPage = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect admin users if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied. Ordinary accounts cannot enter the admin console.');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
    } else if (result.user.role !== 'admin') {
      setError('Access denied. Ordinary accounts cannot enter the admin console.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative">
      {/* Admin Glow Orbs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl border-purple-500/20 shadow-purple-500/5"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-glow-purple">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Admin Console</h2>
          <p className="text-sm text-dark-muted mt-2">Log in with system administrator credentials</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-450 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-dark-muted" />
              <input 
                type="email" 
                placeholder="admin@imeiportal.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Secret Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-dark-muted" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Login to Back-Office"
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-dark-border/40 pt-4 text-center text-xs text-dark-muted">
          Note: Default seeding password is <code className="text-purple-400 font-mono">adminpassword123</code>.
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
