
import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
}

const Layout = ({ children, hideNavbar = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default Layout;
