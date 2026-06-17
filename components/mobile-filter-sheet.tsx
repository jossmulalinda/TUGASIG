"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const BANTUAN_OPTIONS = [
  { value: "Semua Jenis", label: "Semua Jenis", emoji: "🗂️" },
  { value: "Sembako/BPNT", label: "Sembako / BPNT", emoji: "🛒" },
  { value: "PKH", label: "PKH", emoji: "👨‍👩‍👧" },
  { value: "PBI JK", label: "PBI JKN", emoji: "🏥" },
];

const TAHUN_OPTIONS = ["2026", "2025", "2024", "2023", "2022"];

interface MobileFilterSheetProps {
  selectedBantuan: string;
  onBantuanChange: (val: string) => void;
  selectedTahun: string;
  onTahunChange: (val: string) => void;
}

export default function MobileFilterSheet({
  selectedBantuan,
  onBantuanChange,
  selectedTahun,
  onTahunChange,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const hasActiveFilter =
    selectedBantuan !== "Semua Jenis" || selectedTahun !== "2026";

  return (
    <>
      {/* FAB — Floating Action Button */}
      <button
        id="mobile-filter-fab"
        onClick={() => setOpen(true)}
        aria-label="Buka filter"
        className={cn(
          "lg:hidden fixed bottom-20 right-4 z-[998]",
          "flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg",
          "text-sm font-semibold transition-all duration-200",
          "hover:scale-105 active:scale-95",
          hasActiveFilter
            ? "gradient-bg text-white shadow-primary/40"
            : "bg-card border border-border text-foreground shadow-black/10"
        )}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filter</span>
        {hasActiveFilter && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-[9px] font-bold">
            {(selectedBantuan !== "Semua Jenis" ? 1 : 0) +
              (selectedTahun !== "2026" ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter data"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-[1001] animate-slide-up"
        >
          <div className="bg-card rounded-t-2xl shadow-2xl border-t border-border overflow-hidden">
            {/* Handle & header */}
            <div className="flex flex-col items-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full bg-border mb-4" />
              <div className="w-full flex items-center justify-between px-5 pb-3 border-b border-border">
                <div>
                  <h2 className="font-semibold text-base text-foreground">Filter Data</h2>
                  <p className="text-xs text-muted-foreground">Pilih jenis bantuan & tahun</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup filter"
                  className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5 pb-8">
              {/* Jenis Bantuan */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Jenis Bantuan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BANTUAN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        onBantuanChange(opt.value);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all duration-150",
                        selectedBantuan === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      <span className="text-sm font-medium leading-tight">{opt.label}</span>
                      {selectedBantuan === opt.value && (
                        <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tahun */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Tahun
                </label>
                <div className="flex gap-2 flex-wrap">
                  {TAHUN_OPTIONS.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => {
                        onTahunChange(yr);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150",
                        selectedTahun === yr
                          ? "gradient-bg text-white border-transparent shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl gradient-bg text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
