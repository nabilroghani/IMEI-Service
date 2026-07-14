import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, Calendar, ShieldCheck, ClipboardCheck, PlayCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';

const TrackingPage = () => {
  const { orderId: routeOrderId } = useParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(routeOrderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (routeOrderId) {
      handleTrack(routeOrderId);
    }
  }, [routeOrderId]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    navigate(`/track/${orderId.trim().toUpperCase()}`);
  };

  const handleTrack = async (id) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await api.get(`/orders/track/${id.toUpperCase()}`);
      setOrder(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No order found with that ID. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get status details (color, description, active state)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return {
          color: 'text-amber-400 border-amber-400 bg-amber-400/10',
          glow: 'shadow-glow-amber',
          icon: <PlayCircle className="w-6 h-6" />,
          step: 0
        };
      case 'In Progress':
        return {
          color: 'text-cyan-400 border-cyan-400 bg-cyan-400/10',
          glow: 'shadow-glow-cyan',
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          step: 1
        };
      case 'Completed':
        return {
          color: 'text-emerald-400 border-emerald-400 bg-emerald-400/10',
          glow: 'shadow-glow-emerald',
          icon: <ShieldCheck className="w-6 h-6" />,
          step: 2
        };
      case 'Failed':
        return {
          color: 'text-rose-400 border-rose-400 bg-rose-400/10',
          glow: 'shadow-glow-rose',
          icon: <XCircle className="w-6 h-6" />,
          step: 2
        };
      default:
        return {
          color: 'text-dark-muted border-dark-border bg-dark-card',
          glow: '',
          icon: <AlertCircle className="w-6 h-6" />,
          step: 0
        };
    }
  };

  const statusSteps = ['Pending', 'In Progress', 'Completed'];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-12 min-h-[75vh] flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-glow-cyan">Unlock Order</span>
        </h1>
        <p className="text-dark-muted max-w-lg mx-auto">
          Enter your unique Order ID to get real-time processing statistics.
        </p>
      </div>

      {/* Tracker Search Box */}
      <form onSubmit={handleTrackSubmit} className="glass-panel p-6 rounded-2xl mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-dark-muted" />
          <input
            type="text"
            placeholder="Enter Order ID (e.g. IMEI-XXXXXX)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg glass-input text-base uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderId.trim()}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all duration-250 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/10"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Status"}
        </button>
      </form>

      {/* Search results */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-dark-muted text-sm">Querying database registries...</p>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Lookup Failed</h4>
            <p className="text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Order Details Header */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs text-dark-muted uppercase tracking-wider block">Order Identification</span>
              <h2 className="text-2xl font-black text-white">{order.orderId}</h2>
              <span className="text-xs text-dark-muted block mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on: {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className={`flex items-center gap-2.5 px-4 py-2 border rounded-xl font-bold text-sm ${getStatusConfig(order.status).color}`}>
              {getStatusConfig(order.status).icon}
              {order.status}
            </div>
          </div>

          {/* Visual Progress Steps */}
          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-white font-semibold mb-8 text-center text-sm uppercase tracking-widest text-dark-muted">Timeline Status</h3>
            
            <div className="relative flex justify-between items-center max-w-xl mx-auto">
              {/* Progress Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-dark-border -z-10"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 -z-10 transition-all duration-500"
                style={{ 
                  width: `${
                    order.status === 'Failed' 
                      ? '100%' 
                      : `${(getStatusConfig(order.status).step / (statusSteps.length - 1)) * 100}%`
                  }`
                }}
              ></div>

              {/* Status Nodes */}
              {statusSteps.map((step, idx) => {
                const currentStep = getStatusConfig(order.status).step;
                const isFailed = order.status === 'Failed';
                
                let isCompleted = idx < currentStep || order.status === 'Completed';
                let isActive = idx === currentStep && !isFailed;
                
                if (isFailed && idx === 2) {
                  // Final step is red failed
                  isCompleted = false;
                  isActive = true;
                }

                return (
                  <div key={idx} className="flex flex-col items-center relative">
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 transition-all duration-300 ${
                        isFailed && idx === 2 
                          ? 'border-rose-500 bg-[#0c1122] text-rose-500 shadow-glow-rose'
                          : isCompleted 
                            ? 'border-cyan-500 bg-cyan-500 text-dark-bg' 
                            : isActive 
                              ? 'border-cyan-500 bg-[#0c1122] text-cyan-400 shadow-glow-cyan' 
                              : 'border-dark-border bg-[#0c1122] text-dark-muted'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span 
                      className={`text-xs mt-3 font-semibold absolute -bottom-6 whitespace-nowrap ${
                        isFailed && idx === 2 
                          ? 'text-rose-400 font-bold'
                          : isCompleted || isActive 
                            ? 'text-cyan-400' 
                            : 'text-dark-muted'
                      }`}
                    >
                      {isFailed && idx === 2 ? 'Failed' : step}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Spacing for labels */}
            <div className="h-6"></div>
          </div>

          {/* Details & Admin Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h4 className="text-white font-bold border-b border-dark-border/40 pb-2 text-sm uppercase tracking-wide flex items-center gap-1.5 text-cyan-400">
                <ClipboardCheck className="w-4 h-4" /> Device Details
              </h4>
              
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span className="text-dark-muted">Brand:</span>
                <span className="text-white font-semibold text-right">{order.brand}</span>

                <span className="text-dark-muted">Model:</span>
                <span className="text-white font-semibold text-right">{order.model}</span>

                <span className="text-dark-muted">Service Purchased:</span>
                <span className="text-white font-semibold text-right text-xs truncate max-w-[180px]">{order.serviceName}</span>

                <span className="text-dark-muted">Customer Email:</span>
                <span className="text-white font-mono text-xs text-right">{order.maskedEmail}</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-white font-bold border-b border-dark-border/40 pb-2 text-sm uppercase tracking-wide flex items-center gap-1.5 text-purple-400">
                  Notes & Output
                </h4>
                <p className="text-sm mt-3 leading-relaxed text-dark-text/90 font-mono">
                  {order.notes ? order.notes : "Your request is currently in queue. Once the administrator checks and process this request, details (unlock code/instructions) will be displayed here."}
                </p>
              </div>

              {order.status === 'Completed' && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Your device is successfully unlocked! Feel free to reboot or plug in a new SIM card.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </PageTransition>
  );
};

export default TrackingPage;
