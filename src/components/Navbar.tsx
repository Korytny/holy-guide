import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { MenubarMenu, Menubar, MenubarContent, MenubarItem, MenubarTrigger } from '@/components/ui/menubar';
import { LogOut, User } from 'lucide-react';
import { signOut } from '../services/api';
import { useToast } from '@/hooks/use-toast';
const Navbar = () => {
  const {
    auth,
    refreshProfile
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из своего аккаунта."
      });
      await refreshProfile();
      navigate('/cities');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive"
      });
    }
  };
  console.log("Auth state in Navbar:", auth);
  return <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/cities')}>Wander guide</h1>
          </div>
          
          <div className="flex items-center">
            {auth.isAuthenticated ? <Menubar className="border-none">
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
                    <MenubarItem onClick={handleSignOut} className="text-red-600">
                      <LogOut size={16} className="mr-2" />
                      Выйти
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar> : <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate('/auth')}>
                <User size={16} />
                Войти
              </Button>}
          </div>
        </div>
      </div>
    </div>;
};
export default Navbar;