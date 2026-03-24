import { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  Zap,
  ClipboardCheck,
  BarChart3,
  CloudUpload,
  Loader2,
  CreditCard,
  Tag,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

interface Step {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Camera,
    title: 'Upload Receipt',
    description: 'Snap a photo or upload a document from your device',
  },
  {
    number: 2,
    icon: Zap,
    title: 'AI Extracts Data',
    description: 'Our AI instantly recognizes merchant, date, amount, and category',
  },
  {
    number: 3,
    icon: ClipboardCheck,
    title: 'Review & Organize',
    description: 'Verify details and organize by category with one click',
  },
  {
    number: 4,
    icon: BarChart3,
    title: 'View Insights',
    description: 'Real-time analytics and spending trends at your fingertips',
  },
];

/* ─── Step 1: Upload Preview ─── */
const UploadPreview = () => (
  <div className="flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
    <div
      className="flex w-full max-w-[280px] cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-teal-500/30 p-10 transition-all duration-300 hover:border-teal-500/50 hover:shadow-[0_0_20px_rgba(20,184,166,0.1)]"
      style={{
        background: 'linear-gradient(135deg, rgba(20,184,166,0.05) 0%, rgba(30,41,59,0.08) 100%)',
      }}
    >
      <CloudUpload className="h-12 w-12 text-teal-400/60" />
      <div>
        <p className="text-sm font-semibold text-slate-200">Drop receipt here</p>
        <p className="mt-1 text-xs text-slate-500">or click to browse</p>
      </div>
    </div>
  </div>
);

/* ─── Step 2: Processing Preview ─── */
const ProcessingPreview = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => (p >= 100 ? 0 : p + 2));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-10 text-center">
      <div className="relative">
        <Loader2 className="h-14 w-14 animate-spin text-teal-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-200">Extracting data...</p>
        <p className="mt-1 text-xs text-slate-500">Analyzing receipt with AI</p>
      </div>
      <div className="w-48">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/60">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #2dd4bf, #06b6d4)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Step 3: Receipt List Preview ─── */
const receiptPreviewData = [
  {
    store: 'Whole Foods Market',
    date: 'Mar 22, 2026',
    amount: '$47.92',
    category: 'Grocery',
    payment: 'Card',
  },
  {
    store: 'Shell Gas Station',
    date: 'Mar 21, 2026',
    amount: '$38.50',
    category: 'Transport',
    payment: 'Card',
  },
  {
    store: 'Starbucks Coffee',
    date: 'Mar 20, 2026',
    amount: '$6.75',
    category: 'Food & Dining',
    payment: 'Cash',
  },
];

const ReceiptListPreview = () => (
  <div className="flex h-full flex-col overflow-hidden">
    {receiptPreviewData.map((r, i) => (
      <div
        key={r.store}
        className="flex items-center justify-between border-b border-teal-500/[0.08] px-5 py-4"
        style={{ animation: `demoSlideIn 400ms ease ${i * 120}ms both` }}
      >
        <div className="flex-1">
          <p className="text-[13px] font-bold text-slate-100">{r.store}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px] text-slate-500">{r.date}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-teal-500/20 bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-teal-400">
              <Tag className="h-2.5 w-2.5" />
              {r.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
              <CreditCard className="h-2.5 w-2.5" />
              {r.payment}
            </span>
          </div>
        </div>
        <p className="text-sm font-bold text-teal-400">{r.amount}</p>
      </div>
    ))}
  </div>
);

/* ─── Step 4: Dashboard Preview ─── */
const barHeights = [45, 72, 58, 85, 65, 92, 78];

const DashboardPreview = () => (
  <div className="flex h-full flex-col gap-4 overflow-hidden p-5">
    <p className="text-xs font-bold text-slate-400">Monthly Overview</p>

    {/* Stat cards */}
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: 'Total Spent', value: '$1,247.50', icon: DollarSign },
        { label: 'Avg / Receipt', value: '$31.19', icon: TrendingUp },
      ].map(s => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex flex-col gap-1.5 rounded-xl border border-teal-500/15 p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(30,41,59,0.12))',
            }}
          >
            <div className="flex items-center gap-1.5">
              <Icon className="h-3 w-3 text-teal-400" />
              <span className="text-[10px] font-semibold text-slate-500">{s.label}</span>
            </div>
            <span
              className="text-lg font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {s.value}
            </span>
          </div>
        );
      })}
    </div>

    {/* Mini bar chart */}
    <div className="flex flex-1 items-end justify-around gap-2 pb-2 pt-1">
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${h}%`,
            background: `linear-gradient(180deg, rgba(45,212,191,0.4) 0%, rgba(20,184,166,0.1) 100%)`,
            border: '1px solid rgba(20,184,166,0.2)',
            animation: `demoGrowUp 600ms cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms both`,
          }}
        />
      ))}
    </div>
  </div>
);

/* ─── Step previews map ─── */
const previews = [UploadPreview, ProcessingPreview, ReceiptListPreview, DashboardPreview];

/* ─── Main DemoSection ─── */
export const DemoSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const advanceStep = useCallback(() => {
    setActiveStep(prev => (prev + 1) % steps.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(advanceStep, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, advanceStep]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsAutoPlaying(false);
  };

  const ActivePreview = previews[activeStep];

  return (
    <section id="demo-section" className="relative py-24 sm:py-32 lg:py-40">
      {/* Header */}
      <div className="mx-auto mb-14 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-extrabold text-slate-100 sm:text-4xl md:text-[42px]">
          See ReceiptTrack in Action
        </h2>
        <p className="text-lg leading-relaxed text-slate-300">
          Watch how easy it is to turn receipts into actionable expense insights
        </p>
      </div>

      {/* Demo container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-3xl border-[1.5px] p-8 sm:p-10 lg:p-12"
          style={{
            background:
              'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.2) 100%)',
            borderColor: 'rgba(20,184,166,0.25)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 20px 60px rgba(20,184,166,0.15), inset 0 1px 2px rgba(255,255,255,0.08)',
          }}
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Left - Steps */}
            <div className="flex flex-col gap-5">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === activeStep;
                return (
                  <button
                    key={step.number}
                    onClick={() => handleStepClick(i)}
                    className={`group flex items-start gap-4 rounded-xl border px-5 py-5 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-teal-500/35 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                        : 'border-teal-500/10 hover:border-teal-500/20 hover:translate-x-1'
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)'
                        : 'rgba(20,184,166,0.04)',
                    }}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border-[1.5px] text-lg font-extrabold transition-all duration-250 ${
                        isActive
                          ? 'border-teal-500/50 text-teal-400 shadow-[0_0_16px_rgba(20,184,166,0.25)]'
                          : 'border-teal-500/20 text-teal-500/60'
                      }`}
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(20,184,166,0.28) 0%, rgba(6,182,212,0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                      }}
                    >
                      {step.number}
                    </div>
                    <div className="pt-0.5">
                      <p className="flex items-center gap-2 text-base font-bold text-slate-100">
                        <Icon
                          className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`}
                        />
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right - Live Preview */}
            <div
              className="relative overflow-hidden rounded-[20px] border-[1.5px]"
              style={{
                borderColor: 'rgba(20,184,166,0.22)',
                background:
                  'linear-gradient(135deg, rgba(10,10,25,0.8) 0%, rgba(20,30,50,0.6) 100%)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), 0 0 30px rgba(20,184,166,0.08)',
                minHeight: 420,
              }}
            >
              {/* Window dots bar */}
              <div className="flex gap-2 border-b border-teal-500/[0.12] bg-[rgba(10,10,25,0.5)] px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>

              {/* Preview content with fade transition */}
              <div className="relative h-[380px]">
                <div
                  key={activeStep}
                  className="absolute inset-0"
                  style={{ animation: 'demoFadeIn 400ms cubic-bezier(0.4,0,0.2,1)' }}
                >
                  <ActivePreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes demoFadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes demoSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes demoGrowUp {
          from { transform: scaleY(0); transform-origin: bottom; }
          to { transform: scaleY(1); transform-origin: bottom; }
        }
      `}</style>
    </section>
  );
};
