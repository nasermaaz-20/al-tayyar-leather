import { getProductBySlug, getContactSettings } from "@/src/shared/api/public";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: any) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  try {
    const product: any = await getProductBySlug(slug, locale);
    if (!product) return { title: "Product Not Found" };
    const name = locale === "ar" ? product.nameAr || product.name : product.nameEn || product.name;
    const desc = locale === "ar" ? product.descAr || product.description : product.descEn || product.description;
    
    return { 
      title: `${name} | Al-Tayyar Leather`, 
      description: desc 
    };
  } catch (error) {
    return { title: "Product Not Found" };
  }
}

export default async function ProductDetailPage(props: any) {
  const params = await props.params;

  const {
    locale,
    slug
  } = params;

  try {
    const [product, settings] = await Promise.all([
      getProductBySlug(slug, locale),
      getContactSettings()
    ]);

    if (!product) {
      return notFound();
    }

    return (
      <ProductDetailClient 
        product={product} 
        locale={locale} 
        whatsappNumber={settings?.whatsappNumber || ""} 
      />
    );
  } catch (error) {
    return notFound();
  }
}