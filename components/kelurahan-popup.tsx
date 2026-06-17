"use client";

import { X, Users, TrendingUp, Activity } from "lucide-react";
import type { KelurahanData } from "./distribution-map";

type Level = "very-high" | "high" | "medium" | "low";

const LEVEL_LABELS: Record<Level, string> = {
  "very-high": "Sangat Tinggi",
  high:        "Tinggi",
  medium:      "Sedang",
  low:         "Rendah",
};

// Exact same colors as the map legend & getColor()
const LEVEL_STYLES: Record<Level, {
  hex: string;
  badge: string;
  bar: string;
  glow: string;
}> = {
  "very-high": {
    hex:   "#d4460e",
    badge: "bg-[#d4460e]/10 text-[#d4460e]",
    bar:   "bg-[#d4460e]",
    glow:  "shadow-[0_0_0_3px_#d4460e22]",
  },
  high: {
    hex:   "#e87d2c",
    badge: "bg-[#e87d2c]/10 text-[#e87d2c]",
    bar:   "bg-[#e87d2c]",
    glow:  "shadow-[0_0_0_3px_#e87d2c22]",
  },
  medium: {
    hex:   "#4caf7b",
    badge: "bg-[#4caf7b]/10 text-[#4caf7b]",
    bar:   "bg-[#4caf7b]",
    glow:  "shadow-[0_0_0_3px_#4caf7b22]",
  },
  low: {
    hex:   "#2faebb",
    badge: "bg-[#2faebb]/10 text-[#2faebb]",
    bar:   "bg-[#2faebb]",
    glow:  "shadow-[0_0_0_3px_#2faebb22]",
  },
};

const LEVEL_PERCENT: Record<Level, number> = {
  "very-high": 95,
  high:        70,
  medium:      45,
  low:         20,
};

interface Props {
  data: KelurahanData;
  onClose: () => void;
  isMobile?: boolean;
}

export default function KelurahanPopup({ data, onClose, isMobile = false }: Props) {
  const level  = data.level as Level;
  const styles = LEVEL_STYLES[level];
  const pct    = LEVEL_PERCENT[level];

  const content = (
    <>
      {/* Drag handle (mobile only) */}
      {isMobile && (
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
      )}

      {/* Colored top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: styles.hex }} />

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-2.5">
          {/* Color dot matching legend */}
          <div
            className={`mt-1 w-3 h-3 rounded-full shrink-0 ${styles.glow}`}
            style={{ backgroundColor: styles.hex }}
          />
          <div>
            <h3 className="font-bold text-foreground text-base leading-tight">
              {data.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kecamatan {data.kecamatan}
            </p>
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
        {/* Level badge + progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${styles.badge}`}>
              {LEVEL_LABELS[level]}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* KPM Count */}
        <div
          className="rounded-xl p-3 flex items-center gap-3 border"
          style={{
            backgroundColor: `${styles.hex}10`,
            borderColor: `${styles.hex}30`,
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${styles.hex}20` }}
          >
            <Users className="w-4 h-4" style={{ color: styles.hex }} />
          </div>
          <div>
            <p className="text-xl font-extrabold leading-none tabular-nums" style={{ color: styles.hex }}>
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
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                Program
              </span>
            </div>
            <p className="text-xs font-bold text-foreground leading-tight">
              {data.jenisBantuan}
            </p>
          </div>
          <div className="bg-muted/40 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                Status
              </span>
            </div>
            <p className="text-xs font-bold text-foreground leading-tight">
              Aktif 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full overflow-hidden animate-slide-up">
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