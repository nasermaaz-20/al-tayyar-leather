"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function Home() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="flex-1 w-full pt-0 mt-0 relative">
      <section
        ref={heroRef}
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background"
      >
        {/* Parallax Background */}
        <motion.div 
          style={{ 
            y: yBg,
            backgroundImage: "url('/img/11.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-10 transition-colors duration-300" />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: opacityText }}
          className="relative z-20 lux-container flex flex-col items-center justify-center text-center pt-24"
        >
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 1.5, ease: "easeOut" }}
  className="-mt-36 w-60 h-60 sm:w-72 sm:h-72 mx-auto rounded-full mix-blend-normal bg-gradient-to-br from-gold/50 to-primary/50 backdrop-blur-md p-1  flex items-center justify-center bg-transparent backdrop-blur-none "
>
  <div className="w-full h-full rounded-full  flex items-center justify-center ">
    {/* استبدال النص بالصورة هنا */}
    <img 
      src="/img/logo1.png" 
      alt="Logo" 
      className="w-full h-full object-cover shadow-none drop-shadow-none" // استخدم object-contain إذا كنت لا تريد قص الصورة
    />
  </div>
</motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-serif tracking-tight text-[#F5E6D3] dark:text-foreground  dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          >
            {locale === "ar" ? "أفخم أنواع الجلود الأصيلة" : "Premium Genuine Leather"}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg md:text-1xl text-[#F5E6D3] dark:text-foreground font-medium max-w-3xl mb-12 leading-relaxed transition-colors duration-300  dark:drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
          >
            {locale === "ar" 
              ? "مؤسسة طيار تقدم لكم أجود خامات الجلود الخالصة للبيع، بألوان متعددة وتفاصيل فاخرة تلبي كافة احتياجاتكم." 
              : "Al‑Tayyar sells premium pure leather in multiple colors with luxurious details."}
          </motion.p>


        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.5, duration: 1 }}
           className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <span className="text-xs font-bold text-[#F5E6D3] dark:text-foreground tracking-[0.3em] uppercase drop-shadow-md">Scroll</span>
          <div className="w-[1px] h-16 bg-border relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 64, 64] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-gold"
            />
          </div>
        </motion.div>

      </section>

      {/* Features Section */}
      <section className="py-32 relative z-20 lux-section">
        <div className="absolute inset-0 bg-background" />
        <div className="lux-container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif text-foreground drop-shadow-sm">
              {locale === "ar" ? "فن الجلد الأصيل" : "The Art of Pure Leather"}
            </h2>
            <div className="lux-divider w-32 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl font-medium text-foreground/60 leading-relaxed">
              {locale === "ar" ? "نحن نختص بتقديم الجلد الخام الفاخر فقط، مقدماً بألوان وموديلات حصرية تلبي أرقى الأذواق." : "We specialize solely in raw luxury leather, provided in exclusive models and colors to match your exquisite taste."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gallery Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <Link href={`/${locale}/gallery`} className="block group relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />
                <img 
                  src="/img/1.png" 
                  alt="Gallery" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl md:text-4xl font-bold font-serif text-[#F5E6D3] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {locale === "ar" ? "معرض الصور" : "Image Gallery"}
                  </h3>
                  <p className="text-[#F5E6D3] mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {locale === "ar" ? "اكتشف تفاصيل الجلود الفاخرة وتصاميمها الحصرية." : "Discover the details of luxury leathers and their exclusive designs."}
                  </p>
                  <div className="flex items-center gap-3 text-[#D7AD6F] font-bold drop-shadow-md">
                    <span>{locale === "ar" ? "استعرض الآن" : "Explore Now"}</span>
                    {locale === "ar" ? <ArrowRight className="w-5 h-5 -rotate-180 group-hover:-translate-x-2 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Products Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href={`/${locale}/products`} className="block group relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />
                <img 
                  src="/img/111.png" 
                  alt="Products" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl md:text-4xl font-bold font-serif text-[#F5E6D3] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {locale === "ar" ? "منتجاتنا" : "Our Products"}
                  </h3>
                  <p className="text-[#F5E6D3] mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {locale === "ar" ? "تصفح أحدث التشكيلات والألوان المتوفرة للبيع." : "Browse the latest collections and colors available for sale."}
                  </p>
                  <div className="flex items-center gap-3 text-[#D7AD6F] font-bold drop-shadow-md">
                    <span>{locale === "ar" ? "تصفح الجلود" : "Browse Leathers"}</span>
                    {locale === "ar" ? <ArrowRight className="w-5 h-5 -rotate-180 group-hover:-translate-x-2 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />}
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
