"use client";

import { Wrench, ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  label?: string;
  onBack?: () => void;
}

export default function ComingSoon({ label, onBack }: ComingSoonProps) {
  return (
    <div className="relative min-h-[75vh] w-full flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-muted/10 dark:to-background">
      {/* Decorative glowing background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="relative max-w-md w-full p-8 md:p-10 rounded-3xl border border-border/40 bg-card/75 backdrop-blur-md shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto text-primary border border-primary/10 shadow-sm animate-pulse">
          <Wrench className="w-7 h-7 text-primary" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/25 text-primary bg-primary/5">
            Dalam Pengembangan
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight tracking-tight">
            {label ? `"${label}" Belum Tersedia` : "Fitur Belum Tersedia"}
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
            Halaman ini sedang dipersiapkan oleh tim Dinas Sosial Kota Ternate dan akan segera hadir dalam waktu dekat.
          </p>
        </div>

        {onBack && (
          <div className="pt-2">
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 w-full rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground font-semibold text-xs transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}