import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle, ShoppingBag, PlusCircle, Smartphone, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpandOrder = (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'In Progress':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Failed':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-dark-card text-dark-muted border border-dark-border';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-[80vh]">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white">Client Dashboard</h1>
          <p className="text-sm text-dark-muted mt-1">
            Logged in as: <span className="text-cyan-400 font-semibold">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchOrders}
            className="p-3 bg-dark-card border border-dark-border hover:border-cyan-500/30 hover:text-white rounded-lg text-dark-muted transition-all duration-200"
            title="Refresh Order List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/unlock')}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-250 shadow-md hover:shadow-cyan-500/10"
          >
            <PlusCircle className="w-5 h-5" /> Submit New Unlock
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
          <p className="text-dark-muted text-sm font-semibold">Retrieving secure order logs...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl text-center border-rose-500/20">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Error Loading Orders</h3>
          <p className="text-dark-muted text-sm mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="px-6 py-2 bg-dark-card border border-dark-border text-white rounded-lg hover:border-cyan-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-dark-border bg-[#080d1e]/50 text-dark-muted uppercase font-bold text-xs">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Device</th>
                    <th className="px-6 py-4">IMEI</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {orders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-[#080c18]/30 transition-colors duration-150">
                        <td className="px-6 py-4 font-mono font-bold text-white text-xs">{order.orderId}</td>
                        <td className="px-6 py-4 text-white">
                          <span className="font-semibold">{order.brand}</span> {order.model}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-dark-muted">{order.imei}</td>
                        <td className="px-6 py-4 truncate max-w-[200px] text-dark-text/90" title={order.serviceNameSnapshot}>
                          {order.serviceNameSnapshot}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-dark-muted text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleExpandOrder(order._id)}
                            className="p-1.5 hover:bg-dark-border rounded-md text-dark-muted hover:text-white transition-colors"
                          >
                            {expandedOrderId === order._id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Section */}
                      <AnimatePresence>
                        {expandedOrderId === order._id && (
                          <tr>
                            <td colSpan={7} className="px-6 py-0 bg-dark-bg/25">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="py-6 border-b border-dark-border/40 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                  {/* Left details */}
                                  <div className="space-y-3">
                                    <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                                      <Smartphone className="w-4 h-4" /> Order Overview
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-xs border-t border-dark-border/40 pt-2">
                                      <span className="text-dark-muted">Brand & Model:</span>
                                      <span className="text-white font-semibold text-right">{order.brand} {order.model}</span>
                                      
                                      <span className="text-dark-muted">Service Code:</span>
                                      <span className="text-white font-semibold text-right truncate max-w-[180px]">{order.serviceNameSnapshot}</span>

                                      <span className="text-dark-muted">Price Paid:</span>
                                      <span className="text-white font-mono font-bold text-right">${order.priceSnapshot.toFixed(2)}</span>

                                      <span className="text-dark-muted">Date Logged:</span>
                                      <span className="text-white text-right">{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                  </div>

                                  {/* Right Admin Notes */}
                                  <div className="bg-dark-card/30 p-4 border border-dark-border/50 rounded-xl flex flex-col justify-between">
                                    <div>
                                      <h4 className="font-bold text-purple-400 uppercase text-xs tracking-wider mb-2">Notes & Output</h4>
                                      <p className="text-xs font-mono leading-relaxed text-dark-text/90 bg-[#060a16] p-3 rounded-lg border border-dark-border">
                                        {order.notes ? order.notes : "Unlock request in queue. Manual administrative checks are pending. Refresh log for updates."}
                                      </p>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                      <button 
                                        onClick={() => navigate(`/track/${order.orderId}`)}
                                        className="text-xs text-cyan-400 hover:underline hover:text-cyan-300 flex items-center gap-1"
                                      >
                                        Open Tracking Page &rarr;
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl text-center px-4">
          <ShoppingBag className="w-16 h-16 text-dark-muted mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No Orders Placed Yet</h3>
          <p className="text-dark-muted max-w-sm mb-6 text-sm">
            You haven't submitted any IMEI unlock requests. Click the button below to register your first device unlock.
          </p>
          <button 
            onClick={() => navigate('/unlock')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-cyan-500/10"
          >
            <PlusCircle className="w-5 h-5" /> Start First Unlock Order
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
