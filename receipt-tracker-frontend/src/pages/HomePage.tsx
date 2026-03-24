import { HeroSection, DemoSection, FeaturesSection, HowItWorksSection, CTASection } from './home';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.2) 50%, transparent 100%)',
          }}
        />
      </div>

      <DemoSection />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.2) 50%, transparent 100%)',
          }}
        />
      </div>

      <FeaturesSection />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.2) 50%, transparent 100%)',
          }}
        />
      </div>

      <HowItWorksSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
