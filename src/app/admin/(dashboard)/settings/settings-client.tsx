"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { updateContactSettings } from "@/src/shared/api/admin";
import toast from "react-hot-toast";
import type { ContactSettings } from "@/src/shared/api/types";

export default function SettingsClient({ initialSettings }: { initialSettings: ContactSettings }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactSettings>(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateContactSettings(formData);
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl space-y-6"
    >
      <form onSubmit={handleSubmit} className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Contact & Social Links</h2>
          <p className="text-sm text-muted-foreground mt-1">
            These details will be visible on the public website and contact page.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">WhatsApp Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">+</span>
                <input
                  type="tel"
                  placeholder="e.g. 963912345678"
                  dir="ltr"
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Include country code without + or 00</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">TikTok Username / Link</label>
              <input
                type="text"
                placeholder="e.g. @al_tayyar_leather"
                dir="ltr"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.tiktokUrl}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Facebook Link</label>
              <input
                type="url"
                placeholder="https://facebook.com/..."
                dir="ltr"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.facebookUrl || ""}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Instagram Link</label>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                dir="ltr"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.instagramUrl || ""}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                placeholder="info@altayyar.com"
                dir="ltr"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Location Addresses</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">English Address</label>
              <textarea
                rows={3}
                placeholder="Full address in English..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                value={formData.addressEn}
                onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground block text-right">Arabic Address</label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="العنوان الكامل باللغة العربية..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-right resize-none"
                value={formData.addressAr}
                onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Settings
          </button>
        </div>
      </form>
    </motion.div>
  );
}
