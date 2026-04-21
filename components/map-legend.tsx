"use client";

import { useState } from "react";
import { Layers, ChevronDown, ChevronUp } from "lucide-react";

const LEGEND_ITEMS = [
  { color: "#d4460e", label: "Sangat Tinggi", range: "> 1000 penerima" },
  { color: "#e87d2c", label: "Tinggi", range: "500 – 1000 penerima" },
  { color: "#d4b31a", label: "Sedang", range: "300 – 500 penerima" },
  { color: "#4caf7b", label: "Rendah", range: "100 – 300 penerima" },
  { color: "#2faebb", label: "Sangat Rendah", range: "< 100 penerima" },
];

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden w-52">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors"
        aria-expanded={open}
        aria-label="Toggle tingkat distribusi legend"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
            Tingkat Distribusi
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <ul className="px-3 pb-3 pt-1 space-y-2 border-t border-border/50">
          {LEGEND_ITEMS.map(({ color, label, range }) => (
            <li key={label} className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white/80 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="text-xs font-medium text-foreground leading-tight">{label}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{range}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
