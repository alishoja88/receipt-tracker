import { Lightbulb } from 'lucide-react';

export const WhyBuiltSection = () => {
  return (
    <div className="mb-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
      {/* Left - Storytelling */}
      <div className="flex flex-col gap-6">
        <h2 className="mb-2 text-[32px] font-extrabold text-slate-100">Why I Built This</h2>
        <p className="text-[15px] leading-[1.8] text-slate-300">
          For years, I watched friends and colleagues struggle with expense management. Every month
          brought the same chaos: stacks of paper receipts, lost transactions, and hours spent
          reconciling data. I realized there had to be a better way.
        </p>
        <p className="text-[15px] leading-[1.8] text-slate-300">
          ReceiptTrack emerged from a core belief: financial management shouldn't be a burden. It
          should be seamless, intelligent, and empowering. I wanted to build something that feels
          less like a chore and more like a trusted financial advisor—always there, always helping.
        </p>
      </div>

      {/* Right - Vision Card */}
      <div
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-[1.5px] p-12 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(20,184,166,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)]"
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(30,41,59,0.4) 100%)',
          borderColor: 'rgba(20,184,166,0.28)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 40px rgba(20,184,166,0.15), inset 0 1px 2px rgba(255,255,255,0.08)',
        }}
      >
        <Lightbulb
          className="mb-5 h-12 w-12 text-yellow-400"
          style={{ filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.4))' }}
        />
        <h3 className="mb-3 text-lg font-bold text-teal-400">The Vision</h3>
        <p className="text-sm leading-relaxed text-slate-300">
          Empower individuals and businesses to take control of their finances through intelligent,
          frictionless technology. Every feature is designed with one goal: make financial clarity
          effortless.
        </p>
      </div>
    </div>
  );
};
