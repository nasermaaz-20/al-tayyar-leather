"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export function GalleryClient({ images, locale, translations, whatsappNumber }: any) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [imagesPerPage, setImagesPerPage] = useState<number | "all">(12);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleImagesPerPageChange = (val: number | "all") => {
    setImagesPerPage(val);
    if (val === "all") {
      setVisibleCount(images.length);
    } else {
      setVisibleCount(val);
    }
  };

  const handleLoadMore = () => {
    if (typeof imagesPerPage === "number") {
      setVisibleCount(prev => prev + imagesPerPage);
    }
  };

  const handleZoomToggle = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (!isZoomed) {
      // Calculate exact click position for zoom origin
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin(`${x}% ${y}%`);
      setIsZoomed(true);
    } else {
      setIsZoomed(false);
      // Reset zoom origin after transition
      setTimeout(() => setZoomOrigin("center center"), 300);
    }
  };

  const visibleImages = images.slice(0, visibleCount);

  const getGridSpan = (index: number) => {
    // Elegant asymmetric visual layout
    const pattern = index % 10;
    if (pattern === 0 || pattern === 6) {
      return "sm:col-span-2 sm:row-span-2";
    }
    if (pattern === 3) {
      return "sm:col-span-2 sm:row-span-1";
    }
    return "sm:col-span-1 sm:row-span-1";
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
      } else if (e.key === 'Escape') {
        setSelectedIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  const handleShare = (e: React.MouseEvent, img: any) => {
    e.stopPropagation();
    
    // Create WhatsApp message
    const currentUrl = window.location.href;
    let message = "";
    
    if (locale === "ar") {
      message = `مرحباً، أود الاستفسار عن هذه الصورة من معرض الأعمال الخاص بكم.%0A%0Aالصورة: ${img.url}%0A%0Aرابط المعرض: ${currentUrl}`;
    } else {
      message = `Hello, I would like to inquire about this image from your gallery.%0A%0AImage: ${img.url}%0A%0AGallery Link: ${currentUrl}`;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="lux-container text-center mb-16">
         <motion.h1 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4"
         >
           {translations.title}
         </motion.h1>
         <div className="lux-divider w-24 mx-auto mb-6"></div>
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-foreground/60 max-w-2xl mx-auto text-lg mb-8"
         >
           {translations.subtitle}
         </motion.p>
         
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="flex justify-center items-center gap-4"
         >
           <label className="text-foreground/70 font-medium">
             {locale === "ar" ? "عدد الصور المعروضة:" : "Images per page:"}
           </label>
           <select 
             className="bg-card border border-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[#F5E6D3]/50 cursor-pointer shadow-sm transition-all"
             value={imagesPerPage}
             onChange={(e) => handleImagesPerPageChange(e.target.value === "all" ? "all" : Number(e.target.value))}
           >
             <option value={12}>12</option>
             <option value={24}>24</option>
             <option value="all">{locale === "ar" ? "الكل" : "All"}</option>
           </select>
         </motion.div>
      </div>

      <div className="lux-container">
        {images.length > 0 ? (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px] md:auto-rows-[300px] grid-flow-dense">
              <AnimatePresence>
                {visibleImages.map((img: any, i: number) => {
                  const id = img.id || String(i);
                  const isLoaded = loadedImages[id];
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: (i % 12) * 0.05 }}
                      key={id}
                      className={cn(
                        "relative group rounded-[var(--radius)] overflow-hidden bg-[#F5E6D3]/10 dark:bg-[#3D2C23]/20 border border-border/50 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-[#F5E6D3]/20 dark:hover:shadow-[#F5E6D3]/5 transition-all duration-300",
                        getGridSpan(i)
                      )}
                      onClick={() => setSelectedIndex(i)}
                    >
                      {/* Skeleton Placeholder */}
                      <div 
                        className={cn(
                          "absolute inset-0 bg-[#F5E6D3]/40 dark:bg-card animate-pulse transition-opacity duration-500 z-0",
                          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
                        )} 
                      />

                      {/* Actual Image */}
                      <img 
                        src={img.url} 
                        alt={img.alt || "Gallery Leather"} 
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-[1.03] z-10 relative",
                          isLoaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => handleImageLoad(id)}
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20 pointer-events-none">
                        <ZoomIn className="w-10 h-10 text-white/90 drop-shadow-md" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button */}
            {visibleCount < images.length && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-16 flex justify-center"
              >
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-full bg-[#F5E6D3] hover:bg-[#E5D6C3] text-foreground font-serif font-bold text-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 dark:bg-[length:200%] dark:bg-gold dark:text-background"
                >
                  {locale === "ar" ? "عرض المزيد" : "Load More"}
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-foreground/50 font-serif text-xl">
             {locale === "ar" ? "لا توجد صور في المعرض حالياً" : "No images in the gallery yet."}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-10"
          >
            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && !isZoomed && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
                  }}
                  className="absolute left-4 sm:left-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
                  }}
                  className="absolute right-4 sm:right-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-[110]"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative flex flex-col items-center justify-center w-full h-full max-h-[85vh] group ${
                isZoomed ? "max-w-none px-4" : "max-w-5xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
               <div 
                 className={`relative flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300 ${
                   isZoomed 
                     ? "w-[95vw] h-[95vh] cursor-zoom-out" 
                     : "w-full h-full cursor-zoom-in"
                 }`}
                 onClick={() => setIsZoomed(false)}
               >
                 <img 
                   src={selectedImage.url} 
                   alt={selectedImage.alt || "Zoomed Leather"} 
                   style={{ transformOrigin: zoomOrigin }}
                   onClick={handleZoomToggle}
                   className={`object-contain rounded-xl shadow-2xl transition-transform duration-500 ease-out ${
                     isZoomed 
                       ? "w-max h-max max-w-none max-h-none scale-[2.5]" 
                       : "w-auto h-auto max-w-full max-h-[80vh] hover:scale-[1.03]"
                   }`}
                 />
               </div>
               
               {/* Share to WhatsApp Button inside the lightbox (hide when zoomed so it doesn't block view) */}
               {!isZoomed && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="absolute bottom-[-10px] md:bottom-10"
                 >
                   <button
                     onClick={(e) => handleShare(e, selectedImage)}
                     className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
                     {translations.share}
                   </button>
                 </motion.div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}