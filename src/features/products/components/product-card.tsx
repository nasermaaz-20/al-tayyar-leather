"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

interface ProductCardProps {
  product: any;
  locale: string;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  // Extract correct fields based on locale logic (assuming the API already merged bilingual fields into the product or we use the root ones)
  const name = locale === "ar" ? product.nameAr || product.name : product.nameEn || product.name;
  const desc = locale === "ar" ? product.descAr || product.description : product.descEn || product.description;
  const mainImage = product.images?.[0]?.url || "/placeholder-leather.png";
  
  // 3D Tilt Effect Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Link href={`/${locale}/products/${product.slug}`} className="block group perspective-1000">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex flex-col w-full h-[450px] overflow-hidden rounded-[var(--radius)] lux-card border border-border/50 bg-card p-1 shadow-lg"
      >
        {/* Image Container with inner 3D translate */}
        <motion.div 
          className="relative w-full h-[65%] rounded-xl overflow-hidden bg-muted"
          style={{ translateZ: "40px" }}
        >
          <Image
            src={mainImage}
            alt={name || "Leather Product"}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <span className="text-white text-sm font-medium tracking-wider uppercase border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm bg-black/30">
                {locale === "ar" ? "استعرض التفاصيل" : "View Details"}
              </span>
            </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          className="flex flex-col flex-1 p-5 justify-between"
          style={{ translateZ: "20px" }}
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-serif text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {name}
              </h3>
              {product.price && (
                 <span className="font-mono font-bold text-primary dark:text-gold shrink-0">
                   ${parseFloat(product.price).toFixed(2)}
                 </span>
              )}
            </div>
            <p className="text-sm text-foreground/60 line-clamp-2">
              {desc}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4 pb-1">
             {/* Available Colors Dots */}
             <div className="flex items-center -space-x-2 rtl:space-x-reverse shrink-0">
               {product.colors?.slice(0, 4).map((color: any) => (
                 <div
                   key={color.id}
                   className="w-5 h-5 rounded-full border-2 border-card shadow-sm"
                   style={{ backgroundColor: color.hexCode }}
                   title={locale === "ar" ? color.nameAr : color.nameEn}
                 />
               ))}
               {product.colors?.length > 4 && (
                 <div className="w-5 h-5 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-foreground/50">
                    +{product.colors.length - 4}
                 </div>
               )}
             </div>

             <div className="text-primary dark:text-gold rounded-full p-2 bg-primary/5 group-hover:bg-primary/10 transition-colors">
               {locale === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
             </div>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
