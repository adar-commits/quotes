"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Template = {
  id: string;
  name: string;
  template_key: string;
  main_color: string;
  bullets_color: string | null;
  banner_url: string | null;
  background_url: string | null;
  favicon_url: string | null;
  logo_url: string | null;
  contact_strip_bg: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      try {
        const res = await fetch("/api/settings/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSave = async (t: Template, updates: Partial<Template>) => {
    setSaving(t.id);
    try {
      const res = await fetch(`/api/settings/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTemplates((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...updated } : x)));
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-slate-600">טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">הגדרות תבניות הצעות</h1>
        <p className="mb-6 text-sm text-slate-600">
          העתק את מזהה התבנית (Template ID) ושלח אותו בבקשת יצירת הצעה (שדה <code className="rounded bg-slate-200 px-1">template_id</code> או <code className="rounded bg-slate-200 px-1">template_key</code>).
        </p>
        <div className="space-y-8">
          {templates.map((t) => (
            <TemplateForm
              key={t.id}
              template={t}
              onSave={handleSave}
              saving={saving === t.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateForm({
  template: t,
  onSave,
  saving,
}: {
  template: Template;
  onSave: (t: Template, u: Partial<Template>) => Promise<void>;
  saving: boolean;
}) {
  const [name, setName] = useState(t.name);
  const [mainColor, setMainColor] = useState(t.main_color);
  const [bulletsColor, setBulletsColor] = useState(t.bullets_color ?? t.main_color);
  const [bannerUrl, setBannerUrl] = useState(t.banner_url ?? "");
  const [backgroundUrl, setBackgroundUrl] = useState(t.background_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(t.favicon_url ?? "");
  const [logoUrl, setLogoUrl] = useState(t.logo_url ?? "");
  const [contactStripBg, setContactStripBg] = useState(t.contact_strip_bg ?? t.main_color);

  useEffect(() => {
    setName(t.name);
    setMainColor(t.main_color);
    setBulletsColor(t.bullets_color ?? t.main_color);
    setBannerUrl(t.banner_url ?? "");
    setBackgroundUrl(t.background_url ?? "");
    setFaviconUrl(t.favicon_url ?? "");
    setLogoUrl(t.logo_url ?? "");
    setContactStripBg(t.contact_strip_bg ?? t.main_color);
  }, [t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(t, {
      name,
      main_color: mainColor,
      bullets_color: bulletsColor || null,
      banner_url: bannerUrl || null,
      background_url: backgroundUrl || null,
      favicon_url: faviconUrl || null,
      logo_url: logoUrl || null,
      contact_strip_bg: contactStripBg || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">{t.name}</h2>
        <span className="text-xs text-slate-500">key: {t.template_key}</span>
      </div>
      <div className="mb-4 rounded-lg bg-slate-100 p-3">
        <label className="block text-xs font-bold text-slate-500">Template ID (לשימוש ב־quote creation)</label>
        <code className="mt-1 block break-all text-sm text-slate-800">{t.id}</code>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">שם תבנית</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">צבע ראשי</label>
          <input
            type="text"
            value={mainColor}
            onChange={(e) => setMainColor(e.target.value)}
            placeholder="#801a1e"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">צבע בולטים</label>
          <input
            type="text"
            value={bulletsColor}
            onChange={(e) => setBulletsColor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">צבע פס קשר</label>
          <input
            type="text"
            value={contactStripBg}
            onChange={(e) => setContactStripBg(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">כתובת באנר עליון (Top banner URL)</label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">כתובת רקע (Background image URL)</label>
          <input
            type="url"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">כתובת לוגו (Logo URL, מעל רשימת מוצרים)</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">כתובת Favicon</label>
          <input
            type="url"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </form>
  );
}
