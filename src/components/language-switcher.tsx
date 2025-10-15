'use client';

import { useLanguage } from "@/components/language-provider";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleLanguage}>
        <Globe className="h-5 w-5" />
    </Button>
  );
}
