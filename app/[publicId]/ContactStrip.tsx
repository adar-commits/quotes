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
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-white md:px-6"
      style={{ backgroundColor: BRAND_RED }}
    >
      <span className="text-xs font-bold uppercase tracking-wider opacity-90">
        פרטי התקשרות
      </span>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-100">
          {repName ?? "—"}
        </span>
        {repPhone && (
          <a
            href={`tel:${repPhone.replace(/\D/g, "")}`}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-white/30 px-3 py-2 text-sm transition-colors hover:bg-white/10 sm:min-h-0 sm:min-w-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {repPhone}
          </a>
        )}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white/50">
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
