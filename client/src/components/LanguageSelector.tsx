import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const languages = [
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-auto px-2 py-1 gap-1"
          data-testid="button-language-selector"
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <Globe className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as Language)}
            className={`flex items-center gap-2 ${
              language === lang.code ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
            data-testid={`menu-item-language-${lang.code}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-xs text-blue-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}