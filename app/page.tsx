"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Sidebar from "@/components/sidebar";
import MapLegend from "@/components/map-legend";
import KelurahanPopup from "@/components/kelurahan-popup";
import StatsCards from "@/components/stats-cards";
import DataTable from "@/components/data-table";
import MobileFilterSheet from "@/components/mobile-filter-sheet";
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
  { id: "home",      label: "Home",     icon: Home },
  { id: "peta",      label: "Peta",     icon: Map },
  { id: "dashboard", label: "Statistik",icon: BarChart2 },
  { id: "data",      label: "Data",     icon: Database },
  { id: "tentang",   label: "Tentang",  icon: Info },
];

const VIEW_TITLES: Record<View, string> = {
  peta:      "Peta Distribusi",
  dashboard: "Dashboard Statistik",
  data:      "Data Distribusi",
  home:      "Beranda",
  tentang:   "Tentang Sistem",
};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
      <Moon className="w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default function BansosPage() {
  const [activeNav, setActiveNav]           = useState<View>("peta");
  const [selectedBantuan, setSelectedBantuan] = useState("Semua Jenis");
  const [selectedTahun, setSelectedTahun]   = useState("2026");
  const [selectedKelurahan, setSelectedKelurahan] = useState<KelurahanData | null>(null);

  const isTahunTersedia = selectedTahun === "2026";

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
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-card border-b border-border shadow-sm gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-1 ring-border">
              <img src="/dinsoss-logo.png" alt="Dinsoss Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate leading-tight">
                {VIEW_TITLES[activeNav]}
              </h1>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                Kota Ternate · {selectedBantuan} · {selectedTahun}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg gradient-bg-soft text-primary text-xs font-semibold">
              <Layers className="w-3 h-3" />
              <span>Live</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-auto pb-16 lg:pb-0">

          {/* ── Peta View ─────────────────────────────── */}
          {activeNav === "peta" && (
            isTahunTersedia ? (
              <div className="relative h-full w-full min-h-[400px]">
                <DistributionMap
                  selectedBantuan={selectedBantuan}
                  selectedTahun={selectedTahun}
                  onKelurahanSelect={setSelectedKelurahan}
                />
                {/* Legend — bottom left, clear of mobile nav */}
                <div className="absolute bottom-20 left-3 z-[999] lg:bottom-4 lg:left-4">
                  <MapLegend selectedBantuan={selectedBantuan} />
                </div>
                {/* Filter chip — top center */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[999]">
                  <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-md text-[11px] font-medium text-foreground flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-muted-foreground">Filter:</span>
                    <span className="text-primary font-semibold">{selectedBantuan}</span>
                    <span className="text-border">|</span>
                    <span>{selectedTahun}</span>
                  </div>
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
                    {/* Popup — mobile bottom sheet above nav */}
                    <div className="sm:hidden absolute bottom-16 left-0 right-0 z-[999] px-3">
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

          {/* ── Dashboard View ─────────────────────────── */}
          {activeNav === "dashboard" && (
            isTahunTersedia ? (
              <div className="p-4 md:p-5 space-y-4">
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

          {/* ── Data View ──────────────────────────────── */}
          {activeNav === "data" && (
            isTahunTersedia ? (
              <div className="p-3 md:p-5">
                <DataTable selectedBantuan={selectedBantuan} />
              </div>
            ) : (
              <ComingSoon label={`Data Tahun ${selectedTahun}`} onBack={() => setSelectedTahun("2026")} />
            )
          )}

          {/* ── Home View ──────────────────────────────── */}
          {activeNav === "home" && (
            <div className="animate-fade-in">
              {/* Hero */}
              <div
                className="relative px-5 py-10 md:py-14 overflow-hidden"
                style={{ background: "var(--gradient-hero)" }}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                  style={{ background: "var(--gradient-primary)", transform: "translate(30%, -30%)" }} />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
                  style={{ background: "var(--gradient-primary)", transform: "translate(-30%, 30%)" }} />

                <div className="relative max-w-2xl mx-auto text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-white/20 text-white/70 bg-white/10 backdrop-blur-sm mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Data Live 2026
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                    Sistem Informasi
                    <span className="block gradient-text bg-gradient-to-r from-blue-300 to-cyan-300">
                      Distribusi Bansos
                    </span>
                    Kota Ternate
                  </h2>
                  <p className="text-sm text-white/65 leading-relaxed max-w-lg mx-auto">
                    Platform peta distribusi bantuan sosial Kota Ternate yang menyajikan data
                    penerima manfaat secara spasial dan interaktif untuk mendukung transparansi
                    dan pengambilan keputusan.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveNav("peta")}
                      className="px-5 py-2.5 rounded-xl gradient-bg text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
                    >
                      Lihat Peta
                    </button>
                    <button
                      onClick={() => setActiveNav("dashboard")}
                      className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Feature cards */}
              <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Fitur Utama
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: Map,
                      title: "Peta Interaktif",
                      desc: "Visualisasi sebaran penerima bansos per kecamatan secara real-time",
                      color: "text-blue-500",
                      bg: "bg-blue-500/10",
                      action: "peta" as View,
                    },
                    {
                      icon: BarChart2,
                      title: "Dashboard Statistik",
                      desc: "Grafik dan analisis distribusi berbasis wilayah yang komprehensif",
                      color: "text-cyan-500",
                      bg: "bg-cyan-500/10",
                      action: "dashboard" as View,
                    },
                    {
                      icon: Database,
                      title: "Data Tabel",
                      desc: "Tabel data lengkap dengan fitur pencarian dan unduh Excel",
                      color: "text-violet-500",
                      bg: "bg-violet-500/10",
                      action: "data" as View,
                    },
                  ].map(({ icon: Icon, title, desc, color, bg, action }) => (
                    <button
                      key={title}
                      onClick={() => setActiveNav(action)}
                      className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 text-left group"
                    >
                      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                        <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
                      </div>
                      <h4 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                        {title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tentang View ───────────────────────────── */}
          {activeNav === "tentang" && (
            <div className="animate-fade-in p-4 md:p-6 max-w-xl mx-auto pt-6 space-y-4">
              {/* Header */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm overflow-hidden relative">
                <div
                  className="absolute inset-x-0 top-0 h-1 gradient-bg"
                />
                <div className="flex items-start gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-border shadow-sm">
                    <img src="/dinsoss-logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground leading-tight">
                      Bansos Ternate
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sistem Informasi Geografis Distribusi Bantuan Sosial
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full gradient-bg text-white font-semibold">
                        v1.0.0
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Live
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-4">
                  Platform digital milik Pemerintah Kota Ternate untuk memonitor dan
                  memvisualisasikan sebaran penerima bantuan sosial di seluruh wilayah
                  Kota Ternate, Provinsi Maluku Utara.
                </p>
              </div>

              {/* System info */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Informasi Sistem
                  </p>
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

              {/* Program cards */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Program Bantuan
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: "Sembako / BPNT", desc: "Bantuan Pangan Non Tunai", emoji: "🛒", color: "text-blue-500 bg-blue-500/10" },
                    { name: "PKH", desc: "Program Keluarga Harapan", emoji: "👨‍👩‍👧", color: "text-emerald-500 bg-emerald-500/10" },
                    { name: "PBI JKN", desc: "Penerima Bantuan Iuran Jaminan Kesehatan Nasional", emoji: "🏥", color: "text-rose-500 bg-rose-500/10" },
                  ].map(({ name, desc, emoji, color }) => (
                    <div key={name} className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${color.split(" ")[1]}`}>
                        {emoji}
                      </div>
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

        {/* ── Mobile bottom nav ───────────────────────── */}
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
                  {/* Active pill indicator */}
                  <span
                    className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full transition-all duration-300",
                      isActive ? "w-8 gradient-bg" : "w-0 bg-transparent"
                    )}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                      isActive ? "gradient-bg-soft" : ""
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4.5 h-4.5 transition-all duration-200",
                        isActive ? "text-primary scale-110" : "text-muted-foreground"
                      )}
                      size={18}
                    />
                  </div>
                  <span className={isActive ? "font-semibold" : ""}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile filter FAB — visible on all views */}
        <MobileFilterSheet
          selectedBantuan={selectedBantuan}
          onBantuanChange={setSelectedBantuan}
          selectedTahun={selectedTahun}
          onTahunChange={setSelectedTahun}
        />
      </main>
    </div>
  );
}

// ── Inline chart components ───────────────────────────────
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

function DistributionBarChart({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData] = useState<{ name: string; penerima: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(bansos => {
        const map: Record<string, number> = {};
        bansos.forEach((d: { kecamatan: string; jumlah_kpm: number }) => {
          map[d.kecamatan] = (map[d.kecamatan] || 0) + d.jumlah_kpm;
        });
        setData(
          Object.entries(map)
            .map(([name, penerima]) => ({ name, penerima }))
            .sort((a, b) => b.penerima - a.penerima)
            .slice(0, 8)
        );
        setLoading(false);
      });
  }, [selectedBantuan]);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-1">Top 8 Kecamatan Penerima</h3>
      <p className="text-[11px] text-muted-foreground mb-4">{selectedBantuan} · 2026</p>
      {loading ? (
        <div className="h-[220px] bg-muted rounded-xl animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString("id-ID"), "Penerima"]}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}
            />
            <Bar dataKey="penerima" radius={[5, 5, 0, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={`oklch(${0.52 + i * 0.018} ${0.20 - i * 0.012} ${232 - i * 3})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function KecamatanDonut({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const COLORS = [
    "#3b82f6", "#06b6d4", "#10b981", "#f59e0b",
    "#8b5cf6", "#ef4444", "#ec4899", "#f97316",
  ];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(bansos => {
        const map: Record<string, number> = {};
        bansos.forEach((d: { kecamatan: string; jumlah_kpm: number }) => {
          map[d.kecamatan] = (map[d.kecamatan] || 0) + d.jumlah_kpm;
        });
        setData(Object.entries(map).map(([name, value]) => ({ name, value })));
        setLoading(false);
      });
  }, [selectedBantuan]);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-1">Distribusi per Kecamatan</h3>
      <p className="text-[11px] text-muted-foreground mb-4">{selectedBantuan} · 2026</p>
      {loading ? (
        <div className="h-[220px] bg-muted rounded-xl animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value.toLocaleString("id-ID"), "Penerima"]}
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}