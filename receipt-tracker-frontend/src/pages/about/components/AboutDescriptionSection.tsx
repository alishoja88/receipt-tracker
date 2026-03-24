export const AboutDescriptionSection = () => {
  return (
    <div className="-mt-16 mb-24">
      <div
        className="mx-auto max-w-[700px] rounded-2xl border-[1.5px] p-10 text-left transition-all duration-300 hover:shadow-[0_16px_48px_rgba(20,184,166,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)] sm:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(30,41,59,0.4) 100%)',
          borderColor: 'rgba(20,184,166,0.28)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 12px 40px rgba(20,184,166,0.15), inset 0 1px 2px rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-base leading-[1.8] text-slate-300">
          ReceiptTrack is more than just an expense tracker—it's your personal financial assistant.
          Built with modern technology and user-first design, we help professionals, freelancers,
          and businesses effortlessly organize their receipts, track expenses, and gain real-time
          financial insights. Our intelligent system transforms chaotic expense data into actionable
          financial intelligence, enabling smarter financial decisions.
        </p>
      </div>
    </div>
  );
};
