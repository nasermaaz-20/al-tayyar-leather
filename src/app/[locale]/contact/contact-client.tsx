"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";

const TiktokIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

export function ContactClient({ contactInfo, locale, translations }: any) {
  const cleanNumber = contactInfo.whatsappNumber ? contactInfo.whatsappNumber.replace(/\D/g, '') : '';
  const message = locale === "ar" ? "مرحباً، أريد الاستفسار عن الجلود" : "Hello, I want to inquire about the leather.";
  const link = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  
  const address = locale === "ar" ? contactInfo.addressAr : contactInfo.addressEn;
  const tiktokUrl = contactInfo.tiktokUrl;
  const emailAddress = contactInfo.email || "info@altayyar.com";

  const features = [
    {
       icon: Phone,
       title: locale === "ar" ? "رقم الواتساب" : "WhatsApp Number",
       content: contactInfo.whatsappNumber || "N/A",
       action: link,
       cta: locale === "ar" ? "راسلنا الآن" : "Message Us"
    },
    {
       icon: Mail,
       title: locale === "ar" ? "راسلنا عبر البريد" : "Email Us",
       content: emailAddress,
       action: `mailto:${emailAddress}`,
       cta: locale === "ar" ? "أرسل إيميل" : "Email Us"
    },
    {
       icon: TiktokIcon,
       title: locale === "ar" ? "تيك توك" : "TikTok",
       content: "@AlTayyarLeather",
       action: tiktokUrl,
       cta: locale === "ar" ? "تابعنا" : "Follow Us"
    }
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="lux-container text-center mb-16 relative z-10">
         <motion.h1 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4"
         >
           {translations.title}
         </motion.h1>
         <div className="lux-divider w-32 mx-auto mb-6"></div>
         <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-foreground/60 max-w-2xl mx-auto text-lg leading-relaxed"
         >
           {translations.subtitle}
         </motion.p>
      </div>

      <div className="lux-container relative z-10 w-full max-w-5xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, i) => (
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  key={i}
                  className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg hover:border-primary/50 hover:shadow-primary/10 transition-all duration-300 group"
               >
                  <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 text-primary dark:text-gold flex items-center justify-center mb-6 transition-colors duration-300">
                     <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-foreground mb-2">
                     {feature.title}
                  </h3>
                  <p className="text-foreground/70 mb-6 font-medium font-sans">
                     {feature.content}
                  </p>
                  
                  {feature.action && (
                     <a 
                       href={feature.action}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="mt-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm tracking-widest uppercase transition-all bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg hover:shadow-foreground/20"
                     >
                       {feature.icon === Phone && (
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path></svg>
                       )}
                       {feature.cta}
                     </a>
                  )}
               </motion.div>
            ))}
         </div>

         {/* Google Maps Embed */}
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-border/50 shadow-xl relative group"
         >
            {/* Transparent overlay matching background color that fades out on hover */}
            <div className="absolute inset-0 bg-background opacity-85 pointer-events-none transition-opacity duration-700 z-10 group-hover:opacity-0" />

            <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3626.3116470344!2d46.724100824592675!3d24.64739897806901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f05001d989feb%3A0x95e9bbfb6b0925e9!2sAl%20arafa!5e0!3m2!1sar!2s!4v1775700988376!5m2!1sar!2s" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen={true} 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="grayscale-[50%] contrast-[110%] group-hover:grayscale-0 transition-all duration-700 relative z-0"
            ></iframe>
         </motion.div>
      </div>
    </div>
  );
}