import { getGallery, getContactSettings } from "@/src/shared/api/public";
import { getTranslations } from "next-intl/server";
import { GalleryClient } from "./gallery-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: `${t('gallery')} | Al-Tayyar Leather`,
    description: locale === "ar" ? "معرض صور الجلود الطبيعية الفاخرة للبيع." : "Gallery of premium natural leathers for sale."
  };
}

export default async function GalleryPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const gallery = await getGallery(locale);
  const contactSettings = await getContactSettings(locale);
  let whatsappNumber = contactSettings?.whatsappNumber || "+905551234567";

  // Clean WhatsApp number
  if (whatsappNumber) {
    whatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
  }

  const translations = {
    title: locale === "ar" ? "معرض الجلود والأعمال" : "Leather Gallery",
    subtitle: locale === "ar" 
      ? "تصفح كتالوج الصور للتعرف على تشكيلتنا المميزة والفخمة من أفخر خامات الجلد النقي والموديلات الحصرية." 
      : "Browse the photo catalog to explore our distinctive, luxurious collection of pure leather materials and exclusive models.",
    share: locale === "ar" ? "استفسار وطلب الصورة" : "Inquire via WhatsApp"
  };

  return (
    <main className="flex-1 w-full bg-background min-h-screen">
      <GalleryClient
        images={gallery}
        locale={locale}
        translations={translations}
        whatsappNumber={whatsappNumber}
      />
    </main>
  );
}