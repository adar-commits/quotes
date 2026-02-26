"use client";

import Image from "next/image";
import { useState } from "react";

const DEFAULT_BANNER = "https://quotes.carpetshop.co.il/img/invoice_header.jpg";

export default function QuoteBanner({ bannerUrl }: { bannerUrl?: string | null }) {
  const [imgError, setImgError] = useState(false);
  const src = bannerUrl || DEFAULT_BANNER;

  return (
    <div className="relative h-32 w-full overflow-hidden sm:h-40 md:h-52">
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-100/95 via-rose-50/90 to-stone-200/95"
        aria-hidden
      />
      {!imgError && (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
          onError={() => setImgError(true)}
        />
      )}
      {/* Subtle bottom gradient overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}
