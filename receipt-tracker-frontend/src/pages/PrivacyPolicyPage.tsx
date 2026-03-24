import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, AlertTriangle, Shield } from 'lucide-react';

/* ── Section metadata for sidebar ── */
const sections = [
  { id: 'who-we-are', label: 'Who We Are' },
  { id: 'what-we-collect', label: 'What We Collect' },
  { id: 'how-we-use', label: 'How We Use Data' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'security', label: 'Security' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact Us' },
];

/* ── Reusable components ── */

const SectionCard = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section
    id={id}
    className="rounded-2xl border-[1.5px] p-8 transition-all duration-300 hover:border-teal-500/[0.28] hover:shadow-[0_8px_32px_rgba(20,184,166,0.08)] sm:p-10"
    style={{
      background: 'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(30,41,59,0.12) 100%)',
      borderColor: 'rgba(20,184,166,0.18)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      scrollMarginTop: 100,
    }}
  >
    <h2
      className="mb-5 text-2xl font-extrabold sm:text-[28px]"
      style={{
        background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {title}
    </h2>
    <div className="space-y-4 text-sm leading-relaxed text-slate-300 sm:text-[15px] sm:leading-[1.8]">
      {children}
    </div>
  </section>
);

const BulletList = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-3 pl-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative pl-7 text-sm text-slate-300 leading-relaxed sm:text-[15px] sm:leading-[1.8]"
      >
        <span className="absolute left-0 font-bold text-teal-400">→</span>
        {item}
      </li>
    ))}
  </ul>
);

const HighlightBox = ({
  variant = 'info',
  children,
}: {
  variant?: 'info' | 'warning';
  children: React.ReactNode;
}) => {
  const isWarning = variant === 'warning';
  return (
    <div
      className="mt-4 flex gap-3.5 rounded-[10px] border-l-[3px] p-4"
      style={{
        borderLeftColor: isWarning ? '#f59e0b' : '#2dd4bf',
        background: isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(45,212,191,0.08)',
      }}
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
      ) : (
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-400" />
      )}
      <div className="text-[13px] leading-relaxed text-slate-300">{children}</div>
    </div>
  );
};

/* ── Main page ── */
const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState('who-we-are');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 },
    );

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-teal-500/[0.12] py-14 text-center sm:py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
          />
        </div>
        <div className="relative">
          <h1
            className="mb-3 text-4xl font-extrabold sm:text-5xl md:text-[48px]"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm font-medium text-slate-500">Last updated: January 20, 2026</p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[280px_1fr] lg:gap-16 lg:px-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-[100px] lg:self-start">
          <nav
            className="rounded-[14px] border border-teal-500/15 p-5"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.12) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <p className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.6px] text-slate-300">
              Contents
            </p>
            <ul className="space-y-0.5">
              {sections.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className={`w-full rounded-lg border-l-2 px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-300 ${
                      activeSection === s.id
                        ? 'border-l-teal-400 bg-teal-500/[0.12] pl-4 text-teal-400'
                        : 'border-l-transparent text-slate-400 hover:border-l-teal-400 hover:bg-teal-500/[0.06] hover:pl-4 hover:text-teal-400'
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-10">
          {/* 1. Who We Are */}
          <SectionCard id="who-we-are" title="Who We Are">
            <p>
              ReceiptTrack ("we", "us", "our", or the "Company") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you visit our website and use our services.
            </p>
            <p>
              We are a technology company specializing in AI-powered expense tracking and financial
              management solutions. Your privacy is fundamental to our mission of providing secure
              and transparent financial tools.
            </p>
          </SectionCard>

          {/* 2. What We Collect */}
          <SectionCard id="what-we-collect" title="What We Collect">
            <h3 className="text-base font-bold text-slate-200">Information You Provide</h3>
            <BulletList
              items={[
                <>
                  <strong className="text-slate-200">Account Information:</strong> Name, email
                  address, password, profile photo, and billing details
                </>,
                <>
                  <strong className="text-slate-200">Financial Data:</strong> Receipt images,
                  transaction details, merchant information, and spending categories
                </>,
                <>
                  <strong className="text-slate-200">Communication:</strong> Messages, feedback,
                  support requests, and survey responses
                </>,
                <>
                  <strong className="text-slate-200">Payment Information:</strong> Credit card
                  details (processed securely through third-party providers)
                </>,
              ]}
            />

            <HighlightBox>
              <strong className="text-slate-200">Sensitive Data Protection:</strong> We never
              collect passwords, credit card details, or SSNs directly. Financial data is encrypted
              end-to-end.
            </HighlightBox>

            <h3 className="mt-6 text-base font-bold text-slate-200">
              Information Collected Automatically
            </h3>
            <BulletList
              items={[
                <>
                  <strong className="text-slate-200">Device Information:</strong> IP address,
                  browser type, operating system, device ID
                </>,
                <>
                  <strong className="text-slate-200">Usage Data:</strong> Pages visited, features
                  used, time spent, click patterns, and feature usage
                </>,
                <>
                  <strong className="text-slate-200">Cookies & Tracking:</strong> Session cookies,
                  analytics cookies, and pixel tags
                </>,
              ]}
            />
          </SectionCard>

          {/* 3. How We Use Data */}
          <SectionCard id="how-we-use" title="How We Use Data">
            <p>We use collected information for the following purposes:</p>
            <BulletList
              items={[
                <>
                  <strong className="text-slate-200">Service Delivery:</strong> Processing receipts,
                  extracting data, and providing expense tracking
                </>,
                <>
                  <strong className="text-slate-200">Account Management:</strong> User
                  authentication, profile management, and billing
                </>,
                <>
                  <strong className="text-slate-200">Improvement:</strong> Analyzing usage patterns
                  to enhance features and performance
                </>,
                <>
                  <strong className="text-slate-200">Communication:</strong> Sending updates,
                  support responses, and notifications (with your consent)
                </>,
                <>
                  <strong className="text-slate-200">Security:</strong> Detecting fraud, preventing
                  abuse, and protecting our platform
                </>,
                <>
                  <strong className="text-slate-200">Legal Compliance:</strong> Meeting regulatory
                  requirements and legal obligations
                </>,
              ]}
            />

            <HighlightBox>
              <strong className="text-slate-200">Important:</strong> We will never sell your
              personal data to third parties. Your financial information remains yours alone.
            </HighlightBox>
          </SectionCard>

          {/* 4. Third-Party Services */}
          <SectionCard id="third-party" title="Third-Party Services">
            <p>We integrate with trusted third-party providers to enhance our services:</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Payment Processing',
                  desc: 'Stripe & PayPal handle all payment transactions securely.',
                },
                {
                  title: 'Analytics',
                  desc: 'Google Analytics and Mixpanel track usage patterns (anonymized).',
                },
                {
                  title: 'Cloud Storage',
                  desc: 'Amazon AWS securely hosts all user data with encryption.',
                },
                {
                  title: 'AI Processing',
                  desc: 'Our AI model processes receipts locally; data is never shared externally.',
                },
              ].map(item => (
                <div
                  key={item.title}
                  className="rounded-[10px] border border-teal-500/[0.12] bg-teal-500/[0.04] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/25 hover:bg-teal-500/[0.08]"
                >
                  <p className="mb-1 text-sm font-bold text-slate-200">{item.title}</p>
                  <p className="text-[13px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-5">
              These providers are bound by strict confidentiality agreements and comply with
              international data protection standards.
            </p>
          </SectionCard>

          {/* 5. Data Retention */}
          <SectionCard id="data-retention" title="Data Retention">
            <p>We retain your data for as long as necessary to provide our services:</p>
            <BulletList
              items={[
                <>
                  <strong className="text-slate-200">Account Data:</strong> Retained while your
                  account is active + 90 days after deletion
                </>,
                <>
                  <strong className="text-slate-200">Receipt Images:</strong> Stored indefinitely
                  unless you delete them manually
                </>,
                <>
                  <strong className="text-slate-200">Usage Logs:</strong> Retained for 12 months for
                  security and analytics purposes
                </>,
                <>
                  <strong className="text-slate-200">Cookies:</strong> Session cookies deleted upon
                  logout; persistent cookies expire after 2 years
                </>,
              ]}
            />
            <p className="mt-3">
              You can request permanent data deletion at any time. We will delete all your
              information within 30 days, except where legally required to retain it.
            </p>
          </SectionCard>

          {/* 6. Security */}
          <SectionCard id="security" title="Security">
            <p>We implement industry-standard security measures to protect your data:</p>
            <BulletList
              items={[
                <>
                  <strong className="text-slate-200">Encryption:</strong> All data encrypted in
                  transit (TLS 1.3) and at rest (AES-256)
                </>,
                <>
                  <strong className="text-slate-200">Access Control:</strong> Role-based access with
                  strict permissions for employees
                </>,
                <>
                  <strong className="text-slate-200">Monitoring:</strong> 24/7 security monitoring
                  and intrusion detection systems
                </>,
                <>
                  <strong className="text-slate-200">Compliance:</strong> GDPR, CCPA, and SOC 2 Type
                  II certified
                </>,
                <>
                  <strong className="text-slate-200">Backups:</strong> Automated daily backups with
                  redundancy across multiple regions
                </>,
              ]}
            />

            <HighlightBox>
              <strong className="text-slate-200">Incident Response:</strong> In the unlikely event
              of a data breach, we will notify affected users within 48 hours.
            </HighlightBox>
          </SectionCard>

          {/* 7. Your Rights */}
          <SectionCard id="your-rights" title="Your Rights">
            <p>
              Depending on your jurisdiction, you may have the following rights regarding your
              personal data:
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Right to Delete',
                  desc: 'Request deletion of your account and associated data.',
                },
                {
                  title: 'Right to Portability',
                  desc: 'Export your data in a standard format to another service.',
                },
                {
                  title: 'Right to Opt-Out',
                  desc: 'Unsubscribe from marketing communications and tracking.',
                },
                {
                  title: 'Right to Withdraw Consent',
                  desc: 'Revoke consent for data processing at any time.',
                },
              ].map(item => (
                <div
                  key={item.title}
                  className="rounded-[10px] border border-teal-500/15 p-[18px] transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/[0.28] hover:shadow-[0_6px_20px_rgba(20,184,166,0.1)]"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.08) 100%)',
                  }}
                >
                  <p className="mb-1 text-sm font-bold text-slate-200">{item.title}</p>
                  <p className="text-[13px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-5">
              To exercise any of these rights, contact us at{' '}
              <strong className="text-slate-100">alishojaa88@gmail.com</strong>. We will respond
              within 30 days.
            </p>
          </SectionCard>

          {/* 8. Contact Us */}
          <SectionCard id="contact" title="Questions? Contact Us">
            <p>
              If you have any questions about this Privacy Policy or our data practices, please
              reach out:
            </p>

            <div className="mt-5">
              <div className="rounded-[10px] border border-teal-500/[0.12] bg-teal-500/[0.04] p-[18px]">
                <p
                  className="mb-2 text-[11px] font-bold uppercase tracking-[0.5px]"
                  style={{
                    background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  EMAIL:
                </p>
                <a
                  href="mailto:alishojaa88@gmail.com"
                  className="text-sm text-teal-400 transition-colors hover:text-teal-300"
                >
                  alishojaa88@gmail.com
                </a>
              </div>
            </div>
          </SectionCard>

          {/* ── CTA ── */}
          <div
            className="rounded-[14px] border-[1.5px] p-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(20,184,166,0.12)] sm:p-10"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(6,182,212,0.06) 100%)',
              borderColor: 'rgba(20,184,166,0.25)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <Shield className="mx-auto mb-3 h-8 w-8 text-teal-400" />
            <h3
              className="mb-2 text-xl font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Still Have Questions?
            </h3>
            <p className="mb-5 text-sm text-slate-400">
              Our privacy team is here to help. Reach out anytime.
            </p>
            <Link
              to="/contact"
              className="group relative inline-block overflow-hidden rounded-lg px-8 py-3 text-[13px] font-bold uppercase tracking-[0.4px] text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(20,184,166,0.32)]"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
                boxShadow: '0 6px 20px rgba(20,184,166,0.25)',
              }}
            >
              <span className="relative z-[1]">CONTACT US</span>
              <span
                className="absolute inset-0 -left-full transition-[left] duration-500 ease-in-out group-hover:left-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                }}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
