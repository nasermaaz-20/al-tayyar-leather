"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer({ contactSettings }: { contactSettings?: any }) {
  const locale = useLocale();

  const phoneDisplay = contactSettings?.whatsappNumber || "+90 555 123 4567";
  const phoneClean = phoneDisplay.replace(/[^0-9]/g, '');
  
  // Use generic fallback if not provided from dashboard, otherwise prioritize the dashboard's localized values
  const addressFallbackAr = "شارع الجلود الرئيسي، المنطقة الصناعية، اسطنبول";
  const addressFallbackEn = "Main Leather St, Industrial Area, Istanbul";
  const address = locale === "ar" 
    ? (contactSettings?.addressAr ? contactSettings.addressAr : addressFallbackAr)
    : (contactSettings?.addressEn ? contactSettings.addressEn : addressFallbackEn);
    
  const rawTiktokUrl = contactSettings?.tiktokUrl || "";
  const tiktokUrl = rawTiktokUrl.startsWith("http") 
    ? rawTiktokUrl 
    : (rawTiktokUrl.startsWith("@") ? `https://tiktok.com/${rawTiktokUrl}` : (rawTiktokUrl ? `https://tiktok.com/@${rawTiktokUrl}` : "#"));
    
  const facebookUrl = contactSettings?.facebookUrl || "#";
  const instagramUrl = contactSettings?.instagramUrl || "#";
  const emailAddress = contactSettings?.email || "info@altayyar.com";

  return (
    <footer className="bg-card border-t border-black/10 dark:border-white/10 relative z-20 mt-auto overflow-hidden">
      <div className="absolute inset-0 bg-[#FAE7CD] dark:bg-background pointer-events-none" />
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href={`/${locale}`} className="inline-block transition-transform hover:scale-105">
              <h3 className="text-3xl font-serif font-bold text-foreground flex items-center gap-2">
                <span className=" text-4xl">Al-Tayyar</span>
              </h3>
            </Link>
            <p className="text-foreground/70 leading-relaxed font-medium max-w-sm">
              {locale === "ar" 
                ? "الطيار، وجهتك الأولى للجلود الطبيعية الخام وأفخم الموديلات الحصرية التي تلبي كافة الأذواق." 
                : "Al-Tayyar, your premier destination for premium raw leather and the most lavish exclusive models."}
            </p>
            <div className="flex gap-4 mt-2">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-green-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-green-500/20">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-foreground hover:text-background transition-all hover:scale-110 hover:shadow-lg hover:shadow-foreground/20">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold font-serif mb-6 text-foreground relative inline-block pb-3 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-1 after:w-12 after:bg-primary after:rounded-full">
              {locale === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href={`/${locale}`} className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  {locale === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products`} className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  {locale === "ar" ? "منتجاتنا" : "Products"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/gallery`} className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  {locale === "ar" ? "معرض الصور" : "Gallery"}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-foreground/70 hover:text-primary transition-colors font-medium">
                  {locale === "ar" ? "اتصل بنا" : "Contact Us"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold font-serif mb-6 text-foreground relative inline-block pb-3 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-1 after:w-12 after:bg-primary after:rounded-full">
              {locale === "ar" ? "معلومات التواصل" : "Contact Info"}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-foreground/70 hover:text-primary transition-colors group">
                <div className="w-8 h-8 mt-1 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
                  <MapPin size={16} />
                </div>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium leading-relaxed block hover:underline"
                >
                  {address}
                </a>
              </li>
              <li className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
                  <Phone size={16} />
                </div>
                <a href={`https://wa.me/${phoneClean}`} target="_blank" rel="noopener noreferrer" className="font-medium tracking-wide" dir="ltr">{phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
                  <Mail size={16} />
                </div>
                <a href={`mailto:${emailAddress}`} className="font-medium">{emailAddress}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/50 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 w-full">
          <p className="text-foreground/60 text-sm font-medium">
            &copy; {new Date().getFullYear()} Al-Tayyar. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="text-foreground/60 text-sm flex gap-4 font-medium">
            <Link href="#" className="hover:text-primary transition-colors">{locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
            <Link href="#" className="hover:text-primary transition-colors">{locale === "ar" ? "الشروط والأحكام" : "Terms of Service"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}