import { Camera, Zap, CheckCircle, BarChart3, type LucideIcon } from 'lucide-react';

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
    title: 'Snap or Upload',
    description:
      'Take a photo of your receipt with your phone or upload documents instantly from your device',
  },
  {
    number: 2,
    icon: Zap,
    title: 'AI Extracts',
    description:
      'Our system automatically recognizes and extracts all relevant information from your receipt',
  },
  {
    number: 3,
    icon: CheckCircle,
    title: 'Review & Organize',
    description: 'Verify details and organize expenses by category with smart suggestions',
  },
  {
    number: 4,
    icon: BarChart3,
    title: 'View Insights',
    description:
      'Access real-time analytics, reports, and actionable insights to control your finances',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40">
      {/* Header */}
      <div className="mx-auto mb-14 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-extrabold text-slate-100 sm:text-4xl md:text-[42px]">
          How It Works
        </h2>
        <p className="text-lg text-slate-300">Get started in seconds, not hours</p>
      </div>

      {/* Grid */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="group relative flex min-h-[280px] flex-col items-center gap-4 rounded-2xl border border-teal-500/[0.18] p-9 text-center transition-all duration-300 hover:-translate-y-2 hover:border-teal-500/35 hover:shadow-[0_12px_40px_rgba(20,184,166,0.18)]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.2) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {/* Number badge */}
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl border-[1.5px] border-teal-500/30 text-2xl font-extrabold text-teal-400 transition-all duration-300 group-hover:scale-110 group-hover:border-teal-500/50 group-hover:shadow-[0_0_24px_rgba(20,184,166,0.25)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(6,182,212,0.08) 100%)',
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <Icon className="h-6 w-6 text-teal-400 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(20,184,166,0.25)]" />

              {/* Title */}
              <h3 className="text-[17px] font-bold text-slate-100">{step.title}</h3>

              {/* Description */}
              <p className="flex-grow text-[13px] leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
