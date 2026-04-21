"use client";

import { useState } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";
import { KELURAHAN_DATA, type KelurahanData } from "./distribution-map";

const LEVEL_BADGE: Record<KelurahanData["level"], string> = {
  "very-high": "bg-red-100 text-red-700",
  "high": "bg-orange-100 text-orange-700",
  "medium": "bg-yellow-100 text-yellow-700",
  "low": "bg-green-100 text-green-700",
  "very-low": "bg-teal-100 text-teal-700",
};

const LEVEL_LABEL: Record<KelurahanData["level"], string> = {
  "very-high": "Sangat Tinggi",
  "high": "Tinggi",
  "medium": "Sedang",
  "low": "Rendah",
  "very-low": "Sangat Rendah",
};

export default function DataTable({ selectedBantuan }: { selectedBantuan: string }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"penerima" | "cakupan">("penerima");
  const [downloading, setDownloading] = useState(false);

  // Filter by jenis bantuan first
  const bantuanFiltered = selectedBantuan === "Semua Jenis"
    ? KELURAHAN_DATA
    : KELURAHAN_DATA.filter((k) => k.jenisBantuan === selectedBantuan);

  const filtered = bantuanFiltered
    .filter(
      (k) =>
        k.name.toLowerCase().includes(search.toLowerCase()) ||
        k.kecamatan.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "penerima") return b.penerima - a.penerima;
      return b.penerima / b.total - a.penerima / a.total;
    });

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const XLSX = await import("xlsx");

      // Build rows from filtered data
      const rows = bantuanFiltered.map((k, idx) => ({
        "No": idx + 1,
        "Nama Kelurahan": k.name,
        "Kecamatan": k.kecamatan,
        "Jenis Bantuan": k.jenisBantuan,
        "Jumlah Penerima": k.penerima,
        "Total KK": k.total,
        "Cakupan (%)": Math.round((k.penerima / k.total) * 100),
        "Tingkat Distribusi": LEVEL_LABEL[k.level],
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Column widths
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 22 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 14 },
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
      {/* Table header */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground">Data Distribusi per Kelurahan</h3>
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
              placeholder="Cari kelurahan atau kecamatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setSortBy(sortBy === "penerima" ? "cakupan" : "penerima")}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background hover:bg-muted transition-colors shrink-0"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span className="hidden sm:inline">{sortBy === "penerima" ? "Penerima" : "Cakupan"}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Kelurahan</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Kecamatan</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Jenis Bantuan</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Penerima</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Total KK</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Cakupan</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k, i) => {
              const pct = Math.round((k.penerima / k.total) * 100);
              return (
                <tr
                  key={k.id}
                  className={`border-b border-border/60 hover:bg-muted/30 transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{k.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{k.kecamatan}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{k.jenisBantuan}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {k.penerima.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                    {k.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[k.level]}`}>
                      {LEVEL_LABEL[k.level]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} dari {bantuanFiltered.length} kelurahan
          {selectedBantuan !== "Semua Jenis" && ` (${selectedBantuan})`}
        </p>
      </div>
    </div>
  );
}
