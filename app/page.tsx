"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Sidebar from "@/components/sidebar";
import MapLegend from "@/components/map-legend";
import KelurahanPopup from "@/components/kelurahan-popup";
import StatsCards from "@/components/stats-cards";
import DataTable from "@/components/data-table";
import type { KelurahanData } from "@/components/distribution-map";
import ComingSoon from "@/components/ui/CommingSoon";
import {
  RefreshCw,
  Layers,
  Home,
  Map,
  BarChart2,
  Database,
  Info,
  Sun,
  Moon,
  Search,
  X,
  ChevronDown,
  FileDown,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DistributionMap = dynamic(() => import("@/components/distribution-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-white animate-spin" />
        </div>
        <span className="text-sm font-medium">Memuat peta...</span>
      </div>
    </div>
  ),
});

type View = "peta" | "dashboard" | "data" | "home" | "tentang";

const BOTTOM_NAV = [
  { id: "home",      label: "Home",      icon: Home },
  { id: "peta",      label: "Peta",      icon: Map },
  { id: "dashboard", label: "Statistik", icon: BarChart2 },
  { id: "data",      label: "Data",      icon: Database },
  { id: "tentang",   label: "Tentang",   icon: Info },
];

const VIEW_TITLES: Record<View, string> = {
  peta:      "Peta Distribusi",
  dashboard: "Dashboard Statistik",
  data:      "Data Distribusi",
  home:      "Beranda",
  tentang:   "Tentang Sistem",
};

const BANTUAN_OPTIONS = ["Semua Jenis", "Sembako/BPNT", "PKH", "PBI JK"];
const TAHUN_OPTIONS   = ["2026", "2025", "2024", "2023", "2022"];

// ── Theme Toggle ──────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="relative w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <Sun  className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
    </button>
  );
}

// ── Mobile Filter Sheet (in-header style) ─────────────────
function MobileFilterHeader({
  selectedBantuan, onBantuanChange,
  selectedTahun,  onTahunChange,
}: {
  selectedBantuan: string; onBantuanChange: (v: string) => void;
  selectedTahun: string;   onTahunChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const hasFilter = selectedBantuan !== "Semua Jenis" || selectedTahun !== "2026";

  return (
    <>
      {/* Trigger button — shown in header on mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka filter"
        className={cn(
          "lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
          hasFilter
            ? "gradient-bg text-white border-transparent"
            : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Filter</span>
        {hasFilter && (
          <span className="w-4 h-4 rounded-full bg-white/25 text-[9px] font-bold flex items-center justify-center">
            {(selectedBantuan !== "Semua Jenis" ? 1 : 0) + (selectedTahun !== "2026" ? 1 : 0)}
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

      {/* Bottom sheet */}
      {open && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[1001] animate-slide-up">
          <div className="bg-card rounded-t-2xl shadow-2xl border-t border-border overflow-hidden">
            {/* Handle */}
            <div className="flex flex-col items-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full bg-border mb-4" />
              <div className="w-full flex items-center justify-between px-5 pb-3 border-b border-border">
                <div>
                  <p className="font-semibold text-base text-foreground">Filter Data</p>
                  <p className="text-xs text-muted-foreground">Pilih jenis bantuan &amp; tahun</p>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-5 pb-8">
              {/* Jenis Bantuan */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Jenis Bantuan</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "Semua Jenis",  label: "Semua Jenis",   emoji: "🗂️" },
                    { value: "Sembako/BPNT", label: "Sembako / BPNT",emoji: "🛒" },
                    { value: "PKH",          label: "PKH",            emoji: "👨‍👩‍👧" },
                    { value: "PBI JK",       label: "PBI JKN",        emoji: "🏥" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onBantuanChange(opt.value)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left transition-all",
                        selectedBantuan === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{opt.emoji}</span>
                      <span className="text-sm font-medium leading-tight">{opt.label}</span>
                      {selectedBantuan === opt.value && <Check className="w-3.5 h-3.5 ml-auto shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tahun */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Tahun</p>
                <div className="flex gap-2 flex-wrap">
                  {TAHUN_OPTIONS.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => onTahunChange(yr)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                        selectedTahun === yr
                          ? "gradient-bg text-white border-transparent shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

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

// ── Main Page ─────────────────────────────────────────────
export default function BansosPage() {
  const [activeNav, setActiveNav]                   = useState<View>("peta");
  const [selectedBantuan, setSelectedBantuan]       = useState("Semua Jenis");
  const [selectedTahun, setSelectedTahun]           = useState("2026");
  const [selectedKelurahan, setSelectedKelurahan]   = useState<KelurahanData | null>(null);
  const [searchQuery, setSearchQuery]               = useState("");
  const [searchInput, setSearchInput]               = useState("");
  const [showSearch, setShowSearch]                 = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const isTahunTersedia = selectedTahun === "2026";

  // Focus search input when shown
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(id) => setActiveNav(id as View)}
        selectedBantuan={selectedBantuan}
        onBantuanChange={setSelectedBantuan}
        selectedTahun={selectedTahun}
        onTahunChange={setSelectedTahun}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Header ──────────────────────────────────── */}
        <header className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-card border-b border-border shadow-sm gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-border">
              <img src="/dinsoss-logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate leading-tight">
                {VIEW_TITLES[activeNav]}
              </h1>
              <p className="text-[10px] text-muted-foreground truncate leading-tight hidden xs:block">
                Kota Ternate · {selectedBantuan} · {selectedTahun}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search bar — map view only */}
            {activeNav === "peta" && (
              <>
                {showSearch ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Cari kecamatan..."
                      className="w-36 sm:w-48 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button type="submit" className="w-7 h-7 flex items-center justify-center rounded-lg gradient-bg text-white">
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowSearch(false); setSearchInput(""); setSearchQuery(""); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    aria-label="Cari kecamatan"
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </>
            )}

            {/* Export PDF — dashboard view only */}
            {activeNav === "dashboard" && (
              <button
                onClick={handleExportPDF}
                aria-label="Export PDF"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            )}

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg gradient-bg-soft text-primary text-xs font-semibold">
              <Layers className="w-3 h-3" />
              <span>Live</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

            {/* Mobile filter — in header */}
            <MobileFilterHeader
              selectedBantuan={selectedBantuan}
              onBantuanChange={setSelectedBantuan}
              selectedTahun={selectedTahun}
              onTahunChange={setSelectedTahun}
            />

            <ThemeToggle />
          </div>
        </header>

        {/* ── Main content ─────────────────────────────── */}
        <div className="flex-1 overflow-auto pb-16 lg:pb-0">

          {/* ── Peta View ──────────────────────────────── */}
          {activeNav === "peta" && (
            isTahunTersedia ? (
              <div className="relative h-full w-full min-h-[400px]">
                <DistributionMap
                  selectedBantuan={selectedBantuan}
                  selectedTahun={selectedTahun}
                  onKelurahanSelect={setSelectedKelurahan}
                  searchQuery={searchQuery}
                />
                {/* Legend — bottom left, above mobile nav */}
                <div className="absolute bottom-20 left-3 z-[999] lg:bottom-4 lg:left-4">
                  <MapLegend selectedBantuan={selectedBantuan} />
                </div>
                {/* Popup — desktop */}
                {selectedKelurahan && (
                  <>
                    <div className="hidden sm:block absolute top-4 right-4 z-[999]">
                      <KelurahanPopup
                        data={selectedKelurahan}
                        onClose={() => setSelectedKelurahan(null)}
                      />
                    </div>
                    {/* Popup — mobile, above bottom nav */}
                    <div className="sm:hidden absolute bottom-[68px] left-2 right-2 z-[999]">
                      <KelurahanPopup
                        data={selectedKelurahan}
                        onClose={() => setSelectedKelurahan(null)}
                        isMobile
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <ComingSoon label={`Data Tahun ${selectedTahun}`} onBack={() => setSelectedTahun("2026")} />
            )
          )}

          {/* ── Dashboard View ──────────────────────────── */}
          {activeNav === "dashboard" && (
            isTahunTersedia ? (
              <div id="dashboard-print" className="p-4 md:p-5 space-y-4">
                <StatsCards selectedBantuan={selectedBantuan} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DistributionBarChart selectedBantuan={selectedBantuan} />
                  <KecamatanDonut selectedBantuan={selectedBantuan} />
                </div>
              </div>
            ) : (
              <ComingSoon label={`Data Tahun ${selectedTahun}`} onBack={() => setSelectedTahun("2026")} />
            )
          )}

          {/* ── Data View ────────────────────────────────── */}
          {activeNav === "data" && (
            isTahunTersedia ? (
              <div className="p-3 md:p-5">
                <DataTable selectedBantuan={selectedBantuan} />
              </div>
            ) : (
              <ComingSoon label={`Data Tahun ${selectedTahun}`} onBack={() => setSelectedTahun("2026")} />
            )
          )}

          {/* ── Home View ────────────────────────────────── */}
          {activeNav === "home" && (
            <div className="animate-fade-in w-full">
              {/* Hero Banner Section */}
              <div className="relative overflow-hidden w-full" style={{ background: "var(--gradient-hero)" }}>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-[60px]" style={{ background: "var(--gradient-primary)", transform: "translate(20%, -20%)" }} />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-[50px]" style={{ background: "var(--gradient-primary)", transform: "translate(-20%, 20%)" }} />

                <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 lg:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Column: Words and CTA */}
                  <div className="col-span-12 md:col-span-7 space-y-5 text-left order-2 md:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-white/20 text-white/70 bg-white/10 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Data Live 2026
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                      Sistem Informasi
                      <span className="block mt-1" style={{ background: "linear-gradient(to right, #93c5fd, #67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Distribusi Bansos
                      </span>
                      Kota Ternate
                    </h2>
                    <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-xl">
                      Platform peta distribusi bantuan sosial Kota Ternate yang menyajikan data penerima manfaat
                      secara spasial dan interaktif untuk mendukung transparansi dan pengambilan keputusan.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button onClick={() => setActiveNav("peta")} className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold text-sm shadow-lg hover:opacity-95 transition-all transform hover:-translate-y-0.5">
                        Lihat Peta
                      </button>
                      <button onClick={() => setActiveNav("dashboard")} className="px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-sm backdrop-blur-sm hover:bg-white/20 transition-all transform hover:-translate-y-0.5">
                        Dashboard Statistik
                      </button>
                    </div>

                    {/* Bottom Stats ala WPU */}
                    <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4 max-w-md">
                      <div>
                        <p className="text-2xl lg:text-3xl font-extrabold text-white">8 Wilayah</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">Kecamatan Ternate</p>
                      </div>
                      <div>
                        <p className="text-2xl lg:text-3xl font-extrabold text-white">15.000+</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">KPM Terdaftar</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cartoon Sapiens/OpenPeeps Illustration */}
                  <div className="col-span-12 md:col-span-5 flex justify-center order-1 md:order-2">
                    <div className="w-full max-w-[340px] md:max-w-none transition-transform duration-500 hover:scale-105">
                      <svg viewBox="0 0 500 500" className="w-full h-auto select-none drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                          </linearGradient>
                          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Glowing Aura behind globe */}
                        <circle cx="320" cy="220" r="140" fill="url(#glow)" />

                        {/* The Globe Grid Lines (holographic/data lines) */}
                        <g opacity="0.85">
                          {/* Outer Sphere */}
                          <circle cx="320" cy="220" r="100" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="4 4" />
                          <circle cx="320" cy="220" r="100" fill="url(#globe-grad)" opacity="0.15" />
                          
                          {/* Longitudes & Latitudes */}
                          <ellipse cx="320" cy="220" rx="100" ry="40" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
                          <ellipse cx="320" cy="220" rx="40" ry="100" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
                          <ellipse cx="320" cy="220" rx="100" ry="70" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />
                          <line x1="220" y1="220" x2="420" y2="220" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
                          <line x1="320" y1="120" x2="320" y2="320" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />

                          {/* Connecting Data Lines */}
                          <path d="M 270,160 Q 300,140 350,180" stroke="#67e8f9" strokeWidth="2" fill="none" strokeDasharray="2 2" />
                          <path d="M 260,250 Q 330,280 370,200" stroke="#67e8f9" strokeWidth="2" fill="none" />
                          
                          {/* Data Points (Glowing Dots) */}
                          <circle cx="270" cy="160" r="5" fill="#22d3ee" />
                          <circle cx="270" cy="160" r="9" stroke="#22d3ee" strokeWidth="1.5" opacity="0.4" />
                          
                          <circle cx="350" cy="180" r="4" fill="#3b82f6" />
                          <circle cx="260" cy="250" r="6" fill="#22d3ee" />
                          <circle cx="260" cy="250" r="10" stroke="#22d3ee" strokeWidth="1.5" opacity="0.3" />
                          
                          <circle cx="370" cy="200" r="5" fill="#67e8f9" />
                          <circle cx="330" cy="230" r="4" fill="#3b82f6" />
                        </g>

                        {/* Floating Data Cards/Charts around globe */}
                        <g opacity="0.95" transform="translate(360, 80)">
                          <rect width="90" height="50" rx="8" fill="#1e293b" fillOpacity="0.8" stroke="#334155" strokeWidth="1.5" />
                          <path d="M10,35 L30,20 L50,30 L80,15" stroke="#22d3ee" strokeWidth="2" fill="none" strokeLinecap="round" />
                          <circle cx="80" cy="15" r="3" fill="#22d3ee" />
                        </g>
                        <g opacity="0.95" transform="translate(200, 310)">
                          <rect width="110" height="40" rx="8" fill="#1e293b" fillOpacity="0.8" stroke="#334155" strokeWidth="1.5" />
                          <rect x="12" y="12" width="25" height="6" rx="3" fill="#64748b" />
                          <rect x="12" y="22" width="50" height="6" rx="3" fill="#3b82f6" />
                          <circle cx="92" cy="20" r="7" fill="#10b981" />
                        </g>

                        {/* Sapiens/OpenPeeps Style Cartoon Character */}
                        <g transform="translate(60, 100)">
                          {/* Shadow beneath character */}
                          <ellipse cx="90" cy="290" rx="70" ry="10" fill="#000000" fillOpacity="0.2" />

                          {/* Seat / Chair Block */}
                          <path d="M 40,285 L 120,285 L 110,210 L 50,210 Z" fill="#334155" stroke="#1e293b" strokeWidth="3" />
                          
                          {/* Pants / Legs */}
                          <path d="M 65,210 L 60,265 L 80,265 L 80,210 Z" fill="#64748b" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
                          <path d="M 90,210 L 95,265 L 115,265 L 110,210 Z" fill="#64748b" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
                          {/* Shoes */}
                          <path d="M 60,265 Q 45,265 45,275 L 80,275 L 80,265 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
                          <path d="M 95,265 Q 110,265 110,275 L 120,275 L 115,265 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />

                          {/* Torso / Shirt */}
                          <path d="M 60,210 Q 55,130 75,130 L 105,130 Q 115,160 110,210 Z" fill="#3b82f6" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />

                          {/* Neck */}
                          <rect x="82" y="115" width="12" height="20" fill="#fbcfe8" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
                          
                          {/* Head (OpenPeeps style) */}
                          <circle cx="88" cy="92" r="28" fill="#fbcfe8" stroke="#1e293b" strokeWidth="3" />
                          
                          {/* Hair (Thick outline) */}
                          <path d="M 62,88 C 60,70 70,62 88,60 C 105,58 118,72 116,90 C 110,85 105,92 100,90 C 95,85 90,88 88,88 C 75,88 70,82 62,88 Z" fill="#1e293b" stroke="#1e293b" strokeWidth="3" strokeLinejoin="round" />
                          
                          {/* Glasses */}
                          <circle cx="98" cy="92" r="8" stroke="#1e293b" strokeWidth="2.5" fill="none" />
                          <line x1="106" y1="92" x2="114" y2="92" stroke="#1e293b" strokeWidth="2.5" />
                          
                          {/* Smile & Nose */}
                          <path d="M 112,98 Q 110,103 105,101" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 116,95 Q 118,95 117,98" stroke="#1e293b" strokeWidth="2" fill="none" />

                          {/* Left arm resting on lap */}
                          <path d="M 62,140 Q 50,180 75,190" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                          
                          {/* Right arm pointing towards the globe */}
                          <path d="M 100,145 Q 140,120 180,140" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {/* Hand */}
                          <circle cx="184" cy="140" r="5" fill="#fbcfe8" stroke="#1e293b" strokeWidth="2.5" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitur Utama Section */}
              <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Fitur Utama</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Map,      title: "Peta Spasial",        desc: "Visualisasi sebaran penerima bansos per kecamatan secara real-time", color: "text-blue-500", bg: "bg-blue-500/10", action: "peta" as View },
                    { icon: BarChart2,title: "Dashboard Analitik",   desc: "Grafik dan analisis distribusi berbasis wilayah yang komprehensif",   color: "text-cyan-500", bg: "bg-cyan-500/10", action: "dashboard" as View },
                    { icon: Database, title: "Tabel Data Lengkap",  desc: "Tabel data lengkap dengan fitur pencarian dan unduh Excel",           color: "text-violet-500", bg: "bg-violet-500/10", action: "data" as View },
                  ].map(({ icon: Icon, title, desc, color, bg, action }) => (
                    <button key={title} onClick={() => setActiveNav(action)} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 text-left group">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                        <Icon className={`${color}`} size={20} />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground mb-1.5 group-hover:text-primary transition-colors">{title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tentang View ─────────────────────────────── */}
          {activeNav === "tentang" && (
            <div className="animate-fade-in p-4 md:p-6 max-w-xl mx-auto pt-6 space-y-4">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-1 gradient-bg" />
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-border shadow-sm">
                    <img src="/dinsoss-logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground leading-tight">Bansos Ternate</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Sistem Informasi Geografis Distribusi Bantuan Sosial</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full gradient-bg text-white font-semibold">v1.0.0</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">Live</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                  Platform digital milik Pemerintah Kota Ternate untuk memonitor dan memvisualisasikan sebaran penerima bantuan sosial di seluruh wilayah Kota Ternate, Provinsi Maluku Utara.
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Informasi Sistem</p>
                </div>
                <div className="divide-y divide-border/60">
                  {[
                    ["Dikembangkan oleh", "Mahasiswa Informatika Univ. Khairun"],
                    ["Tim", "TSI · WLD · JGOM · PHARAI"],
                    ["Sumber Data", "Dinas Sosial Kota Ternate"],
                    ["Pembaruan terakhir", "April 2026"],
                    ["Teknologi", "Next.js · Leaflet · PostgreSQL"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between px-4 py-2.5 gap-3">
                      <span className="text-[11px] text-muted-foreground shrink-0">{k}</span>
                      <span className="font-medium text-[11px] text-foreground text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Program Bantuan</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: "Sembako / BPNT", desc: "Bantuan Pangan Non Tunai",                             emoji: "🛒", bg: "bg-blue-500/10" },
                    { name: "PKH",            desc: "Program Keluarga Harapan",                             emoji: "👨‍👩‍👧", bg: "bg-emerald-500/10" },
                    { name: "PBI JKN",        desc: "Penerima Bantuan Iuran Jaminan Kesehatan Nasional",    emoji: "🏥", bg: "bg-rose-500/10" },
                  ].map(({ name, desc, emoji, bg }) => (
                    <div key={name} className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${bg}`}>{emoji}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-[11px] text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile bottom nav ────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-2px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-stretch h-16">
            {BOTTOM_NAV.map(({ id, label, icon: Icon }) => {
              const isActive = activeNav === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveNav(id as View)}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all duration-200 relative pt-1",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full transition-all duration-300",
                    isActive ? "w-8 gradient-bg" : "w-0"
                  )} />
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                    isActive ? "gradient-bg-soft" : ""
                  )}>
                    <Icon className={cn("transition-all duration-200", isActive ? "text-primary scale-110" : "text-muted-foreground")} size={18} />
                  </div>
                  <span className={isActive ? "font-bold" : ""}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          .lg\\:hidden, nav, header, aside { display: none !important; }
          #dashboard-print { padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

// ── Inline chart components ───────────────────────────────
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";

function DistributionBarChart({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData]     = useState<{ name: string; penerima: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bansos?${params.toString()}`)
      .then(r => r.json())
      .then(bansos => {
        const map: Record<string, number> = {};
        bansos.forEach((d: { kecamatan: string; jumlah_kpm: number }) => {
          map[d.kecamatan] = (map[d.kecamatan] || 0) + d.jumlah_kpm;
        });
        setData(Object.entries(map).map(([name, penerima]) => ({ name, penerima })).sort((a, b) => b.penerima - a.penerima).slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedBantuan]);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-1">Top 8 Kecamatan Penerima</h3>
      <p className="text-[11px] text-muted-foreground mb-4">{selectedBantuan} · 2026</p>
      {loading ? <div className="h-[220px] bg-muted rounded-xl animate-pulse" /> : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [v.toLocaleString("id-ID"), "Penerima"]} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }} />
            <Bar dataKey="penerima" radius={[5, 5, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={`oklch(${0.52 + i * 0.018} ${0.20 - i * 0.012} ${232 - i * 3})`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function KecamatanDonut({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData]       = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#f97316"];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bansos?${params.toString()}`)
      .then(r => r.json())
      .then(bansos => {
        const map: Record<string, number> = {};
        bansos.forEach((d: { kecamatan: string; jumlah_kpm: number }) => {
          map[d.kecamatan] = (map[d.kecamatan] || 0) + d.jumlah_kpm;
        });
        setData(Object.entries(map).map(([name, value]) => ({ name, value })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedBantuan]);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-1">Distribusi per Kecamatan</h3>
      <p className="text-[11px] text-muted-foreground mb-4">{selectedBantuan} · 2026</p>
      {loading ? <div className="h-[220px] bg-muted rounded-xl animate-pulse" /> : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => [v.toLocaleString("id-ID"), "Penerima"]} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}