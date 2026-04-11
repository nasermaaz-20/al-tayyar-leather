"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Share2, Check } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export function ProductDetailClient({ product, locale, whatsappNumber }: any) {
  const t = useTranslations("product");
  const name = locale === "ar" ? product.nameAr || product.name : product.nameEn || product.name;
  const desc = locale === "ar" ? product.descAr || product.description : product.descEn || product.description;
  const [activeImage, setActiveImage] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const images = product.images?.length > 0 ? product.images : [{ url: "/placeholder-leather.png", alt: "Leather" }];

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const whatsappMessage = locale === "ar" 
    ? `مرحباً، أود الاستفسار عن هذا الجلد: ${name}\nالرابط: ${currentUrl}`
    : `Hello, I'm interested in this leather: ${name}\nLink: ${currentUrl}`;

  const cleanNumber = whatsappNumber ? whatsappNumber.replace(/\D/g, '') : '';
  const whatsappLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="lux-container">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-foreground/50 mb-8 font-medium">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/products`} className="hover:text-primary transition-colors">
            {locale === "ar" ? "المنتجات" : "Products"}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Gallery Section */}
          <div className="flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 shadow-xl"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[activeImage].url}
                    alt={images[activeImage].alt || name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover cursor-zoom-in hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300",
                      activeImage === idx ? "border-primary opacity-100 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={img.url} alt={img.alt || "Thumb"} fill sizes="(max-width: 768px) 96px, 96px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <div className="flex justify-between items-start gap-6">
                <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
                  {name}
                </h1>
                <button 
                  onClick={copyLink}
                  className="p-3 bg-card border border-border rounded-full hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all group shrink-0"
                  aria-label="Share"
                >
                  {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>
              
              {product.price && (
                <div className="mt-4 text-2xl font-mono font-bold text-primary dark:text-gold border-b border-border/50 pb-6">
                  ${parseFloat(product.price).toFixed(2)}
                </div>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none text-foreground/70 mb-10 leading-relaxed">
              <p className="whitespace-pre-line text-lg">{desc}</p>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold tracking-widest uppercase text-foreground/50 mb-4">
                  {t('colors', { fallback: locale === "ar" ? "الألوان المتاحة" : "Available Colors" })}
                </h3>
                <div className="flex flex-wrap gap-4">
                   {product.colors.map((color: any) => (
                    <div 
                      key={color.id} 
                      className="group relative flex items-center justify-center"
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-border shadow-md hover:scale-110 transition-transform cursor-help"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold py-1 px-3 rounded-md pointer-events-none whitespace-nowrap z-10">
                        {locale === "ar" ? color.nameAr || color.name : color.nameEn || color.name}
                      </div>
                    </div>
                   ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {product.categories?.length > 0 && (
               <div className="mb-12">
                 <h3 className="text-sm font-bold tracking-widest uppercase text-foreground/50 mb-4">
                   {t('categories', { fallback: locale === "ar" ? "الأقسام" : "Categories" })}
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {product.categories.map((cat: any) => (
                     <Link 
                        key={cat.id} 
                        href={`/${locale}/products`}
                        className="px-4 py-2 border border-border rounded-full text-sm font-medium text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                      >
                       {locale === "ar" ? cat.nameAr || cat.name : cat.nameEn || cat.name}
                     </Link>
                   ))}
                 </div>
               </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto pt-8 border-t border-border/50">
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-5 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] shadow-lg shadow-green-500/20"
              >
                {/* SVG WhatsApp Icon */}
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                {locale === "ar" ? "الطلب عبر واتساب" : "Order via WhatsApp"}
              </a>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}