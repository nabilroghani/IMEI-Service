import React from 'react';
import { Mail, ShieldCheck, HelpCircle, Key } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#03060c] border-t border-dark-border mt-auto py-10 px-6 md:px-12 text-dark-muted">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md">
              <Key className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              IMEI<span className="text-cyan-400">Unlock</span>
            </span>
          </div>
          <p className="text-sm max-w-xs leading-relaxed">
            Professional IMEI unlocking and reseller services for all major brands. Premium, secure, and fast delivery.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Site Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-cyan-400 transition-colors duration-200">Services & Pricing</a></li>
            <li><a href="/track" className="hover:text-cyan-400 transition-colors duration-200">Track Order</a></li>
            <li><a href="/login" className="hover:text-cyan-400 transition-colors duration-200">Client Log In</a></li>
            <li><a href="/admin/login" className="hover:text-cyan-400 transition-colors duration-200">Reseller Backoffice</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Trust & Support</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>support@imeiunlock.com</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>SSL Secured Checkout</span>
            </li>
            <li className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>24/7 Manual Review & Support</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-dark-border/40 pt-6 text-center text-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} IMEI Unlock Reseller Portal. All rights reserved.</p>
        <p className="text-dark-muted max-w-md md:text-right">
          Disclaimer: This is a mobile reseller portal. All unlocking requests are checked and completed manually by the administrator within the estimated timeframes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
