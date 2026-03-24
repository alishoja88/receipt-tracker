import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, Receipt, Zap, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store';

const heroCardItems = [
  {
    icon: Receipt,
    label: 'Receipt Captured',
    value: 'Coffee Shop - $4.50',
    color: 'text-teal-400',
  },
  { icon: Zap, label: 'AI Processing', value: 'Extracting data...', color: 'text-amber-400' },
  {
    icon: CheckCircle,
    label: 'Data Organized',
    value: 'Category: Food & Dining',
    color: 'text-emerald-400',
  },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/upload' : '/login');
  };

  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
        />
        <div
          className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left - Content */}
          <div className="flex flex-col gap-8">
            <h1
              className="text-4xl font-extrabold leading-[1.15] sm:text-5xl md:text-[56px]"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Smart Expense Tracking, Simplified
            </h1>

            <p className="max-w-[540px] text-lg leading-[1.8] text-slate-300">
              Upload receipts, capture data automatically with AI, and gain real-time financial
              insights. Organize your expenses smarter, not harder.
            </p>

            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={handleGetStarted}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-[10px] px-10 py-3.5 text-sm font-bold uppercase tracking-[0.6px] text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(20,184,166,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
                  boxShadow: '0 8px 28px rgba(20,184,166,0.32)',
                }}
              >
                <Sparkles className="h-4 w-4" />
                <span className="relative z-[1]">GET STARTED FREE</span>
                <span
                  className="absolute inset-0 -left-full transition-[left] duration-500 ease-in-out group-hover:left-full"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                  }}
                />
              </button>

              <button
                onClick={scrollToDemo}
                className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-teal-500/30 bg-teal-500/10 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.6px] text-teal-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/50 hover:bg-teal-500/15 hover:shadow-[0_8px_24px_rgba(20,184,166,0.15)]"
              >
                <Play className="h-4 w-4" />
                WATCH DEMO
              </button>
            </div>
          </div>

          {/* Right - Floating Card Visual */}
          <div className="relative flex h-[420px] items-center justify-center lg:h-[500px]">
            {/* Background circle glow */}
            <div
              className="absolute right-0 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full opacity-40 lg:h-[440px] lg:w-[440px]"
              style={{
                background: 'radial-gradient(circle, rgba(20,184,166,0.15), transparent 70%)',
              }}
            />

            {/* The card */}
            <div
              className="relative z-[2] w-full max-w-[420px] rounded-[20px] border-[1.5px] p-8"
              style={{
                background:
                  'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(30,41,59,0.4) 100%)',
                borderColor: 'rgba(20,184,166,0.28)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow:
                  '0 20px 60px rgba(20,184,166,0.2), inset 0 1px 2px rgba(255,255,255,0.08)',
                animation: 'heroFloat 6s ease-in-out infinite',
              }}
            >
              {/* Window dots */}
              <div className="mb-6 flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              <div className="flex flex-col gap-4">
                {heroCardItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-teal-500/15 bg-teal-500/[0.06] p-4"
                    >
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.1) 100%)',
                        }}
                      >
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-100">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Float animation */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
};
