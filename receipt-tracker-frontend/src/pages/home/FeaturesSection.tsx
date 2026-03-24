import { Brain, BarChart3, Shield, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  emoji: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    emoji: '🤖',
    title: 'AI-Powered Recognition',
    description:
      'Automatically extract merchant names, dates, amounts, and categories from receipts in seconds. No manual data entry required.',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Real-Time Insights',
    description:
      'Track spending patterns, view category breakdowns, identify trends, and receive personalized financial recommendations.',
  },
  {
    icon: Shield,
    emoji: '🔒',
    title: 'Bank-Grade Security',
    description:
      'End-to-end encryption for all financial data. Your information is secure and we never share it with third parties.',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 sm:py-32 lg:py-40">
      {/* Header */}
      <div className="mx-auto mb-14 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-extrabold text-slate-100 sm:text-4xl md:text-[42px]">
          Why ReceiptTrack Stands Out
        </h2>
        <p className="mx-auto max-w-[600px] text-lg leading-relaxed text-slate-300">
          Powerful features designed to save you time and help you make smarter financial decisions
        </p>
      </div>

      {/* Grid */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {features.map(feature => (
          <div
            key={feature.title}
            className="group relative flex min-h-[280px] flex-col gap-5 rounded-2xl border border-teal-500/[0.18] p-10 transition-all duration-300 hover:-translate-y-2 hover:border-teal-500/35 hover:shadow-[0_16px_48px_rgba(20,184,166,0.2)]"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(30,41,59,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <span className="text-5xl leading-none transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(20,184,166,0.3)]">
              {feature.emoji}
            </span>
            <h3 className="relative z-[2] text-lg font-bold text-slate-100">{feature.title}</h3>
            <p className="relative z-[2] flex-grow text-sm leading-relaxed text-slate-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
