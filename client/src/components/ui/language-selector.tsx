import React from 'react';
import { useLanguage, LanguageCode, LANGUAGES } from '@/hooks/use-language';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, getLanguageByCode } = useLanguage();
  const currentLang = getLanguageByCode(currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">{currentLang?.nativeName || "Language"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`cursor-pointer ${language.code === currentLanguage ? 'font-medium bg-muted' : ''}`}
            onClick={() => changeLanguage(language.code)}
          >
            <span className="mr-2">{getLanguageFlag(language.code)}</span>
            <span>{language.nativeName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get flag emoji based on language code
function getLanguageFlag(code: LanguageCode): string {
  const flagMap: Record<LanguageCode, string> = {
    'ca-ES': '🇪🇸', // Catalan
    'en-US': '🇺🇸', // English (USA)
    'en-GB': '🇬🇧', // English (UK)
    'fr-FR': '🇫🇷', // French
    'es-MX': '🇲🇽', // Spanish (Mexico)
    'es-ES': '🇪🇸', // Spanish (Spain)
    'pt-PT': '🇵🇹', // Portuguese (Portugal)
    'pt-BR': '🇧🇷', // Portuguese (Brazil)
    'de-AT': '🇦🇹', // German (Austria)
    'de-DE': '🇩🇪', // German (Germany)
  };
  
  return flagMap[code] || '🌐';
}