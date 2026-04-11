import { getProductsBilingual, getCategoriesBilingual, getColorsBilingual } from "@/src/shared/api/public";
import { getTranslations } from "next-intl/server";
import { ProductsGridClient } from "./products-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: `${t('products')} | Al-Tayyar Leather`,
    description: locale === "ar" ? "تصفح أفخم ألوان وأنواع الجلود الجاهزة للبيع" : "Browse our premium leather collections."
  };
}

export default async function ProductsPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const [products, categories, colors] = await Promise.all([
    getProductsBilingual(),
    getCategoriesBilingual(),
    getColorsBilingual(),
  ]);

  const translations = {
    filters: locale === "ar" ? "التصفية" : "Filters",
    categories: locale === "ar" ? "الأقسام" : "Categories",
    colors: locale === "ar" ? "الألوان" : "Colors",
    all: locale === "ar" ? "الكل" : "All",
    allShort: locale === "ar" ? "الكل" : "All",
    search: locale === "ar" ? "ابحث عن الجلود..." : "Search leathers...",
    clearFilters: locale === "ar" ? "مسح جميع الفلاتر" : "Clear all filters"
  };

  return (
    <main className="flex-1 w-full bg-background min-h-screen">
      <ProductsGridClient
        initialProducts={products}
        categories={categories}
        colors={colors}
        locale={locale}
        translations={translations}
      />
    </main>
  );
}