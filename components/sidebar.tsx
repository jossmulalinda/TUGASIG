"use client";

import {
  Home,
  Map,
  BarChart2,
  Database,
  Info,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "peta", label: "Peta Distribusi", icon: Map },
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "data", label: "Data", icon: Database },
  { id: "tentang", label: "Tentang", icon: Info },
];

const BANTUAN_OPTIONS = [
  "Semua Jenis",
  "Sembako/BPNT",
  "PKH",
  "PBI JK",
];

const TAHUN_OPTIONS = ["2026", "2025", "2024", "2023", "2022"];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  selectedBantuan: string;
  onBantuanChange: (val: string) => void;
  selectedTahun: string;
  onTahunChange: (val: string) => void;
}

export default function Sidebar({
  activeNav,
  onNavChange,
  selectedBantuan,
  onBantuanChange,
  selectedTahun,
  onTahunChange,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0"
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo area */}
      <div className="relative flex items-center gap-3 px-5 h-[72px] border-b border-sidebar-border overflow-hidden shrink-0">
        {/* Subtle gradient accent */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md ring-2 ring-white/10">
            <img
              src="/dinsoss-logo.png"
              alt="Dinsoss Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight"
              style={{ color: "var(--sidebar-foreground)" }}>
              Bansos Ternate
            </p>
            <p className="text-[11px] leading-tight"
              style={{ color: "var(--sidebar-accent-foreground)", opacity: 0.55 }}>
              Kota Ternate · Maluku Utara
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--sidebar-accent-foreground)", opacity: 0.4 }}>
          Navigasi
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => onNavChange(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  activeNav === id
                    ? "text-white shadow-md"
                    : "hover:text-white/90"
                )}
                style={
                  activeNav === id
                    ? { background: "var(--gradient-primary)" }
                    : {
                        color: "color-mix(in oklch, var(--sidebar-accent-foreground) 65%, transparent)",
                      }
                }
                onMouseEnter={(e) => {
                  if (activeNav !== id) {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--sidebar-accent)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--sidebar-accent-foreground)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeNav !== id) {
                    (e.currentTarget as HTMLButtonElement).style.background = "";
                    (e.currentTarget as HTMLButtonElement).style.color = "color-mix(in oklch, var(--sidebar-accent-foreground) 65%, transparent)";
                  }
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {activeNav === id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Filters */}
        <div className="mt-6">
          <div
            className="mx-1 h-px mb-4"
            style={{ background: "var(--sidebar-border)" }}
          />
          <p className="px-2 mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--sidebar-accent-foreground)", opacity: 0.4 }}>
            Filter Data
          </p>
          <div className="space-y-3 px-1">
            <div>
              <label
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: "color-mix(in oklch, var(--sidebar-accent-foreground) 60%, transparent)" }}
              >
                Jenis Bantuan
              </label>
              <div className="relative">
                <select
                  value={selectedBantuan}
                  onChange={(e) => onBantuanChange(e.target.value)}
                  className="w-full appearance-none text-sm rounded-xl px-3 py-2.5 pr-8 border focus:outline-none focus:ring-2 cursor-pointer transition-colors"
                  style={{
                    background: "var(--sidebar-accent)",
                    color: "var(--sidebar-accent-foreground)",
                    borderColor: "var(--sidebar-border)",
                    // @ts-ignore
                    "--tw-ring-color": "var(--sidebar-ring)",
                  }}
                >
                  {BANTUAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: "color-mix(in oklch, var(--sidebar-accent-foreground) 45%, transparent)" }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[11px] font-medium mb-1.5"
                style={{ color: "color-mix(in oklch, var(--sidebar-accent-foreground) 60%, transparent)" }}
              >
                Tahun
              </label>
              <div className="relative">
                <select
                  value={selectedTahun}
                  onChange={(e) => onTahunChange(e.target.value)}
                  className="w-full appearance-none text-sm rounded-xl px-3 py-2.5 pr-8 border focus:outline-none focus:ring-2 cursor-pointer transition-colors"
                  style={{
                    background: "var(--sidebar-accent)",
                    color: "var(--sidebar-accent-foreground)",
                    borderColor: "var(--sidebar-border)",
                  }}
                >
                  {TAHUN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: "color-mix(in oklch, var(--sidebar-accent-foreground) 45%, transparent)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 border-t"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <p
          className="text-[10px] text-center"
          style={{ color: "color-mix(in oklch, var(--sidebar-accent-foreground) 35%, transparent)" }}
        >
          © 2026 Pemerintah Kota Ternate
        </p>
      </div>
    </aside>
  );
}
