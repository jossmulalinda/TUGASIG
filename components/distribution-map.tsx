"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type L from "leaflet";

interface KelurahanData {
  id: string;
  name: string;
  kecamatan: string;
  penerima: number;
  total: number;
  level: "very-high" | "high" | "medium" | "low";
  lat: number;
  lng: number;
  jenisBantuan: string;
}

interface BansosData {
  id: number;
  kecamatan: string;
  jenis_bantuan: string;
  jumlah_kpm: number;
  tahun: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Color constants — matching the legend exactly
const COLORS = {
  veryHigh: "#d4460e",
  high:     "#e87d2c",
  medium:   "#4caf7b",
  low:      "#2faebb",
};

function getColor(jumlahKpm: number, jenisBantuan: string): string {
  if (jenisBantuan === "PBI JK") {
    if (jumlahKpm > 6000) return COLORS.veryHigh;
    if (jumlahKpm > 2500) return COLORS.high;
    if (jumlahKpm > 1800) return COLORS.medium;
    return COLORS.low;
  }
  if (jenisBantuan === "PKH") {
    if (jumlahKpm > 400) return COLORS.veryHigh;
    if (jumlahKpm > 281) return COLORS.high;
    if (jumlahKpm > 226) return COLORS.medium;
    return COLORS.low;
  }
  if (jenisBantuan === "Sembako/BPNT") {
    if (jumlahKpm > 550) return COLORS.veryHigh;
    if (jumlahKpm > 401) return COLORS.high;
    if (jumlahKpm > 351) return COLORS.medium;
    return COLORS.low;
  }
  if (jumlahKpm > 6000) return COLORS.veryHigh;
  if (jumlahKpm > 3000) return COLORS.high;
  if (jumlahKpm > 1000) return COLORS.medium;
  return COLORS.low;
}

function getLevel(jumlahKpm: number, jenisBantuan: string): KelurahanData["level"] {
  if (jenisBantuan === "PBI JK") {
    if (jumlahKpm > 6000) return "very-high";
    if (jumlahKpm > 2500) return "high";
    if (jumlahKpm > 1800) return "medium";
    return "low";
  }
  if (jenisBantuan === "PKH") {
    if (jumlahKpm > 400) return "very-high";
    if (jumlahKpm > 281) return "high";
    if (jumlahKpm > 226) return "medium";
    return "low";
  }
  if (jenisBantuan === "Sembako/BPNT") {
    if (jumlahKpm > 550) return "very-high";
    if (jumlahKpm > 401) return "high";
    if (jumlahKpm > 351) return "medium";
    return "low";
  }
  if (jumlahKpm > 6000) return "very-high";
  if (jumlahKpm > 3000) return "high";
  if (jumlahKpm > 1000) return "medium";
  return "low";
}

interface Props {
  selectedBantuan: string;
  selectedTahun: string;
  onKelurahanSelect: (k: KelurahanData | null) => void;
  searchQuery?: string;
}

export default function DistributionMap({
  selectedBantuan,
  selectedTahun,
  onKelurahanSelect,
  searchQuery = "",
}: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const layersRef   = useRef<unknown[]>([]);
  const leafletRef  = useRef<typeof L | null>(null);
  const tooltipRef  = useRef<unknown>(null);
  const selectedBantuanRef = useRef<string>(selectedBantuan);
  const selectedKecamatanRef = useRef<string | null>(null);
  const geojsonRef  = useRef<unknown>(null);

  const [bansosData, setBansosData] = useState<BansosData[]>([]);
  const [apiError, setApiError]     = useState(false);

  // ── Fetch bansos data ──────────────────────────────────────
  useEffect(() => {
    setApiError(false);
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    if (selectedTahun) params.append("tahun", selectedTahun);

    fetch(`${API_URL}/api/bansos?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => setBansosData(data))
      .catch(() => setApiError(true));
  }, [selectedBantuan, selectedTahun]);

  // ── Init map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const init = async () => {
      const mod = await import("leaflet");
      const L   = mod.default;
      leafletRef.current = L;
      await import("leaflet/dist/leaflet.css");
      if (mapInstance.current) return;

      const map = L.map(mapRef.current!, {
        center: [0.7960, 127.3700],
        zoom: 11,
        zoomControl: false,
      });

      // Zoom control — top right, away from legend
      L.control.zoom({ position: "topright" }).addTo(map);

      // Scale — bottom right, away from legend (legend is bottom-left)
      L.control.scale({ position: "bottomright", metric: true, imperial: false }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapInstance.current = map;
    };

    init();

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // ── Render GeoJSON layers ──────────────────────────────────
  useEffect(() => {
    const map = mapInstance.current as L.Map | null;
    selectedBantuanRef.current = selectedBantuan;
    const L = leafletRef.current;
    if (!map || !L || bansosData.length === 0) return;

    // Remove old layers
    layersRef.current.forEach((l) =>
      (map as unknown as { removeLayer: (x: unknown) => void }).removeLayer(l)
    );
    layersRef.current = [];

    // Remove old tooltip
    if (tooltipRef.current) {
      (map as unknown as { removeLayer: (x: unknown) => void }).removeLayer(tooltipRef.current);
      tooltipRef.current = null;
    }

    const loadAndRender = async () => {
      const geojson = geojsonRef.current || await fetch("/kecamatan_ternate.geojson")
        .then((r) => r.json());
      geojsonRef.current = geojson;

      // Build kpm map
      const kpmMap: Record<string, number> = {};
      bansosData.forEach((d) => {
        if (selectedBantuan === "Semua Jenis" || d.jenis_bantuan === selectedBantuan) {
          kpmMap[d.kecamatan] = (kpmMap[d.kecamatan] || 0) + d.jumlah_kpm;
        }
      });

      const layer = L.geoJSON(geojson, {
        style: (feature) => {
          const nama = feature?.properties?.NAME_3 || "";
          const kpm  = kpmMap[nama] || 0;
          return {
            fillColor: getColor(kpm, selectedBantuan),
            fillOpacity: 0.72,
            color: "#ffffff",
            weight: 2,
          };
        },
        onEachFeature: (feature, lyr) => {
          const nama = feature?.properties?.NAME_3 || "";
          const kpm  = kpmMap[nama] || 0;

          // Hover tooltip
          lyr.bindTooltip(
            `<div style="font-family:Inter,sans-serif;min-width:140px">
              <div style="font-weight:700;font-size:13px;margin-bottom:2px">${nama}</div>
              <div style="font-size:11px;color:#6b7280">${selectedBantuanRef.current === "Semua Jenis" ? "Semua Program" : selectedBantuanRef.current}</div>
              <div style="font-size:14px;font-weight:700;margin-top:4px;color:${getColor(kpm, selectedBantuanRef.current)}">${kpm.toLocaleString("id-ID")} KPM</div>
            </div>`,
            {
              sticky: true,
              opacity: 0.97,
              className: "leaflet-tooltip-custom",
              direction: "top",
              offset: [0, -4],
            }
          );

          // Click → show popup panel
          lyr.on("click", () => {
            selectedKecamatanRef.current = nama;
            onKelurahanSelect({
              id: nama,
              name: nama,
              kecamatan: nama,
              penerima: kpm,
              total: kpm,
              level: getLevel(kpm, selectedBantuanRef.current),
              lat: 0,
              lng: 0,
              jenisBantuan: selectedBantuanRef.current,
            });
          });

          lyr.on("mouseover", function (this: L.Layer) {
            (this as L.Path).setStyle({ fillOpacity: 1, weight: 3 });
          });

          lyr.on("mouseout", function (this: L.Layer) {
            (this as L.Path).setStyle({ fillOpacity: 0.72, weight: 2 });
          });
        },
      }).addTo(map as unknown as L.Map);

      layersRef.current.push(layer);

      // Re-select if previously selected
      if (selectedKecamatanRef.current) {
        const nama = selectedKecamatanRef.current;
        const kpm  = kpmMap[nama] || 0;
        onKelurahanSelect({
          id: nama,
          name: nama,
          kecamatan: nama,
          penerima: kpm,
          total: kpm,
          level: getLevel(kpm, selectedBantuanRef.current),
          lat: 0,
          lng: 0,
          jenisBantuan: selectedBantuanRef.current,
        });
      }
    };

    loadAndRender().catch(console.error);
  }, [bansosData, onKelurahanSelect, selectedBantuan]);

  // ── Search: fly to kecamatan ───────────────────────────────
  useEffect(() => {
    if (!searchQuery || !geojsonRef.current || !mapInstance.current || !leafletRef.current) return;
    const L   = leafletRef.current;
    const map = mapInstance.current as L.Map;
    const geojson = geojsonRef.current as { features: { properties: Record<string, string>; geometry: unknown }[] };

    const match = geojson.features.find((f) =>
      (f.properties?.NAME_3 || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match) {
      const tempLayer = L.geoJSON(match as Parameters<typeof L.geoJSON>[0]);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
      }
    }
  }, [searchQuery]);

  if (apiError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center gap-3 text-center p-6 max-w-xs">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <p className="font-semibold text-foreground text-sm">Gagal memuat data</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tidak dapat terhubung ke server. Periksa koneksi internet atau coba beberapa saat lagi.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .leaflet-tooltip-custom {
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          padding: 8px 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          pointer-events: none;
        }
        .leaflet-tooltip-custom::before {
          border-top-color: rgba(0,0,0,0.08) !important;
        }
        .dark .leaflet-tooltip-custom {
          background: #1e2a3a;
          border-color: rgba(255,255,255,0.1);
          color: #f1f5f9;
        }
        /* Zoom control styling */
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          border-color: rgba(0,0,0,0.1) !important;
          color: #374151 !important;
          font-weight: 600 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
        /* Scale bar */
        .leaflet-control-scale-line {
          border-color: #9ca3af !important;
          color: #6b7280 !important;
          font-size: 10px !important;
          background: rgba(255,255,255,0.85) !important;
          border-radius: 0 0 4px 4px !important;
          padding: 1px 6px !important;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full"
        aria-label={`Peta distribusi bantuan sosial Ternate tahun ${selectedTahun} - ${selectedBantuan}`}
      />
    </>
  );
}

export type { KelurahanData };