"use client";

import { Calendar, ExternalLink } from "lucide-react";
import { personalInfo } from "@/lib/data";

export function CalendarBooking() {
  const url =
    process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL ??
    personalInfo.calendarBookingUrl;
  const embedUrl = url.includes("?") ? `${url}&embed=true` : `${url}?embed=true`;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-blue-500/15">
      <div className="p-6 sm:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="font-display text-xl font-bold">Book a Video Call</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            Pick an available slot for a free intro call — no back-and-forth emails needed.
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0"
        >
          Open in new tab
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <iframe
        src={embedUrl}
        title="Book a video call with Kathan Patel"
        className="w-full h-[min(680px,75vh)] border-0 bg-background"
        loading="lazy"
      />
    </div>
  );
}
