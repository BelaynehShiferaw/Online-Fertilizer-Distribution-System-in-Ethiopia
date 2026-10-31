import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-400 text-xs border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Sprout className="w-5 h-5 text-agri-400" />
              <span>OFDMS Ethiopia</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Digitizing agricultural fertilizer supply chains for Ethiopian smallholder farmers with transparency, subsidized pricing, and reliable warehouse distribution.
            </p>
          </div>

          {/* Supported Fertilizers */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Supported Fertilizers
            </h4>
            <ul className="space-y-1.5">
              <li>• Di-Ammonium Phosphate (DAP)</li>
              <li>• Granular Urea (46% N)</li>
              <li>• NPS & NPSB Blended Fertilizers</li>
              <li>• Certified High-Yield Seeds</li>
            </ul>
          </div>

          {/* Key Cooperatives */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Stakeholders & Partners
            </h4>
            <ul className="space-y-1.5">
              <li>• Ministry of Agriculture (MoA)</li>
              <li>• Ethiopian Agricultural Businesses Corp (EABC)</li>
              <li>• Primary Farmers Cooperative Unions</li>
              <li>• Agricultural Transformation Institute (ATI)</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              Support & Hotline
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-agri-400" />
                <span>National Agricultural Toll-Free: 8855</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-agri-400" />
                <span>support@ofdms.gov.et</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-agri-400" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} OFDMS Ethiopia. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by the National Fertilizer Distribution Initiative</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
