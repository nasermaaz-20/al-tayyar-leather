import { settingsService } from "@/src/server/services/settings.service";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const contactSettings = await settingsService.getContactSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store&apos;s contact information and external links.
          </p>
        </div>
      </div>
      <SettingsClient initialSettings={contactSettings} />
    </div>
  );
}
