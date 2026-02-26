"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const DEFAULT_COLOR = "#801a1e";

/** Test quote public_id per template for Preview button */
const TEMPLATE_PREVIEW_PUBLIC_IDS: Record<string, string> = {
  redcarpet: "test-redcarpet",
  pozitive: "test-pozitive",
  elite_rugs: "test-elite",
};

export default function SettingsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadTemplates = async () => {
    setApiError(null);
    try {
      const res = await fetch("/api/settings/templates");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setApiError(err?.error || "שגיאה בטעינת תבניות");
        setTemplates([]);
        return;
      }
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setApiError("שגיאת רשת");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      await loadTemplates();
    })();
  }, [router]);

  const handleSave = async (t: Template, updates: Partial<Template>) => {
    setSaving(t.id);
    setApiError(null);
    try {
      const res = await fetch(`/api/settings/templates/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTemplates((prev) =>
          prev.map((x) => (x.id === t.id ? { ...x, ...updated } : x))
        );
      } else {
        const err = await res.json().catch(() => ({}));
        setApiError(err?.error || "שגיאה בשמירה");
      }
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async (payload: {
    name: string;
    template_key: string;
    main_color: string;
    bullets_color: string | null;
    contact_strip_bg: string | null;
    banner_url: string | null;
    background_url: string | null;
    logo_url: string | null;
    favicon_url: string | null;
  }) => {
    setCreating(true);
    setApiError(null);
    try {
      const res = await fetch("/api/settings/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setTemplates((prev) => [created, ...prev]);
        setShowCreateForm(false);
      } else {
        const err = await res.json().catch(() => ({}));
        setApiError(err?.error || "שגיאה ביצירת תבנית");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-slate-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            ← חזרה
          </Link>
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
            הגדרות תבניות הצעות
          </h1>
          <div className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {/* Intro */}
        <p className="mb-8 text-sm leading-relaxed text-slate-600">
          העתק את מזהה התבנית (Template ID או <code className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-700">template_key</code>) ושלח בבקשת יצירת הצעה (שדות <code className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-700">template_id</code> או <code className="rounded bg-slate-200 px-1.5 py-0.5 text-slate-700">template_key</code>). הצבעים וה־URLs של כל תבנית משפיעים על דף ההצעה: כותרות, סרגל סיכום, תנאים, בולטים, תוויות מוצר, פס קשר ואישור.
        </p>

        {apiError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {apiError}
          </div>
        )}

        {/* Empty state or list + Add button */}
        {templates.length === 0 && !showCreateForm ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-8 text-center md:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/80 text-3xl text-slate-500">
              📋
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-800">
              אין עדיין תבניות
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              צור תבנית ראשונה כדי להגדיר צבעים, באנר, לוגו ו־favicon להצעות.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
            >
              צור תבנית
            </button>
          </div>
        ) : null}

        {showCreateForm && (
          <CreateTemplateForm
            onSave={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            saving={creating}
          />
        )}

        {templates.length > 0 && (
          <div className="space-y-6">
            {!showCreateForm && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  + הוסף תבנית
                </button>
              </div>
            )}
            {templates.map((t) => (
              <TemplateForm
                key={t.id}
                template={t}
                onSave={handleSave}
                saving={saving === t.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CreateTemplateForm({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (p: {
    name: string;
    template_key: string;
    main_color: string;
    bullets_color: string | null;
    contact_strip_bg: string | null;
    banner_url: string | null;
    background_url: string | null;
    logo_url: string | null;
    favicon_url: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [mainColor, setMainColor] = useState(DEFAULT_COLOR);
  const [bulletsColor, setBulletsColor] = useState(DEFAULT_COLOR);
  const [contactStripBg, setContactStripBg] = useState(DEFAULT_COLOR);
  const [bannerUrl, setBannerUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const key = templateKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name.trim() || !key) return;
    onSave({
      name: name.trim(),
      template_key: key,
      main_color: mainColor || DEFAULT_COLOR,
      bullets_color: bulletsColor || null,
      contact_strip_bg: contactStripBg || null,
      banner_url: bannerUrl || null,
      background_url: backgroundUrl || null,
      logo_url: logoUrl || null,
      favicon_url: faviconUrl || null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
    >
      <h2 className="mb-6 text-lg font-bold text-slate-800">תבנית חדשה</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            שם תבנית *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
            placeholder="למשל Red Carpet"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            מפתח תבנית (template_key) *
          </label>
          <input
            type="text"
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800"
            placeholder="redcarpet"
          />
          <p className="mt-1 text-xs text-slate-500">
            אנגלית, אותיות קטנות, רווחים יהפכו ל־_
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            צבע ראשי
          </label>
          <input
            type="text"
            value={mainColor}
            onChange={(e) => setMainColor(e.target.value)}
            placeholder="#801a1e"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            צבע בולטים
          </label>
          <input
            type="text"
            value={bulletsColor}
            onChange={(e) => setBulletsColor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            צבע פס קשר
          </label>
          <input
            type="text"
            value={contactStripBg}
            onChange={(e) => setContactStripBg(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת באנר עליון
          </label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת רקע
          </label>
          <input
            type="url"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת לוגו
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת Favicon
          </label>
          <input
            type="url"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
        >
          {saving ? "יוצר..." : "צור תבנית"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
        >
          ביטול
        </button>
      </div>
    </form>
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
  const [templateKey, setTemplateKey] = useState(t.template_key);
  const [mainColor, setMainColor] = useState(t.main_color);
  const [bulletsColor, setBulletsColor] = useState(t.bullets_color ?? t.main_color);
  const [bannerUrl, setBannerUrl] = useState(t.banner_url ?? "");
  const [backgroundUrl, setBackgroundUrl] = useState(t.background_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(t.favicon_url ?? "");
  const [logoUrl, setLogoUrl] = useState(t.logo_url ?? "");
  const [contactStripBg, setContactStripBg] = useState(
    t.contact_strip_bg ?? t.main_color
  );

  useEffect(() => {
    setName(t.name);
    setTemplateKey(t.template_key);
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
      template_key: templateKey.trim().toLowerCase().replace(/\s+/g, "_"),
      main_color: mainColor,
      bullets_color: bulletsColor || null,
      banner_url: bannerUrl || null,
      background_url: backgroundUrl || null,
      favicon_url: faviconUrl || null,
      logo_url: logoUrl || null,
      contact_strip_bg: contactStripBg || null,
    });
  };

  const copyId = () => {
    void navigator.clipboard.writeText(t.id);
  };
  const copyKey = () => {
    void navigator.clipboard.writeText(t.template_key);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-800">{t.name}</h2>
        <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
          {t.template_key}
        </span>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-slate-50 p-3">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-bold text-slate-500">
            Template ID (לשימוש ב־quote creation)
          </label>
          <code className="mt-1 block break-all text-sm text-slate-800">
            {t.id}
          </code>
        </div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_PREVIEW_PUBLIC_IDS[t.template_key] && (
            <a
              href={`${typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) : process.env.NEXT_PUBLIC_APP_URL || ""}/${TEMPLATE_PREVIEW_PUBLIC_IDS[t.template_key]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Preview
            </a>
          )}
          <button
            type="button"
            onClick={copyId}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            העתק
          </button>
          <button
            type="button"
            onClick={copyKey}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            העתק key
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            שם תבנית
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            מפתח תבנית (template_key)
          </label>
          <input
            type="text"
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            צבע ראשי
          </label>
          <input
            type="text"
            value={mainColor}
            onChange={(e) => setMainColor(e.target.value)}
            placeholder="#801a1e"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            צבע בולטים
          </label>
          <input
            type="text"
            value={bulletsColor}
            onChange={(e) => setBulletsColor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            צבע פס קשר
          </label>
          <input
            type="text"
            value={contactStripBg}
            onChange={(e) => setContactStripBg(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת באנר עליון
          </label>
          <input
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת רקע
          </label>
          <input
            type="url"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת לוגו
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            כתובת Favicon
          </label>
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
