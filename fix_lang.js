const fs = require('fs');
const content = "use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";

export function LanguageSwitcher({ isHomeTop }: { isHomeTop?: boolean }) {      
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    // Replace the locale in the URL path
    const pathWithoutLocale = pathname.replace(\/\\, "");
    const newPath = \/\\\;

    // Set NEXT_LOCALE cookie to persist choice
    document.cookie = \NEXT_LOCALE=\; path=/; max-age=31536000; SameSite=Lax\;

    router.replace(newPath);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={switchLocale}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-full border transition-colors font-medium text-sm",
        isHomeTop
          ? "border-[#F5E6D3]/40 text-[#F5E6D3] hover:bg-[#F5E6D3]/10 dark:border-white/10 dark:text-foreground dark:hover:bg-white/10"
          : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-foreground"
      )}
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span className="font-bold">{locale === "ar" ? "EN" : "ÚÑÈí"}</span>  
    </motion.button>
  );
}
;
fs.writeFileSync('src/shared/ui/language-switcher.tsx', content, 'utf8');
console.log('Fixed');
