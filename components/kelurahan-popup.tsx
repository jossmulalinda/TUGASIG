"use client";

import { X, MapPin, TrendingUp, Users, Activity } from "lucide-react";
import type { KelurahanData } from "./distribution-map";

type Level = "very-high" | "high" | "medium" | "low";

const LEVEL_LABELS: Record<Level, string> = {
  "very-high": "Sangat Tinggi",
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const LEVEL_STYLES: Record<Level, { badge: string; bar: string; dot: string }> = {
  "very-high": {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  high: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    bar: "bg-orange-500",
    dot: "bg-orange-500",
  },
  medium: {
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    bar: "bg-yellow-500",
    dot: "bg-yellow-500",
  },
  low: {
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    bar: "bg-teal-500",
    dot: "bg-teal-500",
  },
};

const LEVEL_PERCENT: Record<Level, number> = {
  "very-high": 95,
  high: 70,
  medium: 45,
  low: 20,
};

interface Props {
  data: KelurahanData;
  onClose: () => void;
  isMobile?: boolean;
}

export default function KelurahanPopup({ data, onClose, isMobile = false }: Props) {
  const level = data.level as Level;
  const styles = LEVEL_STYLES[level];
  const pct = LEVEL_PERCENT[level];

  const content = (
    <>
      {/* Drag handle (mobile only) */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${styles.dot}`} />
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">
              {data.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Kec. {data.kecamatan}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Level badge + progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles.badge}`}>
              {LEVEL_LABELS[level]}
            </span>
            <span className="text-xs text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* KPM Count */}
        <div className="bg-muted/40 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground tabular-nums leading-none">
              {data.penerima.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Keluarga Penerima Manfaat (KPM)
            </p>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/40 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                Program
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground leading-tight">
              {data.jenisBantuan}
            </p>
          </div>
          <div className="bg-muted/40 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground leading-tight">
              Aktif 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="bg-card border-t border-border rounded-t-2xl shadow-2xl w-full animate-slide-up">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-2xl w-72 overflow-hidden animate-fade-in">
      {content}
    </div>
  );
}