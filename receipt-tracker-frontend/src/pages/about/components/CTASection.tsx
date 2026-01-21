import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store';

export const CTASection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/upload');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="mt-16 sm:mt-20 md:mt-24">
      <div
        className="rounded-2xl p-8 sm:p-10 md:p-12 lg:p-16 text-center max-w-3xl mx-auto"
        style={{
          background:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
        }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-xl mx-auto">
          Start organizing your receipts and take control of your spending today.
        </p>
        <button
          onClick={handleGetStarted}
          className="px-8 py-4 rounded-xl font-semibold text-lg text-white flex items-center gap-2 mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
          }}
        >
          Start Tracking Receipts
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
