import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store';

export const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    // Check if user is logged in
    if (isAuthenticated) {
      // User is logged in, redirect to upload page
      navigate('/upload');
    } else {
      // User is not logged in, redirect to login page
      navigate('/login');
    }
  };

  const handleDemoClick = () => {
    if (isAuthenticated) {
      // If logged in, go to upload page
      navigate('/upload');
    } else {
      // If not logged in, scroll to demo section
      const demoSection = document.getElementById('try-it-now');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
      style={{
        marginTop: '-18px',
        marginLeft: '-18px',
        marginRight: '-18px',
        paddingTop: '18px',
        paddingLeft: '18px',
        paddingRight: '18px',
      }}
    >
      {/* Background Gradient - Base Layer */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        }}
      />

      {/* Radial Glow Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 md:space-y-10">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight px-4">
            Easily track your expenses by simply uploading your receipts
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            No more manual entry. Our AI-powered system extracts all the data you need
            automatically.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 sm:pt-6 px-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)]"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDemoClick}
              className="w-full sm:w-auto bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-400 font-semibold text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)]"
            >
              Upload Demo Receipt
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
