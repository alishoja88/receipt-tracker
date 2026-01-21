import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/store/auth.store';

function App() {
  const accessToken = useAuthStore(state => state.accessToken);
  const setupTokenRefresh = useAuthStore(state => state.setupTokenRefresh);

  // Setup token refresh on app load if user is already authenticated
  useEffect(() => {
    if (accessToken) {
      console.log('📱 APP LOAD - User is authenticated, setting up token refresh timer...');
      setupTokenRefresh(accessToken);
    } else {
      console.log('📱 APP LOAD - User is not authenticated');
    }
  }, [accessToken, setupTokenRefresh]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default App;
