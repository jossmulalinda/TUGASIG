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
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[73.125px] h-[32.5px] shrink-0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <label className="theme-switch flex items-center shrink-0">
      <input
        type="checkbox"
        className="theme-switch__checkbox"
        checked={isDark}
        onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
        aria-label="Toggle theme mode"
      />
      <div className="theme-switch__container">
        <div className="theme-switch__clouds"></div>
        <div className="theme-switch__stars-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <div className="theme-switch__circle-container">
          <div className="theme-switch__sun-moon-container">
            <div className="theme-switch__moon">
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
              <div className="theme-switch__spot"></div>
            </div>
          </div>
        </div>
      </div>
    </label>
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
        <header className="shrink-0 h-[72px] flex items-center justify-between px-3 sm:px-4 bg-card border-b border-border shadow-sm gap-2">
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
              <div className="relative overflow-hidden w-full bg-gradient-to-br from-card via-muted/30 to-card dark:from-background dark:via-muted/10 dark:to-background border-b border-border">
                {/* Decorative sharp background circles */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.08]" style={{ background: "var(--gradient-primary)", transform: "translate(30%, -30%)" }} />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.08]" style={{ background: "var(--gradient-primary)", transform: "translate(-30%, 30%)" }} />

                <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 lg:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
                  {/* Left Column: Words and CTA */}
                  <div className="col-span-12 md:col-span-7 space-y-5 text-left order-2 md:order-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-border bg-muted/50 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Data Live 2026
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
                      Sistem Informasi
                      <span className="block mt-1" style={{ background: "linear-gradient(to right, #3b82f6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Distribusi Bansos
                      </span>
                      Kota Ternate
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                      Platform peta distribusi bantuan sosial Kota Ternate yang menyajikan data penerima manfaat
                      secara spasial dan interaktif untuk mendukung transparansi dan pengambilan keputusan.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button onClick={() => setActiveNav("peta")} className="px-6 py-3 rounded-xl gradient-bg text-white font-semibold text-sm shadow-lg hover:opacity-95 transition-all transform hover:-translate-y-0.5">
                        Lihat Peta
                      </button>
                      <button onClick={() => setActiveNav("dashboard")} className="px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm border border-border transition-all transform hover:-translate-y-0.5 shadow-sm">
                        Dashboard Statistik
                      </button>
                    </div>

                    {/* Bottom Stats ala WPU */}
                    <div className="pt-8 border-t border-border grid grid-cols-2 gap-4 max-w-md">
                      <div>
                        <p className="text-2xl lg:text-3xl font-extrabold text-foreground">8 Wilayah</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Kecamatan Ternate</p>
                      </div>
                      <div>
                        <p className="text-2xl lg:text-3xl font-extrabold text-foreground">15.000+</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">KPM Terdaftar</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cartoon Sapiens/OpenPeeps Illustration */}
                  <div className="col-span-12 md:col-span-5 flex justify-center order-1 md:order-2">
                    <div className="w-full max-w-[380px] md:max-w-none transition-transform duration-500 hover:scale-105">
                      <img src="/sapiens.svg" alt="Sapiens Illustration" className="w-full h-auto max-h-[350px] md:max-h-[420px] select-none drop-shadow-2xl" />
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
            <div className="relative w-full min-h-[85vh] flex items-center justify-center p-4 md:p-6 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background dark:from-background dark:via-muted/10 dark:to-background">
              {/* Decorative sharp background circles */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.08] pointer-events-none" style={{ background: "var(--gradient-primary)", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.08] pointer-events-none" style={{ background: "var(--gradient-primary)", transform: "translate(-30%, 30%)" }} />

              <div className="relative max-w-xl w-full space-y-4 z-10 animate-fade-in">
                <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border p-5 shadow-sm overflow-hidden relative">
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

                <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border shadow-sm overflow-hidden">
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

                <div className="bg-card/45 backdrop-blur-sm rounded-2xl p-4 border border-border/40">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Program Bantuan</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { name: "Sembako / BPNT", desc: "Bantuan Pangan Non Tunai",                             emoji: "🛒", bg: "bg-blue-500/10" },
                      { name: "PKH",            desc: "Program Keluarga Harapan",                             emoji: "👨‍👩‍👧", bg: "bg-emerald-500/10" },
                      { name: "PBI JKN",        desc: "Penerima Bantuan Iuran Jaminan Kesehatan Nasional",    emoji: "🏥", bg: "bg-rose-500/10" },
                    ].map(({ name, desc, emoji, bg }) => (
                      <div key={name} className="bg-card/90 backdrop-blur-md rounded-xl border border-border px-4 py-3 flex items-center gap-3 animate-fade-in">
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