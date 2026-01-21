import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const handleCallback = useAuthStore(state => state.handleCallback);
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      handleCallback(accessToken, refreshToken)
        .then(async () => {
          // Fetch user profile after authentication
          try {
            await fetchUserProfile();
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
          }
          navigate('/dashboard', { replace: true });
        })
        .catch(error => {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_failed', { replace: true });
        });
    } else {
      navigate('/login?error=missing_tokens', { replace: true });
    }
  }, [searchParams, handleCallback, fetchUserProfile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
