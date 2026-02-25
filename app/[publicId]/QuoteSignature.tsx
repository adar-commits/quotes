"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function QuoteSignature() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      if ("clientX" in e) {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
      return null;
    },
    []
  );

  const getPointFromTouch = useCallback(
    (e: TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas || !e.touches.length) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const ctx = getContext();
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = "#801a1e";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    },
    [getContext]
  );

  const startDrawing = useCallback(
    (p: { x: number; y: number } | null) => {
      if (!p) return;
      isDrawingRef.current = true;
      lastPointRef.current = p;
    },
    []
  );

  const moveDrawing = useCallback(
    (p: { x: number; y: number } | null) => {
      if (!isDrawingRef.current || !p) return;
      const last = lastPointRef.current;
      if (last) drawLine(last, p);
      lastPointRef.current = p;
    },
    [drawLine]
  );

  const endDrawing = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const p = getPointFromTouch(e);
      startDrawing(p);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      moveDrawing(getPointFromTouch(e));
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endDrawing();
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    return () => {
      ro.disconnect();
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [startDrawing, moveDrawing, endDrawing, getPointFromTouch]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrawing(getPoint(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    moveDrawing(getPoint(e));
  };

  const handleMouseUp = () => {
    endDrawing();
  };

  const handleMouseLeave = () => {
    endDrawing();
  };

  const clearCanvas = () => {
    const container = containerRef.current;
    const ctx = getContext();
    if (!container || !ctx) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    ctx.clearRect(0, 0, w, h);
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg ring-1 ring-slate-900/5 backdrop-blur-sm sm:p-6 md:p-8">
      <h3 className="mb-4 text-center text-lg font-bold text-[#801a1e] sm:mb-6 sm:text-xl md:text-2xl">
        חתימה דיגיטלית על הצעת המחיר
      </h3>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative">
            <input
              id="sig-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              className="peer min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-slate-50/80 px-3 py-3 pt-5 text-base text-right transition-all focus:border-[#801a1e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#801a1e]/20"
              autoComplete="name"
            />
            <label
              htmlFor="sig-name"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-[#801a1e] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold"
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
              className="peer min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-slate-50/80 px-3 py-3 pt-5 text-base text-right transition-all focus:border-[#801a1e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#801a1e]/20"
              autoComplete="organization-title"
            />
            <label
              htmlFor="sig-role"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-[#801a1e] peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold"
            >
              תפקיד
            </label>
          </div>
        </div>
        <div>
          <div
            ref={containerRef}
            className="relative h-40 w-full touch-none select-none rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 sm:h-48 ring-1 ring-slate-200/80 transition-colors focus-within:border-[#801a1e]/50 focus-within:ring-2 focus-within:ring-[#801a1e]/20"
            style={{ touchAction: "none" }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-crosshair rounded-xl"
              style={{ touchAction: "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              aria-label="אזור חתימה"
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              נקה חתימה
            </button>
            <p className="text-sm text-slate-500">יש לחתום מעלה</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 min-h-[48px] w-full rounded-xl bg-[#801a1e] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#6b1619] hover:shadow-xl active:scale-[0.99] sm:mt-6 sm:text-lg"
        style={{
          boxShadow: "0 4px 14px rgba(128, 26, 30, 0.35)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        שלח
      </button>
    </section>
  );
}
