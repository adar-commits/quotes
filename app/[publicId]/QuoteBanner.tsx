"use client";

import Image from "next/image";
import { useState } from "react";

export default function QuoteBanner() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative h-32 w-full overflow-hidden sm:h-40 md:h-52">
      {/* Fallback: subtle carpet-style gradient when image missing or fails */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-100/95 via-rose-50/90 to-stone-200/95"
        aria-hidden
      />
      {!imgError && (
        <Image
          src="https://quotes.carpetshop.co.il/img/invoice_header.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
