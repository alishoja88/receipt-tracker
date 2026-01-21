import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/modules/auth/api/auth.api';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      authApi.loginWithGoogle();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12">
      {/* Background Gradient - Base Layer */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        }}
      />

      {/* Blue Glow Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg w-full space-y-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B82F6' }}>
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>
                Receiptly
              </span>
            </Link>

            {/* Headline */}
            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
                style={{ color: '#F1F5F9' }}
              >
                Track your expenses in seconds
              </h1>
              <p className="text-lg sm:text-xl" style={{ color: '#94A3B8' }}>
                Upload your receipts and let AI automatically organize your spending. No manual
                entry, no hassle.
              </p>
            </div>

            {/* Floating Receipt Illustration */}
            <div className="hidden lg:block pt-8">
              <div
                className="inline-block p-12 rounded-3xl animate-float"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  transform: 'rotate(-5deg)',
                }}
              >
                <Receipt className="w-32 h-32" style={{ color: '#3B82F6' }} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div
              className="rounded-3xl p-8 sm:p-10 shadow-2xl"
              style={{
                background: 'rgba(241, 245, 249, 0.98)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
              }}
            >
              {/* Card Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#0F172A' }}>
                  Welcome to Receiptly
                </h2>
                <p className="text-base sm:text-lg" style={{ color: '#64748B' }}>
                  Sign in to start tracking your receipts
                </p>
              </div>

              {/* Google Sign-in Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                size="lg"
                className="w-full h-14 bg-white hover:bg-white text-[#1E293B] border-2 border-[#E2E8F0] hover:border-[#E2E8F0] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out shadow-[0_2px_8px_rgba(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed text-base font-semibold"
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#1E293B] border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      {/* Google Logo SVG */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </div>
              </Button>

              {/* Error Message */}
              {error && (
                <div
                  className="mt-4 p-4 rounded-lg animate-slideIn"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid #EF4444',
                  }}
                >
                  <p className="text-sm text-center" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Helper Text */}
              <div className="text-xs sm:text-sm text-center mt-6 space-y-2">
                <p style={{ color: '#94A3B8' }}>
                  By continuing with Google, you'll create or sign in to your Receiptly account.
                </p>
                <p style={{ color: '#94A3B8' }}>
                  By continuing, you agree to our{' '}
                  <Link
                    to="/privacy-policy"
                    className="underline hover:no-underline transition-all"
                    style={{ color: '#3B82F6' }}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Back to Homepage Link */}
            <Link
              to="/"
              className="flex items-center justify-center gap-2 mt-8 transition-colors duration-200"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#F1F5F9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to homepage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateY(-20px) rotate(-5deg);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 0.6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
