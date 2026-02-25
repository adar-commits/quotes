"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const RED = "#801a1e";

export default function LineLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(0);
    const t1 = setTimeout(() => setProgress(70), 50);
    const t2 = setTimeout(() => setProgress(100), 300);
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[9999] h-1 transition-[width] duration-300 ease-out"
      style={{
        background: RED,
        width: `${progress}%`,
      }}
      aria-hidden
    />
  );
}
