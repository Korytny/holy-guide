
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
      {!hideNavbar && <Navbar className="sticky top-0 z-50" />}
      {/* Removed background from main element */}
      <main className={`flex-grow w-full`}>
        {children}
      </main>
      </div>
    </FontProvider>
  );
};

export default Layout;
