
import { ReactNode } from 'react';
import Navbar from './Navbar';
import { FontProvider } from '@/context/FontContext';

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
  hideSecondaryNav?: boolean;
}

const Layout = ({ children, hideNavbar = false, hideSecondaryNav = false }: LayoutProps) => {
  // Assume navbar height is 4rem (64px)
  const navbarHeight = '4rem';
  return (
    <FontProvider>
      <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      {/* Removed background from main element */}
      <main className={`flex-grow min-h-[calc(100vh-${navbarHeight})] w-full`}>
        {children}
      </main>
      </div>
    </FontProvider>
  );
};

export default Layout;
