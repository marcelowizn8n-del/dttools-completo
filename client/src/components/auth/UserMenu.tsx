import { useState } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("UserMenu: Starting logout process...");
      await logout();
      console.log("UserMenu: Logout completed successfully");
    } catch (error) {
      console.error("UserMenu: Logout error:", error);
      alert(`Erro no logout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setTimeout(() => setLocation(path), 100);
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 sm:h-8 sm:w-8 rounded-full hover:bg-gray-100" data-testid="button-user-menu">
          <Avatar className="h-9 w-9 sm:h-8 sm:w-8">
            {user.profilePicture && (
              <AvatarImage src={user.profilePicture} alt={user.username} />
            )}
            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
              {getUserInitials(user.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-50" align="end" forceMount sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none" data-testid="text-username">
              {user.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground" data-testid="text-role">
              {isAdmin ? "Administrador" : "Usuário"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer" 
          onClick={() => handleNavigate("/profile")}
          data-testid="button-profile"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem 
            className="cursor-pointer" 
            onClick={() => handleNavigate("/admin")}
            data-testid="button-admin"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Administração</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}