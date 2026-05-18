"use client";

import { useEffect, useRef } from "react";

type Props = {
  quotePublicId: string;
  /** True when URL has ?viewer=client (CRM “client opened” link). */
  enabled: boolean;
};

/**
 * Fires once per page load when the client-tracked URL is used; increments
 * server-side counter and triggers the quote webhook (eventType quoteWatched).
 */
export default function QuoteClientViewTracker({
  quotePublicId,
  enabled,
}: Props) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!enabled || sentRef.current) return;
    sentRef.current = true;

    void fetch(`/api/quotes/${quotePublicId}/client-view`, {
      method: "POST",
    }).catch((e) => {
      console.error("client-view track failed", e);
    });
  }, [enabled, quotePublicId]);

  return null;
}
