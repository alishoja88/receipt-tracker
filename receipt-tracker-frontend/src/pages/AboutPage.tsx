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
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      {/* Main Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Top Section */}
            <AboutTopSection />

            {/* Description Section */}
            <AboutDescriptionSection />

            {/* Developer Section */}
            <AboutDeveloperSection />

            {/* Why Built Section */}
            <WhyBuiltSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* CTA Section */}
            <CTASection />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
