"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/shared/utils/cn";

export function ThemeToggle({ isHomeTop }: { isHomeTop?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-full border transition-colors",
        isHomeTop
          ? "border-[#F5E6D3]/40 hover:bg-[#F5E6D3]/10 text-[#F5E6D3] dark:border-white/10 dark:hover:bg-white/10 dark:text-foreground"
          : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-foreground"
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-gold" />
      ) : (
        <Moon className={cn("w-5 h-5", isHomeTop ? "text-[#F5E6D3]" : "text-primary")} />
      )}
    </motion.button>
  );
}
