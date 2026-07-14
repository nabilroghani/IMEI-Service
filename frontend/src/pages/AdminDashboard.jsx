import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, RefreshCw, BarChart2, ShieldAlert, ShoppingBag, Settings, 
  Users, Edit3, Trash2, PlusCircle, CheckCircle, XCircle, Clock, 
  Search, SlidersHorizontal, DollarSign, FileText, X 
} from 'lucide-react';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'services' | 'users'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [ordersFilter, setOrdersFilter] = useState('All');
  const [ordersSearch, setOrdersSearch] = useState('');
  
  // Editing modals
  const [editingOrder, setEditingOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const [editingService, setEditingService] = useState(null); // null means not editing/creating, otherwise service obj or 'new'
  const [serviceName, setServiceName] = useState('');
  const [serviceBrand, setServiceBrand] = useState('Apple');
  const [serviceType, setServiceType] = useState('Network Unlock');
  const [servicePrice, setServicePrice] = useState(0);
  const [serviceEstTime, setServiceEstTime] = useState('1-3 Days');
  const [serviceDesc, setServiceDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Fetch admin dashboard details
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/services'); // Public endpoint retrieves all
      setServices(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchServices(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update order status/notes
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    setSaving(true);
    setActionError(null);
    try {
      await api.put(`/admin/orders/${editingOrder._id}`, {
        status: editStatus,
        notes: editNotes
      });
      setEditingOrder(null);
      // Reload stats and orders
      await Promise.all([fetchStats(), fetchOrders()]);
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.error || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  // Create/Update Service
  const handleSaveService = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      const payload = {
        name: serviceName,
        brand: serviceBrand,
        serviceType,
        price: Number(servicePrice),
        estTime: serviceEstTime,
        description: serviceDesc
      };

      if (editingService === 'new') {
        await api.post('/services', payload);
      } else {
        await api.put(`/services/${editingService._id}`, payload);
      }
      setEditingService(null);
      await fetchServices();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.error || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      await fetchServices();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to delete service');
    }
  };

  // Setup service form for editing
  const startEditService = (service) => {
    if (service === 'new') {
      setEditingService('new');
      setServiceName('');
      setServiceBrand('Apple');
      setServiceType('Network Unlock');
      setServicePrice(0);
      setServiceEstTime('1-2 Days');
      setServiceDesc('');
    } else {
      setEditingService(service);
      setServiceName(service.name);
      setServiceBrand(service.brand);
      setServiceType(service.serviceType);
      setServicePrice(service.price);
      setServiceEstTime(service.estTime);
      setServiceDesc(service.description || '');
    }
    setActionError(null);
  };

  // Setup order form for editing
  const startEditOrder = (order) => {
    setEditingOrder(order);
    setEditStatus(order.status);
    setEditNotes(order.notes || '');
    setActionError(null);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      order.imei.includes(ordersSearch) ||
      order.customerEmail.toLowerCase().includes(ordersSearch.toLowerCase());
    const matchesFilter = ordersFilter === 'All' || order.status === ordersFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen relative">
      {/* Background soft grids */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-650/5 rounded-full blur-3xl -z-10 animate-pulse"></div>

      {/* Admin header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-purple-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-400" /> Back-Office Access Granted
          </span>
          <h1 className="text-3xl font-black text-white">Administrator Panel</h1>
        </div>

        <button 
          onClick={loadAllData} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-dark-border hover:border-purple-500/30 text-dark-muted hover:text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reload Portal
        </button>
      </div>

      {/* Statistics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Placed Orders', value: stats.totalOrders, icon: <ShoppingBag className="w-5 h-5 text-purple-400" /> },
            { label: 'Pending Processing', value: stats.pendingOrders, icon: <Clock className="w-5 h-5 text-amber-400 animate-pulse" /> },
            { label: 'Today Completed', value: stats.completedToday, icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
            { label: 'Total Earnings (USD)', value: `$${stats.revenue.toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-cyan-400" /> },
          ].map((card, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-dark-muted font-bold uppercase tracking-wider">{card.label}</span>
                <div className="p-2 bg-dark-bg/60 border border-dark-border rounded-lg">{card.icon}</div>
              </div>
              <span className="text-2xl font-black text-white">{card.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard Submenu Navigation */}
      <div className="flex border-b border-dark-border/40 gap-8 mb-8 text-sm">
        {[
          { id: 'orders', label: 'Unlocking requests', icon: <FileText className="w-4 h-4" /> },
          { id: 'services', label: 'Service Pricing Catalogue', icon: <Settings className="w-4 h-4" /> },
          { id: 'users', label: 'Registered Clients', icon: <Users className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 font-semibold transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.id 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-dark-muted hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass-panel rounded-2xl">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
          <p className="text-dark-muted text-sm font-semibold">Decrypting database logs...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* Tab 1: Orders Table */}
          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Order Filtering options */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-dark-muted" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, IMEI, Email..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <SlidersHorizontal className="w-4 h-4 text-dark-muted" />
                  <span className="text-xs text-dark-muted font-semibold uppercase">Status:</span>
                  <div className="flex gap-1.5 bg-dark-bg/60 border border-dark-border p-1 rounded-lg">
                    {['All', 'Pending', 'In Progress', 'Completed', 'Failed'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrdersFilter(st)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                          ordersFilter === st 
                            ? 'bg-purple-650 text-white shadow'
                            : 'text-dark-muted hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#080d1e]/50 border-b border-dark-border text-dark-muted font-bold text-xs uppercase">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Client Email</th>
                        <th className="px-6 py-4">IMEI</th>
                        <th className="px-6 py-4">Device Details</th>
                        <th className="px-6 py-4">Service Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Cost</th>
                        <th className="px-6 py-4 text-center">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/40">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-[#0c0d1e]/20 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-white text-xs">{order.orderId}</td>
                            <td className="px-6 py-4 text-dark-text/90 text-xs">
                              {order.customerEmail}
                              {order.user && (
                                <span className="block text-[10px] text-purple-400 font-semibold">Registered User</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-white">{order.imei}</td>
                            <td className="px-6 py-4 text-xs">
                              <span className="font-bold text-white">{order.brand}</span> {order.model}
                            </td>
                            <td className="px-6 py-4 truncate max-w-[150px] text-xs text-dark-muted" title={order.serviceNameSnapshot}>
                              {order.serviceNameSnapshot}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                order.status === 'Failed' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' :
                                order.status === 'In Progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-white text-xs">${order.priceSnapshot.toFixed(2)}</td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => startEditOrder(order)}
                                className="p-1.5 bg-dark-bg/60 border border-dark-border rounded-lg text-dark-muted hover:text-purple-400 hover:border-purple-500/30 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-dark-muted">No unlock requests matching your parameters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Service Catalog */}
          {activeTab === 'services' && (
            <motion.div 
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Services Pricing Catalogue</h3>
                <button
                  onClick={() => startEditService('new')}
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition-all duration-200"
                >
                  <PlusCircle className="w-4.5 h-4.5" /> Add New Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <div key={svc._id} className="glass-panel p-5 rounded-2xl border-purple-500/5 hover:border-purple-500/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold rounded uppercase">
                          {svc.brand}
                        </span>
                        <span className="text-xs text-dark-muted font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {svc.estTime}
                        </span>
                      </div>

                      <h4 className="text-white font-bold text-sm mb-1">{svc.name}</h4>
                      <p className="text-xs text-dark-muted leading-relaxed mb-4">{svc.description}</p>
                    </div>

                    <div className="border-t border-dark-border/40 pt-4 flex justify-between items-center mt-4">
                      <div>
                        <span className="text-[10px] text-dark-muted block uppercase">Client Price</span>
                        <span className="text-xl font-bold text-white text-glow-purple">${svc.price.toFixed(2)}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditService(svc)}
                          className="p-2 bg-dark-bg/60 border border-dark-border rounded-lg text-dark-muted hover:text-purple-400 hover:border-purple-500/30 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(svc._id)}
                          className="p-2 bg-dark-bg/60 border border-dark-border rounded-lg text-dark-muted hover:text-rose-450 hover:border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab 3: Registered Clients */}
          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#080d1e]/50 border-b border-dark-border text-dark-muted font-bold text-xs uppercase">
                        <th className="px-6 py-4">Client Name</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4">Registered Date</th>
                        <th className="px-6 py-4">System Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/40">
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u._id} className="hover:bg-[#0c0d1e]/20 transition-colors">
                            <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                            <td className="px-6 py-4 text-dark-text/90">{u.email}</td>
                            <td className="px-6 py-4 text-xs text-dark-muted">{new Date(u.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 bg-dark-bg text-dark-muted border border-dark-border text-[10px] font-bold rounded uppercase">
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-dark-muted">No registered client accounts found in Database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* MODAL 1: Edit Order Status / notes */}
      {editingOrder && (
        <div className="fixed inset-0 bg-[#000]/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden border-purple-500/30"
          >
            <div className="flex justify-between items-center bg-[#090e1f] border-b border-dark-border px-6 py-4">
              <div>
                <h3 className="text-white font-bold text-base">Process Request</h3>
                <span className="text-xs text-dark-muted font-mono">{editingOrder.orderId}</span>
              </div>
              <button 
                onClick={() => setEditingOrder(null)}
                className="text-dark-muted hover:text-white p-1 rounded-md hover:bg-dark-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs rounded-xl flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {actionError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 bg-dark-bg/40 p-4 rounded-xl border border-dark-border/40 text-xs">
                <div>
                  <span className="text-dark-muted block mb-0.5">Device:</span>
                  <span className="text-white font-bold">{editingOrder.brand} {editingOrder.model}</span>
                </div>
                <div>
                  <span className="text-dark-muted block mb-0.5">IMEI:</span>
                  <span className="text-white font-mono font-bold">{editingOrder.imei}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Order Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-sm bg-dark-card border-dark-border"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Output Code / Admin Notes</label>
                <textarea
                  rows="4"
                  placeholder="Enter unlock code, instructions, or failure reasons here. Will be shown to user."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-xs font-mono"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-5 py-2.5 bg-dark-bg border border-dark-border text-dark-muted hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save & Notify Client"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Service */}
      {editingService && (
        <div className="fixed inset-0 bg-[#000]/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden border-purple-500/30"
          >
            <div className="flex justify-between items-center bg-[#090e1f] border-b border-dark-border px-6 py-4">
              <h3 className="text-white font-bold text-base">
                {editingService === 'new' ? "Add Custom Unlock Service" : "Edit Service Details"}
              </h3>
              <button 
                onClick={() => setEditingService(null)}
                className="text-dark-muted hover:text-white p-1 rounded-md hover:bg-dark-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs rounded-xl flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Service Catalog Name</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone iCloud Unlock Clean (All Models)"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Brand</label>
                  <select
                    value={serviceBrand}
                    onChange={(e) => setServiceBrand(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-xs bg-dark-card border-dark-border"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Google">Google</option>
                    <option value="Huawei">Huawei</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Unlock Category</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-xs bg-dark-card border-dark-border"
                  >
                    <option value="Network Unlock">Network Unlock</option>
                    <option value="iCloud Unlock">iCloud Unlock</option>
                    <option value="FRP Unlock">FRP Unlock</option>
                    <option value="Blacklist Check">Blacklist Check</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Reseller Cost (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Est. Delivery Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 1-3 Days"
                    value={serviceEstTime}
                    onChange={(e) => setServiceEstTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Detailed Description</label>
                <textarea
                  rows="3"
                  placeholder="Service requirements or terms..."
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg glass-input text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-5 py-2.5 bg-dark-bg border border-dark-border text-dark-muted hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Service"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
