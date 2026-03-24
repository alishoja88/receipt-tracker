import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import {
  Menu,
  X,
  Home,
  Info,
  Mail,
  LayoutDashboard,
  Upload,
  ChevronDown,
  Receipt,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  authOnly?: boolean;
}

const publicLinks: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/about', label: 'About', icon: Info },
  { path: '/contact', label: 'Contact', icon: Mail },
];

const authedLinks: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/about', label: 'About', icon: Info },
  { path: '/contact', label: 'Contact', icon: Mail },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export const Header = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const setProfileDrawerOpen = useUiStore(state => state.setProfileDrawerOpen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const navLinks = isAuthenticated ? authedLinks : publicLinks;

  const getUserName = () => {
    if (!user) return '';
    return user.name || user.email.split('@')[0];
  };

  const getUserEmail = () => {
    if (!user) return '';
    return user.email;
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openProfile = () => {
    setProfileDrawerOpen(true);
    closeMobileMenu();
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(30,41,59,0.5) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(20,184,166,0.12)',
        boxShadow: '0 8px 32px rgba(20,184,166,0.08), inset 0 1px 1px rgba(255,255,255,0.05)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:gap-10 lg:px-10">
        {/* ── Logo ── */}
        <Link
          to="/"
          className="group flex flex-shrink-0 items-center gap-2.5 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(20,184,166,0.3)]"
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg border-[1.5px] border-teal-500/30 text-base transition-all duration-300 group-hover:scale-110 group-hover:border-teal-500/50 group-hover:shadow-[0_0_16px_rgba(20,184,166,0.2)]"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)',
            }}
          >
            <Receipt className="h-4 w-4 text-teal-400" />
          </div>
          <span
            className="text-xl font-extrabold"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ReceiptTrack
          </span>
        </Link>

        {/* ── Center Nav (desktop) ── */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'text-teal-400'
                    : 'text-slate-300 hover:bg-teal-500/[0.08] hover:text-slate-100'
                }`}
                style={active ? { background: 'rgba(20,184,166,0.12)' } : undefined}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {active && (
                  <span
                    className="absolute -bottom-[13px] left-4 right-4 h-0.5 rounded-sm"
                    style={{
                      background: 'linear-gradient(90deg, #2dd4bf 0%, #06b6d4 100%)',
                      animation: 'navUnderline 300ms cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              {/* Upload CTA */}
              <Link
                to="/upload"
                className="group relative hidden overflow-hidden rounded-lg px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.5px] text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,184,166,0.32)] sm:inline-flex sm:items-center sm:gap-2"
                style={{
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
                  boxShadow: '0 4px 16px rgba(20,184,166,0.24)',
                }}
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="relative z-[1]">UPLOAD RECEIPT</span>
                <span
                  className="absolute inset-0 -left-full transition-[left] duration-500 ease-in-out group-hover:left-full"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  }}
                />
              </Link>

              {/* User profile */}
              <button
                onClick={() => setProfileDrawerOpen(true)}
                className="group flex items-center gap-3 border-l border-teal-500/15 pl-4"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-teal-500/30 text-sm font-bold text-teal-400 transition-all duration-300 group-hover:scale-105 group-hover:border-teal-500/50 group-hover:shadow-[0_0_16px_rgba(20,184,166,0.15)]"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                  }}
                >
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                <div className="hidden flex-col gap-0.5 text-left lg:flex">
                  <span className="text-[13px] font-bold text-slate-100">{getUserName()}</span>
                  <span className="text-[11px] font-medium text-slate-500">{getUserEmail()}</span>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 transition-all duration-300 group-hover:rotate-180 group-hover:text-teal-400 lg:block" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="group relative overflow-hidden rounded-lg px-6 py-2.5 text-[13px] font-bold uppercase tracking-[0.5px] text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,184,166,0.32)]"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
                boxShadow: '0 4px 16px rgba(20,184,166,0.24)',
              }}
            >
              <span className="relative z-[1]">Sign In</span>
              <span
                className="absolute inset-0 -left-full transition-[left] duration-500 ease-in-out group-hover:left-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                }}
              />
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 transition-colors hover:text-teal-400 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ── */}
      {mobileMenuOpen && (
        <div className="space-y-1 border-t border-teal-500/[0.08] px-4 pb-4 pt-3 md:hidden">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-teal-500/[0.12] text-teal-400'
                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <>
              <Link
                to="/upload"
                onClick={closeMobileMenu}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide text-[#0f172a]"
                style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)' }}
              >
                <Upload className="h-4 w-4" />
                Upload Receipt
              </Link>
              <button
                onClick={openProfile}
                className="flex w-full items-center gap-2.5 rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-slate-100"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-500/30 text-xs font-bold text-teal-400"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                  }}
                >
                  {getUserName().charAt(0).toUpperCase()}
                </div>
                {getUserName()}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="mt-2 block rounded-lg px-4 py-3 text-center text-sm font-bold uppercase text-[#0f172a]"
              style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)' }}
            >
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Keyframe for active underline */}
      <style>{`
        @keyframes navUnderline {
          from { transform: scaleX(0); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
      `}</style>
    </header>
  );
};
