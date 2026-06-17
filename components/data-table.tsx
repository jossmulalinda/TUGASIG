"use client";

import { useState, useEffect } from "react";
import { Search, Download, ArrowUpDown, ChevronDown, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface BansosData {
  id: number;
  kecamatan: string;
  jenis_bantuan: string;
  jumlah_kpm: number;
  tahun: number;
}

type Level = "very-high" | "high" | "medium" | "low";

const LEVEL_BADGE: Record<Level, string> = {
  "very-high": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  low: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
};

const LEVEL_LABEL: Record<Level, string> = {
  "very-high": "Sangat Tinggi",
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const LEVEL_DOT: Record<Level, string> = {
  "very-high": "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-teal-500",
};

function getLevel(kpm: number, jenisBantuan: string): Level {
  if (jenisBantuan === "PBI JK") {
    if (kpm > 6000) return "very-high";
    if (kpm > 2500) return "high";
    if (kpm > 1800) return "medium";
    return "low";
  }
  if (jenisBantuan === "PKH") {
    if (kpm > 400) return "very-high";
    if (kpm > 281) return "high";
    if (kpm > 226) return "medium";
    return "low";
  }
  if (jenisBantuan === "Sembako/BPNT") {
    if (kpm > 550) return "very-high";
    if (kpm > 401) return "high";
    if (kpm > 351) return "medium";
    return "low";
  }
  if (kpm > 6000) return "very-high";
  if (kpm > 3000) return "high";
  if (kpm > 1000) return "medium";
  return "low";
}

export default function DataTable({ selectedBantuan }: { selectedBantuan: string }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "abjad" | "kpm_desc" | "kpm_asc">("kpm_desc");
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<BansosData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(result => { setData(result); setLoading(false); })
      .catch(err => { console.error("Error fetching data:", err); setLoading(false); });
  }, [selectedBantuan]);

  const getFilteredAndSorted = () => {
    const list = data.filter(k =>
      k.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
      k.jenis_bantuan.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "abjad") {
      return list.sort((a, b) => a.kecamatan.localeCompare(b.kecamatan));
    }
    if (sortBy === "kpm_desc") {
      return list.sort((a, b) => b.jumlah_kpm - a.jumlah_kpm);
    }
    if (sortBy === "kpm_asc") {
      return list.sort((a, b) => a.jumlah_kpm - b.jumlah_kpm);
    }
    return list;
  };

  const filtered = getFilteredAndSorted();

  const totalKpm = filtered.reduce((s, k) => s + k.jumlah_kpm, 0);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const XLSX = await import("xlsx");
      const rows = data.map((k, idx) => ({
        "No": idx + 1,
        "Kecamatan": k.kecamatan,
        "Jenis Bantuan": k.jenis_bantuan,
        "Jumlah KPM": k.jumlah_kpm,
        "Tahun": k.tahun,
        "Tingkat Distribusi": LEVEL_LABEL[getLevel(k.jumlah_kpm, selectedBantuan === "Semua Jenis" ? k.jenis_bantuan : selectedBantuan)],
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 10 }, { wch: 20 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Distribusi Bansos");
      XLSX.writeFile(workbook, "distribusi-bansos-ternate.xlsx");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="px-4 py-3.5 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Data Distribusi per Kecamatan</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tahun 2026 · {selectedBantuan}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 no-print">
            {/* Download Excel */}
            <button
              onClick={handleDownloadExcel}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl gradient-bg text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity font-semibold shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{downloading ? "Mengunduh..." : "Excel"}</span>
              <span className="sm:hidden">{downloading ? "..." : "Excel"}</span>
            </button>
            {/* Print PDF */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-semibold shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kecamatan atau jenis bantuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none text-xs rounded-xl px-3 py-2 pr-8 border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground font-semibold cursor-pointer transition-colors"
            >
              <option value="default">Default</option>
              <option value="abjad">Abjad (A-Z)</option>
              <option value="kpm_desc">KPM Terbanyak</option>
              <option value="kpm_asc">KPM Terkecil</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Desktop table */}
      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">No</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Kecamatan</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Jenis Bantuan</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Jumlah KPM</th>
                  <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((k, i) => {
                  const lvl = getLevel(k.jumlah_kpm, selectedBantuan === "Semua Jenis" ? k.jenis_bantuan : selectedBantuan);
                  return (
                    <tr
                      key={k.id}
                      className={cn(
                        "border-b border-border/60 hover:bg-muted/30 transition-colors",
                        i % 2 === 1 ? "bg-muted/10" : ""
                      )}
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-foreground text-sm">{k.kecamatan}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{k.jenis_bantuan}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground tabular-nums">
                        {k.jumlah_kpm.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[lvl]}`}>
                          {LEVEL_LABEL[lvl]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary row */}
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                    Total ({filtered.length} data)
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-foreground tabular-nums text-sm">
                    {totalKpm.toLocaleString("id-ID")}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden divide-y divide-border/60">
            {filtered.map((k, i) => {
              const lvl = getLevel(k.jumlah_kpm, selectedBantuan === "Semua Jenis" ? k.jenis_bantuan : selectedBantuan);
              return (
                <div
                  key={k.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${LEVEL_DOT[lvl]}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {k.kecamatan}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {k.jenis_bantuan}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-foreground text-sm tabular-nums">
                      {k.jumlah_kpm.toLocaleString("id-ID")}
                    </p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${LEVEL_BADGE[lvl]}`}>
                      {LEVEL_LABEL[lvl]}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Mobile summary */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t-2 border-border">
              <p className="text-xs font-semibold text-muted-foreground">
                Total ({filtered.length} data)
              </p>
              <p className="font-bold text-foreground text-sm tabular-nums">
                {totalKpm.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </>
      )}

      <div className="px-4 py-2.5 border-t border-border bg-muted/20 no-print">
        <p className="text-[11px] text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari{" "}
          <span className="font-semibold text-foreground">{data.length}</span> data
          {selectedBantuan !== "Semua Jenis" && (
            <span className="text-primary font-medium"> · {selectedBantuan}</span>
          )}
        </p>
      </div>
    </div>
  );
}