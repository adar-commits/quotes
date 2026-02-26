const DEFAULT_STRIP_COLOR = "#801a1e";

const CONTACT = {
  phone: "054-9668390",
  email: "b2b@carpetshop.co.il",
  address: "כנרת 10, איירפורט סיטי",
  website: "carpetshop.co.il",
};

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}
function IconLocation({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}
function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}
function IconEmail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

function darken(hex: string, pct: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) * (1 - pct));
  const g = Math.max(0, ((n >> 8) & 0xff) * (1 - pct));
  const b = Math.max(0, (n & 0xff) * (1 - pct));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function ContactStrip({ mainColor }: { mainColor?: string | null }) {
  const color = mainColor || DEFAULT_STRIP_COLOR;
  const dark = darken(color, 0.2);
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-6 px-4 py-3.5 text-white md:px-6"
      style={{
        background: `linear-gradient(90deg, ${dark} 0%, ${color} 30%, ${color} 70%, ${dark} 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      }}
      dir="ltr"
    >
      <a
        href={`mailto:${CONTACT.email}`}
        className="flex items-center gap-2 text-sm font-medium text-white/95 transition-opacity hover:opacity-90"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <IconEmail className="h-5 w-5 shrink-0 opacity-90" />
        <span>{CONTACT.email}</span>
      </a>
      <a
        href={`tel:${CONTACT.phone.replace(/\D/g, "")}`}
        className="flex items-center gap-2 text-sm font-medium text-white/95 transition-opacity hover:opacity-90"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <IconPhone className="h-5 w-5 shrink-0 opacity-90" />
        <span>{CONTACT.phone}</span>
      </a>
      <span className="flex items-center gap-2 text-sm font-medium text-white/95">
        <IconLocation className="h-5 w-5 shrink-0 opacity-90" />
        <span>{CONTACT.address}</span>
      </span>
      <a
        href={`https://${CONTACT.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-white/95 transition-opacity hover:opacity-90"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <IconGlobe className="h-5 w-5 shrink-0 opacity-90" />
        <span>{CONTACT.website}</span>
      </a>
    </div>
  );
}
