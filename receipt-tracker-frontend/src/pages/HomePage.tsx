import { HeroSection, DemoSection, FeaturesSection, TestimonialsSection } from './home';

const HomePage = () => {
  return (
    <div className="min-h-screen -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12">
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <TestimonialsSection />

      {/* Other sections will be added here */}
    </div>
  );
};

export default HomePage;
