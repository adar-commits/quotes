"use client";

import { useRef, useState } from "react";

export default function QuoteSignature() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-lg backdrop-blur-sm md:p-8">
      <h3 className="mb-6 text-center text-xl font-bold text-[#801a1e] md:text-2xl">
        חתימה דיגיטלית על הצעת המחיר
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative">
            <input
              id="sig-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="peer w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3 py-3 pt-5 text-right transition-colors focus:border-[#801a1e] focus:outline-none focus:ring-1 focus:ring-[#801a1e]"
            />
            <label
              htmlFor="sig-name"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-[#801a1e] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs"
            >
              שם החותמ/ת
            </label>
          </div>
          <div className="relative">
            <input
              id="sig-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder=" "
              className="peer w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3 py-3 pt-5 text-right transition-colors focus:border-[#801a1e] focus:outline-none focus:ring-1 focus:ring-[#801a1e]"
            />
            <label
              htmlFor="sig-role"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-[#801a1e] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs"
            >
              תפקיד
            </label>
          </div>
        </div>
        <div>
          <div className="relative h-48 w-full rounded-lg border-2 border-dashed border-gray-400 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full rounded-lg"
              width={400}
              height={192}
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-500">
            יש לחתום מעלה
          </p>
        </div>
      </div>
      <button
        type="button"
        className="mt-6 w-full rounded-xl bg-[#801a1e] px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-[#6b1619] hover:shadow-xl active:scale-[0.99]"
      >
        שלח
      </button>
    </section>
  );
}
