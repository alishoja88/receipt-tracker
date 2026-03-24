import { useEffect } from 'react';
import { AboutTopSection } from './about/components/AboutTopSection';
import { AboutDescriptionSection } from './about/components/AboutDescriptionSection';
import { AboutDeveloperSection } from './about/components/AboutDeveloperSection';
import { WhyBuiltSection } from './about/components/WhyBuiltSection';
import { HowItWorksSection } from './about/components/HowItWorksSection';
import { CTASection } from './about/components/CTASection';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
        />
        <div
          className="absolute -right-40 -top-20 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
        />
      </div>

      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section divider helper */}
          <AboutTopSection />
          <AboutDescriptionSection />

          <div
            className="mx-auto my-24 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.2) 50%, transparent 100%)',
            }}
          />

          <AboutDeveloperSection />

          <div
            className="mx-auto my-24 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.2) 50%, transparent 100%)',
            }}
          />

          <WhyBuiltSection />
          <HowItWorksSection />
          <CTASection />
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
