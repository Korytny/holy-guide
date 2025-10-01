
import { ReactNode } from 'react';
import Navbar from './Navbar';
import { FontProvider } from '@/context/FontContext';

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
  hideSecondaryNav?: boolean;
  fullwidth?: boolean; // New prop for full-width sections
}

const Layout = ({ children, hideNavbar = false, hideSecondaryNav = false, fullwidth = false }: LayoutProps) => {
  // Assume navbar height is 4rem (64px)
  const navbarHeight = '4rem';
  return (
    <FontProvider>
      <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
        <main className="flex-grow">
        {children}
      </main>
      </div>
    </FontProvider>
  );
};

export default Layout;
