import { Link } from "wouter";
import { useState } from "react";
import { 
  Book, 
  Settings, 
  CreditCard, 
  Users,
  BarChart3,
  MessageCircle,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { LanguageSelector } from "@/components/LanguageSelector";
// Import logos as Vite assets to ensure they're included in the build
import logoHorizontalImg from "@/assets/logo-horizontal.png";
import logoIconImg from "@/assets/logo-icon.png";

const logoHorizontal = logoHorizontalImg + "?v=1.0.9&t=" + Math.floor(Date.now() / 1000);
const logoIcon = logoIconImg + "?v=1.0.9&t=" + Math.floor(Date.now() / 1000);

export default function Header() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site-header bg-background border-b border-border">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between min-h-[48px] sm:min-h-[60px] gap-2 sm:gap-3 md:gap-4">
          {/* Logo - Responsive logo component */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" data-testid="header-logo">
                {/* Mobile: Show only icon - Mobile Optimized */}
                <img 
                  src={logoIcon}
                  alt="DTTools" 
                  className="block sm:hidden object-contain shrink-0 h-10 w-10 min-h-[40px] min-w-[40px]"
                  data-testid="logo-icon-mobile"
                  onError={(e) => {
                    console.error('Logo icon failed to load:', e);
                    console.error('Failed URL:', logoIcon);
                    // Force reload attempt
                    setTimeout(() => {
                      (e.target as HTMLImageElement).src = `/logo-icon.png?force=${Date.now()}`;
                    }, 1000);
                  }}
                />
                {/* Desktop: Show full horizontal logo */}
                <img 
                  src={logoHorizontal}
                  alt="DTTools" 
                  className="hidden sm:block object-contain shrink-0 h-8 w-auto sm:h-10 md:h-14 lg:h-16 min-h-[32px]"
                  data-testid="logo-img-desktop"
                  onError={(e) => {
                    console.error('Logo horizontal failed to load:', e);
                    console.error('Failed URL:', logoHorizontal);
                    // Force reload attempt
                    setTimeout(() => {
                      (e.target as HTMLImageElement).src = `/logo-horizontal.png?force=${Date.now()}`;
                    }, 1000);
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Navigation - Center section with responsive sizing */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-center max-w-3xl">
            <Link href="/projects">
              <Button variant="ghost" className="text-sm" data-testid="nav-projects">
                <Users className="mr-1 h-4 w-4" />
                {t("nav.projects") || "Projects"}
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="ghost" className="text-sm" data-testid="nav-library">
                <Book className="mr-1 h-4 w-4" />
                {t("nav.library")}
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/chat">
                <Button variant="ghost" className="text-sm" data-testid="nav-chat">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  Chat IA
                </Button>
              </Link>
            )}
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm" data-testid="nav-dashboard">
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
            <Link href="/pricing">
              <Button variant="ghost" className="text-sm" data-testid="nav-pricing">
                <CreditCard className="mr-1 h-4 w-4" />
                {t("nav.pricing")}
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="ghost" className="text-sm" data-testid="nav-help">
                <HelpCircle className="mr-1 h-4 w-4" />
                Ajuda
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="ghost" className="text-sm" data-testid="nav-admin">
                  <Settings className="mr-1 h-4 w-4" />
                  {t("nav.admin")}
                </Button>
              </Link>
            )}
          </nav>

          {/* User Actions & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile: ONLY Menu Button - User avatar goes inside menu */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="mobile-menu-button"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                className="p-2 h-10 w-10 hover:bg-gray-100 relative z-30 min-h-[44px] min-w-[44px]"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>

            {/* Desktop: Full User Actions */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0 min-w-[120px] justify-end">
              <LanguageSelector />
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link href="/login">
                  <Button data-testid="button-login">
                    {t("nav.login")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu - Fixed positioning issues */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden border-t border-border bg-background relative z-20 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                <Link href="/projects">
                  <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-projects" onClick={() => setIsMobileMenuOpen(false)}>
                    <Users className="mr-2 h-4 w-4" />
                    {t("nav.projects") || "Projects"}
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-library" onClick={() => setIsMobileMenuOpen(false)}>
                    <Book className="mr-2 h-4 w-4" />
                    {t("nav.library")}
                  </Button>
                </Link>
                {isAuthenticated && (
                  <Link href="/chat">
                    <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-chat" onClick={() => setIsMobileMenuOpen(false)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat IA
                    </Button>
                  </Link>
                )}
                {isAuthenticated && (
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/pricing">
                  <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-pricing" onClick={() => setIsMobileMenuOpen(false)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("nav.pricing")}
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-help" onClick={() => setIsMobileMenuOpen(false)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ajuda
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}
                
                {/* Mobile User Actions - WITH UserMenu */}
                <div className="pt-4 border-t border-border">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-center">
                      <LanguageSelector />
                    </div>
                    {isAuthenticated ? (
                      <div className="flex justify-center py-2">
                        <UserMenu />
                      </div>
                    ) : (
                      <Link href="/login">
                        <Button className="w-full" data-testid="mobile-button-login" onClick={() => setIsMobileMenuOpen(false)}>
                          {t("nav.login")}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}