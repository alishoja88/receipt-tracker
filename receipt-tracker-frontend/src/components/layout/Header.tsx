import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { User, Menu, X } from 'lucide-react';
import logoImage from '@/assets/images/logo.png';

export const Header = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const setProfileDrawerOpen = useUiStore(state => state.setProfileDrawerOpen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to check if a link is active
  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string, isMobile = false) => {
    const baseClasses = isMobile
      ? 'block text-base font-medium py-2 transition-colors'
      : 'text-base font-medium transition-colors';

    const activeClasses = isActiveLink(path)
      ? 'text-white bg-blue-500/20 px-3 py-2 rounded-lg'
      : 'text-gray-300 hover:text-white';

    return `${baseClasses} ${activeClasses}`;
  };

  const getUserName = () => {
    if (!user) return '';
    return user.name || user.email.split('@')[0];
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const openProfile = () => {
    setProfileDrawerOpen(true);
    closeMobileMenu();
  };

  return (
    <header className="bg-[#1a2332] border-b border-[#2a3442] sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/" className={getLinkClasses('/')}>
                  Home
                </Link>
                <Link to="/about" className={getLinkClasses('/about')}>
                  About
                </Link>
                <Link to="/contact" className={getLinkClasses('/contact')}>
                  Contact
                </Link>
                <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/upload" className={getLinkClasses('/upload')}>
                  Upload Receipt
                </Link>
                <button
                  onClick={() => setProfileDrawerOpen(true)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-base font-medium"
                >
                  <User className="w-4 h-4" />
                  {getUserName()}
                </button>
              </>
            ) : (
              <>
                <Link to="/" className={getLinkClasses('/')}>
                  Home
                </Link>
                <Link to="/about" className={getLinkClasses('/about')}>
                  About
                </Link>
                <Link to="/contact" className={getLinkClasses('/contact')}>
                  Contact
                </Link>
                <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-[#2a3442]">
            {isAuthenticated ? (
              <>
                <Link to="/" onClick={closeMobileMenu} className={getLinkClasses('/', true)}>
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={closeMobileMenu}
                  className={getLinkClasses('/about', true)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={closeMobileMenu}
                  className={getLinkClasses('/contact', true)}
                >
                  Contact
                </Link>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={getLinkClasses('/dashboard', true)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  onClick={closeMobileMenu}
                  className={getLinkClasses('/upload', true)}
                >
                  Upload Receipt
                </Link>
                <button
                  onClick={openProfile}
                  className="w-full text-left flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-base font-medium py-2"
                >
                  <User className="w-4 h-4" />
                  {getUserName()}
                </button>
              </>
            ) : (
              <>
                <Link to="/" onClick={closeMobileMenu} className={getLinkClasses('/', true)}>
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={closeMobileMenu}
                  className={getLinkClasses('/about', true)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={closeMobileMenu}
                  className={getLinkClasses('/contact', true)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
