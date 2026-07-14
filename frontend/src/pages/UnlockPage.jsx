import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, ShieldAlert, BadgeInfo, CheckCircle, CreditCard, 
  Mail, Calendar, ArrowLeft, ArrowRight, Loader2, Copy, Check 
} from 'lucide-react';
import api from '../utils/api';

// Luhn Algorithm validation for 15-digit IMEI
const isLuhnValid = (imei) => {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(imei[i], 10);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
};

const UnlockPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Load preselected service ID from Landing Page navigation if available
  const preselectedServiceId = location.state?.preselectedServiceId || null;

  // Wizard state
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form states
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [imei, setImei] = useState('');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');

  // Payment states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Execution states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync email when user loads
  useEffect(() => {
    if (user && !customerEmail) {
      setCustomerEmail(user.email);
    }
  }, [user]);

  // Fetch unlock catalog
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        const activeServices = res.data.data;
        setServices(activeServices);
        
        // If a service was preselected, apply it
        if (preselectedServiceId) {
          const matched = activeServices.find(s => s._id === preselectedServiceId);
          if (matched) {
            setSelectedService(matched);
            setSelectedBrand(matched.brand);
            // Auto skip to step 2/3 as they already chose the service
            setStep(3);
          }
        }
      } catch (err) {
        console.error("Error loading services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [preselectedServiceId]);

  // Filter services to show only selected brand
  const brandServices = services.filter(s => s.brand === selectedBrand);

  const handleNextStep = () => {
    if (step === 1 && !deviceModel.trim()) {
      setError('Please specify your device model');
      return;
    }
    if (step === 2 && !selectedService) {
      setError('Please select an unlock service');
      return;
    }
    if (step === 3) {
      if (!imei || imei.length !== 15) {
        setError('IMEI number must be exactly 15 digits');
        return;
      }
      if (!isLuhnValid(imei)) {
        setError('IMEI number failed structural Luhn verification. Check for typing errors.');
        return;
      }
      if (!customerEmail || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  // Submit Order Mock Payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setError('Please fill in checkout credentials');
      return;
    }
    setError(null);
    setSubmitting(true);

    // Simulate Payment processing duration
    setTimeout(async () => {
      try {
        const res = await api.post('/orders', {
          imei,
          brand: selectedBrand,
          model: deviceModel,
          serviceId: selectedService._id,
          customerEmail,
          customerPhone
        });
        setSuccessOrder(res.data.data);
        setStep(5);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Order submission failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }, 2000);
  };

  const handleCopyOrderId = () => {
    if (!successOrder) return;
    navigator.clipboard.writeText(successOrder.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step indicators
  const stepsTitle = ['Device info', 'Select Unlock', 'Validate IMEI', 'Secure Checkout'];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 min-h-[80vh] flex flex-col justify-center">
      
      {/* Wizard Step Header */}
      {step < 5 && (
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-white mb-6">IMEI Unlock Checkout</h1>
          <div className="flex items-center justify-between max-w-lg mx-auto relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-dark-border -z-10"></div>
            {stepsTitle.map((title, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 transition-all duration-300 ${
                    idx + 1 < step 
                      ? 'border-cyan-500 bg-cyan-500 text-dark-bg' 
                      : idx + 1 === step 
                        ? 'border-cyan-500 bg-[#0c1122] text-cyan-400 shadow-glow-cyan' 
                        : 'border-dark-border bg-[#0c1122] text-dark-muted'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider hidden sm:block ${idx + 1 === step ? 'text-cyan-400' : 'text-dark-muted'}`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Badge */}
      {error && step < 5 && (
        <div className="p-4 mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-455 text-sm flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Components */}
      <div className="glass-panel p-8 rounded-3xl relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Brand & Model Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" /> Step 1: Select Brand & Model
              </h2>
              
              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-3">Manufacturer</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Apple', 'Samsung', 'Google', 'Huawei'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(b);
                        setSelectedService(null); // Reset service when brand changes
                      }}
                      className={`py-3 rounded-xl border font-bold text-sm transition-all duration-200 ${
                        selectedBrand === b 
                          ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-glow-cyan' 
                          : 'border-dark-border bg-dark-bg/60 text-dark-muted hover:text-white hover:border-dark-muted/50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Device Model</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-input"
                  required
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-md hover:shadow-cyan-500/10 transition-all"
                >
                  Choose Service <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Service Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center border-b border-dark-border/40 pb-3">
                <h2 className="text-xl font-bold text-white">Step 2: Select Service</h2>
                <span className="text-xs text-dark-muted">Brand: <strong className="text-white">{selectedBrand}</strong></span>
              </div>

              {loadingServices ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : brandServices.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {brandServices.map((svc) => (
                    <div
                      key={svc._id}
                      onClick={() => setSelectedService(svc)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex justify-between items-center ${
                        selectedService?._id === svc._id
                          ? 'border-cyan-500 bg-cyan-500/5 text-white shadow-glow-cyan'
                          : 'border-dark-border bg-dark-bg/60 text-dark-text/90 hover:border-dark-muted/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">{svc.name}</h4>
                        <p className="text-xs text-dark-muted">{svc.description}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-semibold mt-1">
                          <Calendar className="w-3 h-3" /> Est: {svc.estTime}
                        </span>
                      </div>
                      <div className="text-right font-mono font-black text-white text-base pl-4">
                        ${svc.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-dark-muted border border-dashed border-dark-border rounded-xl">
                  No active services found for brand "{selectedBrand}" in database.
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-dark-border/40">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1 px-5 py-3 border border-dark-border text-dark-muted hover:text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedService}
                  className="flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
                >
                  Validate IMEI <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: IMEI & Contact Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" /> Step 3: Device Validation
              </h2>

              <div>
                <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2 flex justify-between">
                  <span>15-Digit IMEI Number</span>
                  <span className="text-[10px] text-cyan-400 underline cursor-pointer" onClick={() => alert("Dial *#06# on your device to display its IMEI number.")}>Where is this?</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter 15 digits IMEI number"
                  maxLength="15"
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-lg glass-input font-mono text-base tracking-widest text-center"
                  required
                />
                
                {imei.length > 0 && imei.length < 15 && (
                  <span className="text-xs text-amber-500 mt-2 block font-semibold">Remaining digits: {15 - imei.length}</span>
                )}
                {imei.length === 15 && !isLuhnValid(imei) && (
                  <span className="text-xs text-rose-500 mt-2 block font-bold flex items-center gap-1">
                    <BadgeInfo className="w-4 h-4" /> Luhn Validation failed: Invalid IMEI format
                  </span>
                )}
                {imei.length === 15 && isLuhnValid(imei) && (
                  <span className="text-xs text-emerald-500 mt-2 block font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Structural IMEI format verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Customer Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted uppercase tracking-wider mb-2">Customer Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg glass-input"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-dark-border/40">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1 px-5 py-3 border border-dark-border text-dark-muted hover:text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review & Payment */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-dark-border/40 pb-3">
                <CreditCard className="w-5 h-5 text-cyan-400" /> Step 4: Checkout Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Order Summary details */}
                <div className="bg-[#090f1f]/50 p-5 rounded-2xl border border-dark-border space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-dark-muted">Summary</h4>
                  <div className="space-y-2.5 text-xs text-dark-text/90">
                    <div className="flex justify-between">
                      <span className="text-dark-muted">Device Brand:</span>
                      <span className="font-bold text-white">{selectedBrand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-muted">Model:</span>
                      <span className="font-bold text-white">{deviceModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-muted">IMEI Code:</span>
                      <span className="font-mono font-bold text-white">{imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-muted">Service Selection:</span>
                      <span className="font-bold text-white truncate max-w-[150px]">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-muted">Est. Processing Time:</span>
                      <span className="font-semibold text-purple-400">{selectedService.estTime}</span>
                    </div>
                    <div className="flex justify-between border-t border-dark-border pt-3.5 text-sm">
                      <span className="text-dark-muted font-bold">Total Charge:</span>
                      <span className="font-black text-cyan-400 text-glow-cyan">${selectedService.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Payment Card Form */}
                <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-dark-muted mb-2">Simulated Secure Payment</h4>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Credit Card Number"
                      maxLength="19"
                      value={cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Expiry (MM/YY)"
                      maxLength="5"
                      value={cardExpiry.replace(/\s?/g, '').replace(/(\d{2})\/?/g, '$1/').replace(/\/$/, '')}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                      required
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/10 transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" /> Verifying Card...
                      </>
                    ) : (
                      `Pay & Submit Order ($${selectedService.price.toFixed(2)})`
                    )}
                  </button>
                </form>
              </div>

              <div className="flex justify-between pt-4 border-t border-dark-border/40">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handlePrevStep}
                  className="flex items-center gap-1 px-5 py-3 border border-dark-border text-dark-muted hover:text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS MESSAGE */}
          {step === 5 && successOrder && (
            <motion.div
              key="step5"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">Payment Received!</h2>
                <p className="text-sm text-dark-muted mt-2">
                  Your order has been registered and scheduled for administrative manual check.
                </p>
              </div>

              {/* Order ID Copy Panel */}
              <div className="max-w-md mx-auto bg-dark-bg/60 border border-dark-border p-4 rounded-xl flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-dark-muted block uppercase font-bold">Copy Your Order ID</span>
                  <span className="text-lg font-mono font-black text-white tracking-wider">{successOrder.orderId}</span>
                </div>
                <button
                  onClick={handleCopyOrderId}
                  className="p-2.5 bg-dark-card border border-dark-border hover:border-cyan-500/30 text-dark-muted hover:text-white rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="text-xs text-dark-muted max-w-sm mx-auto leading-relaxed">
                We have dispatched a confirmation receipt containing tracking details to <strong className="text-white">{successOrder.customerEmail}</strong>.
              </div>

              <div className="flex justify-center gap-4 pt-4 border-t border-dark-border/40">
                <button
                  onClick={() => navigate(`/track/${successOrder.orderId}`)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg transition-all"
                >
                  Track Order Progress
                </button>
                <button
                  onClick={() => {
                    // Reset wizard for a new order
                    setStep(1);
                    setDeviceModel('');
                    setSelectedService(null);
                    setImei('');
                    setSuccessOrder(null);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-dark-card border border-dark-border hover:border-dark-muted/50 text-white rounded-lg transition-all"
                >
                  Unlock Another Device
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default UnlockPage;
