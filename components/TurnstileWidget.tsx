"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string) => void;
  onError?: () => void;
  theme?: "auto" | "light" | "dark";
}

export function TurnstileWidget({
  siteKey,
  onToken,
  onError,
  theme = "auto",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId     = useRef<string | null>(null);
  const rendered     = useRef(false);

  useEffect(() => {
    if (rendered.current) return;

    function renderWidget() {
      if (!containerRef.current || !window.turnstile || rendered.current) return;
      rendered.current = true;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey:          siteKey,
        theme,
        callback:         onToken,
        "error-callback": onError,
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      window.onTurnstileLoad = renderWidget;
      if (!document.querySelector('script[src*="turnstile"]')) {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetId.current && window.turnstile) {
        try { window.turnstile.reset(widgetId.current); } catch { /* ignore */ }
      }
      rendered.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <div ref={containerRef} className="mt-1" />;
}
