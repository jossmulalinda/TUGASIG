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
  "PKH",
  "BPNT",
  "BST",
  "BLT Dana Desa",
  "Bansos Tunai",
];

const TAHUN_OPTIONS = ["2026", "2025", "2024", "2023", "2022"];

interface SidebarContentProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  selectedBantuan: string;
  onBantuanChange: (val: string) => void;
  selectedTahun: string;
  onTahunChange: (val: string) => void;
}

export default function SidebarContent({
  activeNav,
  onNavChange,
  selectedBantuan,
  onBantuanChange,
  selectedTahun,
  onTahunChange,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--sidebar-border)]">
        <img
          src="/dinsoss-logo.png"
          alt="Dinsoss Logo"
          className="w-10 h-10 shrink-0"
        />
        <div>
          <p className="text-sm font-bold text-[var(--sidebar-foreground)] leading-tight">
            Persebaran Bantuan
          </p>
          <p className="text-xs text-[var(--sidebar-accent-foreground)]/60 leading-tight">
            Kota Ternate
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--sidebar-accent-foreground)]/40">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => {
                  onNavChange(id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeNav === id
                    ? "bg-[var(--sidebar-primary)] text-white"
                    : "text-[var(--sidebar-accent-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Filters */}
        <div className="mt-6">
          <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--sidebar-accent-foreground)]/40">
            Filter
          </p>
          <div className="space-y-3 px-1">
            <div>
              <label className="block text-xs text-[var(--sidebar-accent-foreground)]/60 mb-1.5">
                Jenis Bantuan
              </label>
              <div className="relative">
                <select
                  value={selectedBantuan}
                  onChange={(e) => onBantuanChange(e.target.value)}
                  className="w-full appearance-none bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] text-sm rounded-lg px-3 py-2 pr-8 border border-[var(--sidebar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-primary)] cursor-pointer"
                >
                  {BANTUAN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--sidebar-accent-foreground)]/50 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--sidebar-accent-foreground)]/60 mb-1.5">
                Tahun
              </label>
              <div className="relative">
                <select
                  value={selectedTahun}
                  onChange={(e) => onTahunChange(e.target.value)}
                  className="w-full appearance-none bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] text-sm rounded-lg px-3 py-2 pr-8 border border-[var(--sidebar-border)] focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-primary)] cursor-pointer"
                >
                  {TAHUN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--sidebar-accent-foreground)]/50 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[var(--sidebar-border)]">
        <p className="text-xs text-[var(--sidebar-accent-foreground)]/40 text-center">
          © 2026 Pemkot Ternate
        </p>
      </div>
    </div>
  );
}

