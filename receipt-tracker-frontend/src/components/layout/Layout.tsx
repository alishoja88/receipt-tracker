import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ProfileDrawer } from '@/components/profile';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'linear-gradient(180deg, #071018 0%, #0a111a 40%, #0d1420 100%)' }}
    >
      <Header />
      <main className="flex-1" style={{ padding: '18px' }}>
        {children}
      </main>
      <Footer />
      <ProfileDrawer />
    </div>
  );
};
