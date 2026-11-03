"use client";

import { useEffect } from "react";

import { useUiStore } from "@/stores/ui-store";

/** Renders nothing; sets the sticky bar's WhatsApp text while this page is mounted. */
export function PageWhatsAppMessage({ message }: { message: string }) {
  const setMessage = useUiStore((s) => s.setWhatsappMessage);
  useEffect(() => {
    setMessage(message);
    return () => setMessage(null);
  }, [message, setMessage]);
  return null;
}
