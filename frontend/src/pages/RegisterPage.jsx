import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2, AlertCircle, KeyRound, Mail, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await register(name, email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-12 relative">
      {/* Glow Orbs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white">Create Account</h2>
          <p className="text-sm text-dark-muted mt-2">Register to submit unlocks, check wholesale rates, and view logs</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-455 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3.5 text-dark-muted" />
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-dark-muted" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-dark-muted" />
              <input 
                type="password" 
                placeholder="Min. 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3.5 text-dark-muted" />
              <input 
                type="password" 
                placeholder="Repeat password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/10 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-dark-border/40 pt-6 text-center text-sm text-dark-muted">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
