"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/src/shared/ui/theme-toggle";
import { LanguageSwitcher } from "@/src/shared/ui/language-switcher";
import { Menu, X } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.includes("/admin")) {
    return null;
  }

  const navLinks = [
    { name: t("home"), href: `/${locale}` },
    { name: t("products"), href: `/${locale}/products` },
    { name: t("gallery"), href: `/${locale}/gallery` },
    { name: t("contact"), href: `/${locale}/contact` },
  ];

  // Detect Home-top state
  const isHome = pathname === `/${locale}`;
  const isHomeTop = isHome && !scrolled;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          !isHomeTop
            ? "bg-background/90 dark:bg-card/70 backdrop-blur-xl border-b border-border py-4 shadow-sm"
            : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center lux-container">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className={cn(
              "flex items-center justify-center font-bold text-xl tracking-wider uppercase",
              isHomeTop ? "text-[#F5E6D3] dark:text-gold" : "text-primary dark:text-gold"
            )}
          >
            <span className="font-serif">Al-Tayyar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = link.href === `/${locale}` 
                  ? pathname === link.href 
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "transition-all duration-300 pb-1",
                        // Active link changes for Home-top in light mode
                        isActive
                          ? isHomeTop
                            ? "text-[#F5E6D3] dark:text-gold font-bold border-b-2 border-[#F5E6D3] dark:border-gold"
                            : "text-primary dark:text-gold font-bold border-b-2 border-primary dark:border-gold"
                          // Inactive links get specific logic on Home-top only in light mode, otherwise keep existing logic
                          : isHomeTop
                          ? "text-[#F5E6D3]/90  hover:text-[#F5E6D3] dark:text-gold dark:hover:text-gold"
                          : "text-foreground/70 hover:text-primary dark:hover:text-gold"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className={cn("h-6 w-px hidden md:block transition-colors duration-300", isHomeTop ? "bg-[#F5E6D3]/40 dark:bg-border" : "bg-border")} />

            <div className="flex items-center gap-3">
              <LanguageSwitcher isHomeTop={isHomeTop} />
              <ThemeToggle isHomeTop={isHomeTop} />
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
             <div className="flex items-center gap-2">
              <LanguageSwitcher isHomeTop={isHomeTop} />
              <ThemeToggle isHomeTop={isHomeTop} />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn("p-2", isHomeTop ? "text-[#F5E6D3] dark:text-foreground" : "text-foreground")}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border pt-24 pb-8 px-6 shadow-2xl md:hidden overflow-hidden"
          >
            <ul className="flex flex-col gap-6 text-center text-lg font-medium">
              {navLinks.map((link) => {
                const isActive = link.href === `/${locale}` 
                  ? pathname === link.href 
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);

                return (
                  <motion.li
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={link.href}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "block transition-all duration-300 py-2 mx-4 border-b-2",
                        isActive 
                          ? "text-primary dark:text-gold font-bold border-primary dark:border-gold" 
                          : "text-foreground/70 border-transparent hover:text-primary dark:hover:text-gold"
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
