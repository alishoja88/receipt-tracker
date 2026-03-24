import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

export const CTASection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/upload' : '/login');
  };

  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8 lg:pb-40">
      <div
        className="mx-auto max-w-7xl rounded-[20px] border-[1.5px] p-14 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_72px_rgba(20,184,166,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] sm:p-16"
        style={{
          background:
            'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(6,182,212,0.06) 100%)',
          borderColor: 'rgba(20,184,166,0.28)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 20px 60px rgba(20,184,166,0.15), inset 0 1px 2px rgba(255,255,255,0.08)',
        }}
      >
        <h2 className="mb-4 text-2xl font-extrabold text-slate-100 sm:text-3xl md:text-4xl">
          Start Tracking Your Expenses Today
        </h2>
        <p className="mx-auto mb-8 max-w-[600px] text-base leading-relaxed text-slate-300">
          Join thousands of professionals and freelancers who've simplified their expense
          management. No credit card required.
        </p>
        <button
          onClick={handleGetStarted}
          className="group relative inline-block overflow-hidden rounded-[10px] px-12 py-4 text-sm font-bold uppercase tracking-[0.6px] text-[#0f172a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(20,184,166,0.4)]"
          style={{
            background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
            boxShadow: '0 8px 28px rgba(20,184,166,0.32)',
          }}
        >
          <span className="relative z-[1]">GET STARTED FREE</span>
          <span
            className="absolute inset-0 -left-full transition-[left] duration-500 ease-in-out group-hover:left-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            }}
          />
        </button>
      </div>
    </section>
  );
};
