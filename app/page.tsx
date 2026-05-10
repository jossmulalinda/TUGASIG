"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const DistributionMap = dynamic(() => import("@/components/distribution-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/30">
      <div className="flex items-center gap-2 text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Memuat peta...</span>
      </div>
    </div>
  ),
});

type View = "peta" | "dashboard" | "data" | "home" | "tentang";

const BOTTOM_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "peta", label: "Peta", icon: Map },
  { id: "dashboard", label: "Statistik", icon: BarChart2 },
  { id: "data", label: "Data", icon: Database },
  { id: "tentang", label: "Tentang", icon: Info },
];

const VIEW_TITLES: Record<View, string> = {
  peta: "Peta Distribusi",
  dashboard: "Dashboard Statistik",
  data: "Data Distribusi",
  home: "Beranda",
  tentang: "Tentang Sistem",
};

export default function BansosPage() {
  const [activeNav, setActiveNav] = useState<View>("peta");
  const [selectedBantuan, setSelectedBantuan] = useState("Semua Jenis");
  const [selectedTahun, setSelectedTahun] = useState("2026");
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
        <header className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-card border-b border-border shadow-sm gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/dinsoss-logo.png" alt="Dinsoss Logo" className="w-8 h-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">
                {VIEW_TITLES[activeNav]}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Kota Ternate &middot; {selectedBantuan} &middot; {selectedTahun}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Live Data</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        <div className="flex-1 overflow-auto pb-16 lg:pb-0">

          {/* Map View */}
          {activeNav === "peta" && (
            isTahunTersedia ? (
              <div className="relative h-full w-full min-h-[400px]">
                <DistributionMap
                  selectedBantuan={selectedBantuan}
                  selectedTahun={selectedTahun}
                  onKelurahanSelect={setSelectedKelurahan}
                />
                <div className="absolute bottom-4 left-4 z-[999]">
                  <MapLegend selectedBantuan={selectedBantuan} />
                </div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[999]">
                  <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-md text-[11px] font-medium text-foreground flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-muted-foreground">Filter:</span>
                    <span>{selectedBantuan}</span>
                    <span className="text-border">|</span>
                    <span>{selectedTahun}</span>
                  </div>
                </div>
                {selectedKelurahan && (
                  <>
                    <div className="hidden sm:block absolute top-4 right-4 z-[999]">
                      <KelurahanPopup data={selectedKelurahan} onClose={() => setSelectedKelurahan(null)} />
                    </div>
                    <div className="sm:hidden absolute bottom-0 left-0 right-0 z-[999] p-3 pb-20">
                      <KelurahanPopup data={selectedKelurahan} onClose={() => setSelectedKelurahan(null)} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <ComingSoon label={`Data Tahun ${selectedTahun}`} onBack={() => setSelectedTahun("2026")} />
            )
          )}

          {/* Dashboard View */}
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

          {/* Data View */}
          {activeNav === "data" && (
            isTahunTersedia ? (
              <div className="p-3 md:p-5">
                <DataTable selectedBantuan={selectedBantuan} />
              </div>
            ) : (
              <ComingSoon label={`Data Tahun ${selectedTahun}`} onBack={() => setSelectedTahun("2026")} />
            )
          )}

          {/* Home View */}
          {activeNav === "home" && (
            <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 pt-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-1">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground text-balance">
                  Sistem Informasi Distribusi Bansos
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm text-balance">
                  Platform peta distribusi bantuan sosial Kota Ternate yang menyajikan data penerima manfaat secara spasial dan interaktif untuk mendukung transparansi dan pengambilan keputusan.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { title: "Peta Interaktif", desc: "Visualisasi sebaran penerima bansos per kelurahan" },
                  { title: "Data Terkini", desc: "Informasi penerima manfaat yang diperbarui secara berkala" },
                  { title: "Analisis Spasial", desc: "Statistik dan analisis distribusi berbasis wilayah" },
                ].map(({ title, desc }) => (
                  <div key={title} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tentang View */}
          {activeNav === "tentang" && (
            <div className="p-4 md:p-6 max-w-xl mx-auto pt-8 space-y-4">
              <h2 className="text-xl font-bold text-foreground">Tentang Bansos Ternate</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistem Informasi Geografis Distribusi Bantuan Sosial (SIG Bansos) Kota Ternate merupakan platform digital milik Pemerintah Kota Ternate untuk memonitor dan memvisualisasikan sebaran penerima bantuan sosial di seluruh wilayah Kota Ternate, Provinsi Maluku Utara.
              </p>
              <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-semibold text-sm text-foreground">Informasi Sistem</h3>
                {[
                  ["Versi", "1.0.0"],
                  ["Dikembangkan oleh", "Mahasiswa Informatika Univ. Khairun (TSI, WLD, JGOM, PHARAI)"],
                  ["Data sumber", "Dinas Sosial Kota Ternate"],
                  ["Pembaruan terakhir", "April 2026"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-muted-foreground shrink-0">{k}</span>
                    <span className="font-medium text-foreground text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <div className="flex items-stretch h-16">
            {BOTTOM_NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id as View)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  activeNav === id ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", activeNav === id ? "text-primary" : "text-muted-foreground")} />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </main>
    </div>
  );
}

// Inline chart components for dashboard
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

function DistributionBarChart({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData] = useState<{name: string, penerima: number}[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`http://localhost:8080/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(bansos => {
        const map: Record<string, number> = {};
        bansos.forEach((d: {kecamatan: string, jumlah_kpm: number}) => {
          map[d.kecamatan] = (map[d.kecamatan] || 0) + d.jumlah_kpm;
        });
        const sorted = Object.entries(map)
          .map(([name, penerima]) => ({ name, penerima }))
          .sort((a, b) => b.penerima - a.penerima)
          .slice(0, 8);
        setData(sorted);
      });
  }, [selectedBantuan]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-4">Top 8 Kecamatan Penerima</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString("id-ID"), "Penerima"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <Bar dataKey="penerima" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`oklch(${0.55 + i * 0.02} ${0.18 - i * 0.01} 232)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function KecamatanDonut({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData] = useState<{name: string, value: number}[]>([]);
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6", "#f97316"];

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`http://localhost:8080/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(bansos => {
        const map: Record<string, number> = {};
        bansos.forEach((d: {kecamatan: string, jumlah_kpm: number}) => {
          map[d.kecamatan] = (map[d.kecamatan] || 0) + d.jumlah_kpm;
        });
        setData(Object.entries(map).map(([name, value]) => ({ name, value })));
      });
  }, [selectedBantuan]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-foreground mb-4">Distribusi per Kecamatan</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value.toLocaleString("id-ID"), "Penerima"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}