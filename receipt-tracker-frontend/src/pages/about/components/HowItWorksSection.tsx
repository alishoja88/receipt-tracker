import { Camera, Zap, FolderOpen, BarChart3, type LucideIcon } from 'lucide-react';

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Camera,
    title: 'CAPTURE',
    description: 'Snap a photo of any receipt with your phone or upload documents instantly',
  },
  {
    number: 2,
    icon: Zap,
    title: 'ANALYZE',
    description:
      'Our AI automatically extracts data, categorizes expenses, and validates information',
  },
  {
    number: 3,
    icon: FolderOpen,
    title: 'ORGANIZE',
    description: 'All your expenses are intelligently organized and searchable in one place',
  },
  {
    number: 4,
    icon: BarChart3,
    title: 'INSIGHTS',
    description: 'Get real-time analytics, reports, and actionable financial insights',
  },
];

export const HowItWorksSection = () => {
  return (
    <div className="mb-24">
      <h2 className="mb-3 text-center text-[32px] font-extrabold text-slate-100">
        How ReceiptTrack Works
      </h2>
      <p className="mx-auto mb-12 text-center text-base text-slate-500">
        Four simple steps to financial clarity
      </p>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="group relative flex min-h-[200px] flex-col gap-4 rounded-[14px] border border-teal-500/[0.18] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-500/35 hover:shadow-[0_8px_32px_rgba(20,184,166,0.18)]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.2) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {/* Step number */}
              <div
                className="flex h-11 w-11 items-center justify-center rounded-[10px] border-[1.5px] border-teal-500/30 text-lg font-bold text-teal-400 transition-all duration-250 group-hover:scale-105 group-hover:border-teal-500/50 group-hover:shadow-[0_0_16px_rgba(20,184,166,0.2)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <Icon className="h-8 w-8 text-teal-400 transition-transform duration-250 group-hover:scale-110" />

              {/* Title */}
              <h3 className="text-sm font-bold uppercase tracking-[0.5px] text-slate-100">
                {step.title}
              </h3>

              {/* Description */}
              <p className="flex-grow text-[13px] leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
