
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import Layout from "../components/Layout";

const Profile = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate('/auth');
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Вы вышли из аккаунта",
        description: "Вы успешно вышли из вашего аккаунта."
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта. Пожалуйста, попробуйте снова.",
        variant: "destructive"
      });
    }
  };

  if (auth.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <h1 className="text-2xl font-semibold mb-4">Загрузка</h1>
            <p className="text-gray-500">Пожалуйста, подождите...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!auth.user) {
    return null; // This will be handled by the useEffect redirect
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center border-b border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900">Ваш профиль</h1>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={auth.user.avatarUrl || undefined} alt={auth.user.fullName || "User"} />
                  <AvatarFallback className="text-3xl">{getInitials(auth.user.fullName)}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-semibold mb-1">
                  {auth.user.fullName || "Добро пожаловать!"}
                </h2>
                
                <div className="mt-8 w-full flex justify-center">
                  <Button onClick={handleSignOut} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                    Выйти
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cities')}
              className="text-gray-600 hover:text-gray-900"
            >
              Вернуться к городам
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
