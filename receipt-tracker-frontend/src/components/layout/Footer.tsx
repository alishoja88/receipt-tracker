import { Link } from 'react-router-dom';
import logoImage from '@/assets/images/logo.png';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a2332] border-t border-[#2a3442]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Logo and Tagline */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={logoImage}
                  alt="ReceiptTrack Logo"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
              <span className="text-xl font-semibold text-white">ReceiptTrack</span>
            </Link>
            <p className="text-gray-400 text-base max-w-md">
              Simplify expense tracking with intelligent receipt management.
            </p>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors text-base"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors text-base"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors text-base"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#2a3442] pt-8">
          <p className="text-center text-gray-400 text-base">
            © {currentYear} ReceiptTrack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
