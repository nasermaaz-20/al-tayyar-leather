"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ProductCard } from "@/src/features/products/components/product-card";
import { Search, SlidersHorizontal, X } from "lucide-react";

export function ProductsGridClient({ 
  initialProducts, 
  categories, 
  colors,
  locale,
  translations
}: any) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(12);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Real-time client-side filter for luxurious instant feel (since data is small enough)
  useEffect(() => {
    let filtered = initialProducts;
    
    if (query) {
      filtered = filtered.filter((p: any) => {
        const titleAr = String(p.nameAr || "").toLowerCase();
        const titleEn = String(p.nameEn || "").toLowerCase();
        const descAr = String(p.descAr || "").toLowerCase();
        const descEn = String(p.descEn || "").toLowerCase();
        const q = query.toLowerCase();
        
        return titleAr.includes(q) || titleEn.includes(q) || descAr.includes(q) || descEn.includes(q);
      });
    }

    if (selectedCategory) {
      filtered = filtered.filter((p: any) => 
        p.categories?.some((catWrapper: any) => catWrapper.categoryId === selectedCategory || catWrapper.category?.slug === selectedCategory || catWrapper.id === selectedCategory)
      );
    }

    if (selectedColor) {
      filtered = filtered.filter((p: any) => 
        p.colors?.some((colorWrapper: any) => colorWrapper.colorId === selectedColor || colorWrapper.color?.id === selectedColor || colorWrapper.id === selectedColor)
      );
    }

    setProducts(filtered);
    setCurrentPage(1); // Reset page on filter change
  }, [query, selectedCategory, selectedColor, initialProducts]);

  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(products.length / itemsPerPage);
  const displayedProducts = itemsPerPage === 'all' 
    ? products 
    : products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="lux-container py-12 md:py-24 pt-32 mt-5 bg-background">


      {/* Mobile Header Toggle */}
      <div className="md:hidden flex flex-col mb-6 gap-4">
        <h2 className="text-3xl font-serif font-bold text-foreground text-start">
          {locale === "ar" ? "التصفية" : "Filters"}
        </h2>
        <div className="flex justify-between items-center w-full">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-sm font-bold text-sm"
          >
            <SlidersHorizontal size={16} />
            {translations.filters || "Filters"}
          </button>
          
          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
            {[12, 24, 'all'].map(num => (
              <button
                key={num}
                onClick={() => { setItemsPerPage(num as any); setCurrentPage(1); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  itemsPerPage === num 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {num === 'all' ? (locale === "ar" ? "الكل" : "All") : num}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 md:hidden" onClick={() => setIsMobileFiltersOpen(false)}></div>
      )}

      <div className="flex flex-col md:flex-row gap-12 w-full max-w-7xl mx-auto">
        
        {/* Sidebar Filters */}
        <aside className={`fixed inset-y-0 ${locale === "ar" ? "right-0" : "left-0"} z-[110] w-[80vw] max-w-[320px] bg-card p-6 shadow-2xl transition-transform duration-300 md:relative md:inset-auto md:w-64 md:translate-x-0 md:bg-transparent md:p-0 md:shadow-none md:z-0 shrink-0 flex flex-col gap-8 ${
          isMobileFiltersOpen ? "translate-x-0" : (locale === "ar" ? "translate-x-full" : "-translate-x-full")
        }`}>
          <div className="flex items-center justify-between md:hidden mb-4">
            <h2 className="text-xl font-bold font-serif text-foreground">
              {translations.filters || "Filters"}
            </h2>
            <div className="flex items-center gap-3">
              {(query || selectedCategory || selectedColor) && (
                <button 
                  onClick={() => { setQuery(""); setSelectedCategory(null); setSelectedColor(null); }}
                  className="text-xs font-bold text-primary underline underline-offset-2"
                >
                  {translations.clearFilters || (locale === "ar" ? "مسح الكل" : "Clear")}
                </button>
              )}
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-foreground/60 hover:text-foreground bg-muted/50 rounded-full">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="sticky top-32 overflow-y-auto max-h-[85vh] md:max-h-[calc(100vh-8rem)] pb-10 custom-scrollbar pr-2">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif text-foreground">
                {translations.filters || "Filters"}
              </h2>
              {(query || selectedCategory || selectedColor) && (
                <button 
                  onClick={() => { setQuery(""); setSelectedCategory(null); setSelectedColor(null); }}
                  className="text-sm font-bold text-primary hover:text-primary/70 underline underline-offset-4 transition-colors"
                >
                  {translations.clearFilters || (locale === "ar" ? "مسح الكل" : "Clear all")}
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="relative mb-8 text-foreground group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={translations.search || "Search leathers..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium placeholder:text-foreground/30 shadow-sm"
              />
            </div>
            {/* Colors */}
            <div>
              <h3 className="text-sm tracking-widest uppercase font-bold text-foreground/50 mb-4">
                {translations.colors || "Colors"}
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                   onClick={() => setSelectedColor(null)}
                   className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all mb-6 ${
                     !selectedColor ? "border-primary text-primary" : "border-border text-foreground/40 hover:border-foreground/30"
                   }`}
                >
                  {translations.allShort || "All"}
                </button>
                {colors.map((color: any) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform ${
                      selectedColor === color.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border border-border/50"
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                    title={locale === "ar" ? color.nameAr : color.nameEn}
                    aria-label={locale === "ar" ? color.nameAr : color.nameEn}
                  />
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-sm tracking-widest uppercase font-bold text-foreground/50 mb-4">
                {translations.categories || "Categories"}
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-start px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !selectedCategory ? "bg-primary text-white shadow-md relative overflow-hidden" : "hover:bg-card text-foreground/70"
                  }`}
                >
                  {translations.all || "All"}
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-start px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.id ? "bg-primary text-white shadow-md" : "hover:bg-card text-foreground/70"
                    }`}
                  >
                    {locale === "ar" ? cat.nameAr || cat.name : cat.nameEn || cat.name}
                  </button>
                ))}
              </div>
            </div>


            
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 w-full min-h-[60vh]">
          {/* Desktop Filter Header Area */}
          <div className="hidden md:flex justify-between items-end mb-8 border-b border-border/50 pb-6">
             <div>
                <h2 className="text-3xl font-serif font-bold text-foreground leading-tight">
                  {locale === "ar" ? "التصفية" : "Filters"}
                </h2>
                <p className="text-foreground/60 mt-2">
                  {products.length} {locale === "ar" ? "نوع متاح" : "Types available"}
                </p>
             </div>
             
             {/* Pagination Buttons */}
             <div className="flex gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/50">
               <span className="self-center px-2 text-sm text-foreground/50 font-medium hidden lg:inline-block">
                 {locale === "ar" ? "عرض:" : "Display:"}
               </span>
               {[12, 24, 'all'].map(num => (
                 <button
                   key={num}
                   onClick={() => { setItemsPerPage(num as any); setCurrentPage(1); }}
                   className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                     itemsPerPage === num 
                       ? "bg-primary text-white shadow-sm" 
                       : "text-foreground/70 hover:text-gold hover:bg-card hover:shadow-sm"
                   }`}
                 >
                   {num === 'all' ? (locale === "ar" ? "الكل" : "All") : num}
                 </button>
               ))}
             </div>
          </div>
                 <p className="block md:hidden text-foreground/60 font-medium text-sm text-start border-t border-border/50 pt-2 pb-4">
          {products.length} {locale === "ar" ? "نوع متاح" : "Types available"}
        </p> 
          {/* Mobile Display Count & Pagination (Moved to Header Toggle) */}

          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
          >
            
            {displayedProducts.map((product: any, i: number) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                key={product.id}
              >
                <ProductCard product={product} locale={locale} />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {itemsPerPage !== 'all' && totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-16 mb-8" dir="ltr">
               <button 
                 onClick={() => {
                   setCurrentPage(p => Math.max(1, p - 1));
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
                 disabled={currentPage === 1}
                 className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-border/50 text-foreground/70 hover:bg-card hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={locale === "ar" ? "rotate-180" : ""}><path d="m15 18-6-6 6-6"/></svg>
               </button>
               
               {getVisiblePages().map((pageNum) => (
                 <button
                   key={pageNum}
                   onClick={() => {
                     setCurrentPage(pageNum);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                   }}
                   className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                     currentPage === pageNum 
                       ? "bg-primary text-white  shadow-md scale-110" 
                       : "border border-border/50 text-foreground/70 hover:bg-card hover:text-gold"
                   }`}
                 >
                   {pageNum}
                 </button>
               ))}

               <button 
                 onClick={() => {
                   setCurrentPage(p => Math.min(totalPages, p + 1));
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
                 disabled={currentPage === totalPages}
                 className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-border/50 text-foreground/70 hover:bg-card hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={locale === "ar" ? "rotate-180" : ""}><path d="m9 18 6-6-6-6"/></svg>
               </button>
            </div>
          )}

          {products.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col items-center justify-center py-32 text-foreground/40"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-card border border-border flex items-center justify-center">
                 <Search className="w-10 h-10 text-border" />
              </div>
              <p className="text-xl font-serif">
                {locale === "ar" ? "لم يتم العثور على جلود مطابقة" : "No leathers matched your criteria"}
              </p>
              <button 
                onClick={() => { setQuery(""); setSelectedCategory(null); setSelectedColor(null); }}
                className="mt-6 text-primary hover:text-primary/70 font-medium underline underline-offset-4"
              >
                {translations.clearFilters || "Clear all filters"}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}