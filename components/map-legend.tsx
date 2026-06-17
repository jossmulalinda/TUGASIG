"use client";

import { useState } from "react";
import { Layers, ChevronDown, ChevronUp } from "lucide-react";

const LEGEND_MAP: Record<string, { color: string; label: string; range: string }[]> = {
  "PBI JK": [
    { color: "#d4460e", label: "Sangat Tinggi", range: "> 6.000 KPM" },
    { color: "#e87d2c", label: "Tinggi",        range: "2.501 – 6.000 KPM" },
    { color: "#4caf7b", label: "Sedang",         range: "1.801 – 2.500 KPM" },
    { color: "#2faebb", label: "Rendah",         range: "≤ 1.800 KPM" },
  ],
  "PKH": [
    { color: "#d4460e", label: "Sangat Tinggi", range: "> 400 KPM" },
    { color: "#e87d2c", label: "Tinggi",        range: "282 – 400 KPM" },
    { color: "#4caf7b", label: "Sedang",         range: "227 – 281 KPM" },
    { color: "#2faebb", label: "Rendah",         range: "≤ 226 KPM" },
  ],
  "Sembako/BPNT": [
    { color: "#d4460e", label: "Sangat Tinggi", range: "> 550 KPM" },
    { color: "#e87d2c", label: "Tinggi",        range: "402 – 550 KPM" },
    { color: "#4caf7b", label: "Sedang",         range: "352 – 401 KPM" },
    { color: "#2faebb", label: "Rendah",         range: "≤ 351 KPM" },
  ],
  "Semua Jenis": [
    { color: "#d4460e", label: "Sangat Tinggi", range: "> 6.000 KPM" },
    { color: "#e87d2c", label: "Tinggi",        range: "3.001 – 6.000 KPM" },
    { color: "#4caf7b", label: "Sedang",         range: "1.001 – 3.000 KPM" },
    { color: "#2faebb", label: "Rendah",         range: "≤ 1.000 KPM" },
  ],
};

export default function MapLegend({ selectedBantuan }: { selectedBantuan: string }) {
  const [open, setOpen] = useState(false);
  const items = LEGEND_MAP[selectedBantuan] || LEGEND_MAP["Semua Jenis"];

  return (
    <div className="bg-card/95 dark:bg-card/90 backdrop-blur-md border border-border rounded-2xl shadow-xl overflow-hidden w-48">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors"
        aria-expanded={open}
        aria-label="Toggle legend distribusi"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md gradient-bg flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
            Legenda
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "200px" : "0px" }}
      >
        <ul className="px-3 pb-3 pt-1 space-y-2 border-t border-border/50">
          {items.map(({ color, label, range }) => (
            <li key={label} className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 0 2px ${color}33`,
                }}
              />
              <div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">
                  {label}
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight">
                  {range}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}