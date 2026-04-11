import { getContactSettings } from "@/src/shared/api/public";
import { getTranslations } from "next-intl/server";
import { ContactClient } from "./contact-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: `${t('contact')} | Al-Tayyar Leather`,
    description: locale === "ar" ? "تواصل مع مؤسسة طيار للجلود عبر واتساب أو تفضل بزيارتنا." : "Contact Al-Tayyar Leather via WhatsApp or visit us."
  };
}

export default async function ContactPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const contactInfo = await getContactSettings(locale);

  const translations = {
    title: locale === "ar" ? "تواصل معنا" : "Contact Us",
    subtitle: locale === "ar" 
      ? "نحن هنا لخدمتك! لا تتردد في طلب وتسجيل الاستفسار عن كماليات وألوان الجلود المتوفرة." 
      : "We are here to serve you! Feel free to request details about the available leather colors and essentials.",
  };

  return (
    <main className="flex-1 w-full bg-background min-h-screen">
      <ContactClient
        contactInfo={contactInfo}
        locale={locale}
        translations={translations}
      />
    </main>
  );
}