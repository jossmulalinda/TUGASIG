"use client";

import { useState, useEffect } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";

interface BansosData {
  id: number;
  kecamatan: string;
  jenis_bantuan: string;
  jumlah_kpm: number;
  tahun: number;
}

type Level = "very-high" | "high" | "medium" | "low";

const LEVEL_BADGE: Record<Level, string> = {
  "very-high": "bg-red-100 text-red-700",
  "high": "bg-orange-100 text-orange-700",
  "medium": "bg-yellow-100 text-yellow-700",
  "low": "bg-teal-100 text-teal-700",
};

const LEVEL_LABEL: Record<Level, string> = {
  "very-high": "Sangat Tinggi",
  "high": "Tinggi",
  "medium": "Sedang",
  "low": "Rendah",
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
  const [sortBy, setSortBy] = useState<"penerima">("penerima");
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<BansosData[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`http://localhost:8080/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(result => setData(result))
      .catch(err => console.error("Error fetching data:", err));
  }, [selectedBantuan]);

  const filtered = data
    .filter(k =>
      k.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
      k.jenis_bantuan.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.jumlah_kpm - a.jumlah_kpm);

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
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 18 },
        { wch: 15 },
        { wch: 10 },
        { wch: 20 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Distribusi Bansos");
      XLSX.writeFile(workbook, "distribusi-bansos-ternate.xlsx");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground">Data Distribusi per Kecamatan</h3>
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{downloading ? "Mengunduh..." : "Unduh Excel"}</span>
            <span className="sm:hidden">{downloading ? "..." : "Excel"}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kecamatan atau jenis bantuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setSortBy("penerima")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background hover:bg-muted transition-colors shrink-0"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="hidden sm:inline">Penerima</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Kecamatan</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Jenis Bantuan</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Jumlah KPM</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k, i) => (
              <tr
                key={k.id}
                className={`border-b border-border/60 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">{k.kecamatan}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{k.jenis_bantuan}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">
                  {k.jumlah_kpm.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[getLevel(k.jumlah_kpm, selectedBantuan === "Semua Jenis" ? k.jenis_bantuan : selectedBantuan)]}`}>
                  {LEVEL_LABEL[getLevel(k.jumlah_kpm, selectedBantuan === "Semua Jenis" ? k.jenis_bantuan : selectedBantuan)]}
                </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} dari {data.length} data
          {selectedBantuan !== "Semua Jenis" && ` (${selectedBantuan})`}
        </p>
      </div>
    </div>
  );
}