import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Smartphone, Key, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#060913]/60 backdrop-blur-md border-b border-dark-border py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg group-hover:shadow-glow-cyan transition-all duration-300">
          <Key className="w-5 h-5 text-white" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors duration-200">
          IMEI<span className="text-cyan-400">Unlock</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-sm font-medium text-dark-muted hover:text-white transition-colors duration-200">
          Home
        </Link>
        <Link to="/track" className="text-sm font-medium text-dark-muted hover:text-white transition-colors duration-200 flex items-center gap-1">
          <Smartphone className="w-4 h-4" />
          Track Order
        </Link>

        <span className="h-4 w-px bg-dark-border"></span>

        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/dashboard"} 
              className={`text-sm font-medium flex items-center gap-1 hover:underline ${isAdmin ? 'text-purple-400' : 'text-cyan-400'}`}
            >
              <User className="w-4 h-4" />
              {isAdmin ? "Admin Panel" : "My Dashboard"}
            </Link>
            <button 
              onClick={handleLogout} 
              className="text-sm font-medium text-dark-muted hover:text-rose-450 flex items-center gap-1 transition-colors duration-205"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-dark-muted hover:text-white transition-colors duration-200">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-semibold px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-cyan-500/20"
            >
              Register
            </Link>
            <Link to="/admin/login" className="text-xs text-dark-muted hover:text-purple-400 flex items-center gap-0.5 border border-dark-border hover:border-purple-500/30 px-2 py-1 rounded transition-all duration-200">
              <Shield className="w-3 h-3" />
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
