export const AboutTopSection = () => {
  return (
    <div className="mb-28 text-center">
      <h1
        className="mb-4 text-4xl font-extrabold sm:text-5xl md:text-[48px]"
        style={{
          background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        About ReceiptTrack
      </h1>
      <p className="mx-auto mb-12 max-w-[600px] text-base leading-relaxed text-slate-300 sm:text-lg">
        Transform your financial management with intelligent receipt tracking and expense automation
      </p>
    </div>
  );
};
