import { Link } from 'react-router-dom';
import { Github, Linkedin, Receipt } from 'lucide-react';

const productLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Upload Receipt', to: '/upload' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
];

const socialLinks = [
  { icon: Github, href: 'https://github.com/alishoja88', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/alias-shoja/', label: 'LinkedIn' },
];

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="group relative inline-block pb-0.5 text-sm text-slate-400 transition-colors duration-300 hover:text-teal-400"
  >
    {children}
    {/* Animated underline */}
    <span
      className="absolute bottom-0 left-0 h-[1.5px] w-0 rounded-full transition-all duration-300 group-hover:w-full"
      style={{
        background: 'linear-gradient(90deg, #2dd4bf 0%, #06b6d4 100%)',
        boxShadow: '0 0 6px rgba(20,184,166,0.4)',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    />
  </Link>
);

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-[#060c14]">
      <div className="mx-auto max-w-[1400px] px-6 pb-8 pt-14 sm:px-10 lg:px-14">
        {/* Main grid */}
        <div className="mb-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-16">
          {/* ── Brand ── */}
          <div>
            <Link
              to="/"
              className="group mb-5 inline-flex items-center gap-2.5 transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(20,184,166,0.3)]"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg border-[1.5px] border-teal-500/30 transition-all duration-300 group-hover:scale-110 group-hover:border-teal-500/50 group-hover:shadow-[0_0_16px_rgba(20,184,166,0.2)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                }}
              >
                <Receipt className="h-4 w-4 text-teal-400" />
              </div>
              <span
                className="text-lg font-extrabold"
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
            <p className="mb-6 max-w-[320px] text-sm leading-relaxed text-slate-400">
              AI-powered receipt tracking and expense insights in seconds. Organize your finances
              smarter, not harder.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map(s => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-teal-500/[0.12] text-teal-400/70 transition-all duration-250 hover:-translate-y-0.5 hover:border-teal-500/25 hover:bg-teal-500/[0.08] hover:text-teal-400 hover:shadow-[0_0_12px_rgba(20,184,166,0.1)]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(6,182,212,0.03) 100%)',
                    }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Product ── */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[1px] text-slate-200">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map(link => (
                <li key={link.label}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[1px] text-slate-200">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t pt-6" style={{ borderColor: 'rgba(20,184,166,0.08)' }}>
          <p className="text-center text-[13px] text-slate-500">
            © {currentYear} ReceiptTrack — Built with AI for smarter finance. ·{' '}
            <Link
              to="/privacy-policy"
              className="text-teal-500/60 transition-colors hover:text-teal-400"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
