import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLanguage, LANGUAGES, type LanguageCode } from '@/hooks/use-language';
import { ChevronDown } from 'lucide-react';

export default function LanguageDropdown() {
  const { currentLanguage, changeLanguage, getLanguageByCode } = useLanguage();
  const currentLanguageDetails = getLanguageByCode(currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 font-medium">
          {currentLanguageDetails?.nativeName.split(' ')[0]}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`cursor-pointer ${currentLanguage === language.code ? 'bg-primary/10 font-medium' : ''}`}
            onClick={() => changeLanguage(language.code)}
          >
            <span className="mr-2">{getFlagEmoji(language.code)}</span>
            {language.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get flag emoji based on language code
function getFlagEmoji(languageCode: LanguageCode): string {
  const countryCode = languageCode.split('-')[1];
  
  // Convert country code to flag emoji (Unicode regional indicator symbols)
  if (countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  
  return '';
}