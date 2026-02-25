import Image from "next/image";
import DefaultAvatar from "./DefaultAvatar";

const BRAND_RED = "#801a1e";

type ContactStripProps = {
  repName: string | null;
  repPhone: string | null;
  repAvatar: string | null;
};

export default function ContactStrip({
  repName,
  repPhone,
  repAvatar,
}: ContactStripProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-white md:px-6"
      style={{
        background: `linear-gradient(90deg, #5c1316 0%, ${BRAND_RED} 30%, ${BRAND_RED} 70%, #5c1316 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <span className="text-[0.7rem] font-bold uppercase tracking-widest text-white/90">
        פרטי התקשרות
      </span>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-white/95">
          {repName ?? "—"}
        </span>
        {repPhone && (
          <a
            href={`tel:${repPhone.replace(/\D/g, "")}`}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium transition-all hover:bg-white/20 hover:border-white/40 sm:min-h-0 sm:min-w-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {repPhone}
          </a>
        )}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-white/50 shadow-lg ring-2 ring-white/20">
          {repAvatar ? (
            <Image
              src={repAvatar}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <DefaultAvatar />
          )}
        </div>
      </div>
    </div>
  );
}
