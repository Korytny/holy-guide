
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MenubarMenu, 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarTrigger 
} from '@/components/ui/menubar';
import { User } from 'lucide-react';

const Navbar = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 
              className="text-xl font-bold cursor-pointer" 
              onClick={() => navigate('/cities')}
            >
              Holy India Wanderer
            </h1>
          </div>
          
          <div className="flex items-center">
            {auth.isAuthenticated ? (
              <Menubar className="border-none">
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <User size={20} />
                      <span>Профиль</span>
                    </div>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={() => navigate('/profile')}>
                      Мой профиль
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => navigate('/auth')}
              >
                <User size={16} />
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
