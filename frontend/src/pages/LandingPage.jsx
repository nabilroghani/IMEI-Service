import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Clock, CheckCircle2, ChevronDown, Search, ArrowRight, MessageSquare, Star } from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';

const LandingPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBrand, setActiveBrand] = useState('All');
  const [activeFaq, setActiveFaq] = useState(null);

  // Fetch services from backend API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data.data);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Could not retrieve latest service pricing.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const brands = ['All', 'Apple', 'Samsung', 'Google', 'Huawei', 'Others'];

  // Filter services based on search query and active brand selection
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = activeBrand === 'All' || 
                         (activeBrand === 'Others' ? !['Apple', 'Samsung', 'Google', 'Huawei'].includes(service.brand) : service.brand === activeBrand);
    return matchesSearch && matchesBrand;
  });

  const faqData = [
    {
      q: "How does IMEI unlocking work?",
      a: "IMEI unlocking is a server-based process. You submit your device's unique 15-digit IMEI number. Our administrator manually processes this with backend registries. Once processed, your phone is permanently unlocked over-the-air, allowing you to use it on any network globally."
    },
    {
      q: "Is IMEI unlocking permanent and legal?",
      a: "Yes, IMEI unlocking is 100% legal. Once your device is marked as unlocked in official systems, the unlock is permanent. Resetting, updating, or restoring your phone will not lock it again."
    },
    {
      q: "How do I find my phone's IMEI number?",
      a: "Finding your IMEI is simple. Dial *#06# on your device's phone app, and the 15-digit code will display on the screen. Alternatively, check the SIM tray or go to Settings > General > About."
    },
    {
      q: "What is your refund policy if the unlock fails?",
      a: "If we are unable to process your unlock request (e.g. server issues or registry mismatch), we offer a full 100% manual refund. Note that you must provide accurate information (correct brand, model, and IMEI) when ordering."
    }
  ];

  const testimonials = [
    {
      name: "Marcus V.",
      device: "iPhone 15 Pro Max",
      text: "Unbelievable service! My iCloud unlock took exactly 2 days. The tracking timeline kept me updated the entire time. Highly recommended reseller!",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
    },
    {
      name: "Sophia L.",
      device: "Samsung Galaxy S24 Ultra",
      text: "Was locked to T-Mobile. Got my network unlock code in 18 hours. Inputted the code and connected to Verizon instantly. Flawless interface.",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
    },
    {
      name: "Liam K.",
      device: "Google Pixel 8 Pro",
      text: "Bypassed FRP lock lock screen inside 3 hours. Fast manual processing and amazing customer support. Will use this reseller again.",
      stars: 5,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80"
    }
  ];

  return (
    <PageTransition>
      <div className="relative overflow-x-hidden min-h-screen">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-20 pb-16 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Premium Reseller Services
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Permanent IMEI Device <br className="hidden md:inline"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-glow-cyan">
              Unlock Reseller Portal
            </span>
          </h1>
          <p className="text-lg md:text-xl text-dark-muted max-w-3xl mx-auto mb-10 leading-relaxed">
            Unlock your iOS or Android device permanently across international networks. Fast manual processing, secure crypto or card checkout, and real-time status tracking.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate('/unlock')}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Unlock Device Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/track')}
              className="px-8 py-4 bg-dark-card/60 backdrop-blur-md border border-dark-border hover:border-cyan-500/40 text-white font-bold rounded-xl transition-all duration-200"
            >
              Track Order Status
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {[
            { icon: <Shield className="w-6 h-6 text-cyan-400" />, title: "Secure Processing", desc: "No physical tampering" },
            { icon: <Clock className="w-6 h-6 text-purple-400" />, title: "Fast Delivery", desc: "Estimated lock timers" },
            { icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />, title: "100% Legal & Safe", desc: "Warranty remains intact" },
            { icon: <MessageSquare className="w-6 h-6 text-blue-400" />, title: "Dedicated Support", desc: "Manual check updates" }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl flex flex-col items-center">
              <div className="p-3 bg-[#0a0f1d] rounded-lg mb-3 border border-dark-border">{item.icon}</div>
              <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-dark-muted">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Services and Pricing Section */}
      <section className="px-6 md:px-12 py-16 bg-[#04070d]/60 border-y border-dark-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Supported Unlocks & Pricing</h2>
            <p className="text-dark-muted max-w-xl mx-auto">Select your device manufacturer and unlock service category. Realtime price quote lists.</p>
          </div>

          {/* Filtering Tools */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrand(b)}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeBrand === b 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                      : 'bg-dark-card text-dark-muted border border-dark-border hover:border-dark-muted/50 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-dark-muted" />
              <input
                type="text"
                placeholder="Search locks, carriers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg glass-input text-sm"
              />
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
                  <div className="h-6 bg-dark-border rounded w-3/4"></div>
                  <div className="h-4 bg-dark-border rounded w-1/2"></div>
                  <div className="h-10 bg-dark-border rounded w-1/3 mt-6"></div>
                </div>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-md text-xs font-semibold uppercase">
                        {service.brand}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-dark-muted">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {service.estTime}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-2 leading-snug">{service.name}</h3>
                    <p className="text-sm text-dark-muted mb-6 leading-relaxed">{service.description}</p>
                  </div>

                  <div className="border-t border-dark-border/40 pt-4 flex justify-between items-center mt-auto">
                    <div>
                      <span className="text-xs text-dark-muted block">Reseller Cost</span>
                      <span className="text-2xl font-black text-white text-glow-cyan">${service.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => navigate('/unlock', { state: { preselectedServiceId: service._id } })}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-lg shadow transition-all duration-200"
                    >
                      Select
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-panel rounded-2xl">
              <p className="text-dark-muted">No unlock services match your selection.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 md:px-12 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Reseller Success Stories</h2>
          <p className="text-dark-muted">Read feedback from wholesalers and customers who processed manual unlocks with us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                  ))}
                </div>
                <p className="text-sm italic text-dark-text/90 leading-relaxed mb-6">"{t.text}"</p>
              </div>

              <div className="flex items-center gap-3 border-t border-dark-border/40 pt-4">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-white font-semibold text-sm">{t.name}</h4>
                  <span className="text-xs text-cyan-400">{t.device}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 md:px-12 py-16 bg-[#04070d]/60 border-t border-dark-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-dark-muted">Everything you need to know about manual reseller IMEI unlocking.</p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left text-white hover:text-cyan-400 transition-colors duration-200"
                >
                  <span className="font-semibold text-base">{faq.q}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-dark-muted transition-transform duration-300 ${
                      activeFaq === idx ? 'transform rotate-180 text-cyan-400' : ''
                    }`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-sm text-dark-muted leading-relaxed border-t border-dark-border/40 pt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </PageTransition>
  );
};

export default LandingPage;
