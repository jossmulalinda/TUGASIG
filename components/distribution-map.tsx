"use client";

import { useEffect, useRef } from "react";

interface KelurahanData {
  id: string;
  name: string;
  kecamatan: string;
  penerima: number;
  total: number;
  level: "very-high" | "high" | "medium" | "low" | "very-low";
  lat: number;
  lng: number;
  jenisBantuan: string;
}

const KELURAHAN_DATA: KelurahanData[] = [
  { id: "1", name: "Gamalama", kecamatan: "Ternate Tengah", penerima: 1240, total: 3200, level: "very-high", lat: 0.7950, lng: 127.3741, jenisBantuan: "PKH" },
  { id: "2", name: "Soa Sio", kecamatan: "Ternate Utara", penerima: 980, total: 2800, level: "high", lat: 0.8120, lng: 127.3760, jenisBantuan: "BPNT" },
  { id: "3", name: "Kalumata", kecamatan: "Ternate Selatan", penerima: 750, total: 2100, level: "high", lat: 0.7780, lng: 127.3680, jenisBantuan: "PKH" },
  { id: "4", name: "Moya", kecamatan: "Ternate Tengah", penerima: 420, total: 1500, level: "medium", lat: 0.7890, lng: 127.3820, jenisBantuan: "BST" },
  { id: "5", name: "Bastiong Talangame", kecamatan: "Ternate Selatan", penerima: 680, total: 1900, level: "high", lat: 0.7710, lng: 127.3720, jenisBantuan: "BPNT" },
  { id: "6", name: "Marikrubu", kecamatan: "Ternate Tengah", penerima: 310, total: 1100, level: "medium", lat: 0.7970, lng: 127.3700, jenisBantuan: "BLT Dana Desa" },
  { id: "7", name: "Tobololo", kecamatan: "Ternate Utara", penerima: 190, total: 900, level: "low", lat: 0.8250, lng: 127.3800, jenisBantuan: "Bansos Tunai" },
  { id: "8", name: "Ngade", kecamatan: "Ternate Selatan", penerima: 280, total: 1050, level: "medium", lat: 0.7650, lng: 127.3750, jenisBantuan: "PKH" },
  { id: "9", name: "Jati", kecamatan: "Ternate Tengah", penerima: 540, total: 1600, level: "medium", lat: 0.8010, lng: 127.3660, jenisBantuan: "BPNT" },
  { id: "10", name: "Gambesi", kecamatan: "Ternate Selatan", penerima: 120, total: 600, level: "very-low", lat: 0.7580, lng: 127.3700, jenisBantuan: "BST" },
  { id: "11", name: "Sangadji", kecamatan: "Ternate Utara", penerima: 870, total: 2400, level: "high", lat: 0.8190, lng: 127.3730, jenisBantuan: "PKH" },
  { id: "12", name: "Kulaba", kecamatan: "Ternate Utara", penerima: 150, total: 700, level: "very-low", lat: 0.8340, lng: 127.3820, jenisBantuan: "BLT Dana Desa" },
  { id: "13", name: "Sulamadaha", kecamatan: "Pulau Ternate", penerima: 220, total: 950, level: "low", lat: 0.7900, lng: 127.3540, jenisBantuan: "Bansos Tunai" },
  { id: "14", name: "Kastela", kecamatan: "Pulau Ternate", penerima: 170, total: 800, level: "low", lat: 0.7840, lng: 127.3480, jenisBantuan: "BST" },
  { id: "15", name: "Foramadiahi", kecamatan: "Pulau Ternate", penerima: 95, total: 550, level: "very-low", lat: 0.8060, lng: 127.3500, jenisBantuan: "BPNT" },
];

const LEVEL_COLORS: Record<KelurahanData["level"], string> = {
  "very-high": "#d4460e",
  "high": "#e87d2c",
  "medium": "#d4b31a",
  "low": "#4caf7b",
  "very-low": "#2faebb",
};

const LEVEL_RADIUS: Record<KelurahanData["level"], number> = {
  "very-high": 26,
  "high": 22,
  "medium": 18,
  "low": 14,
  "very-low": 10,
};

interface Props {
  selectedBantuan: string;
  selectedTahun: string;
  onKelurahanSelect: (k: KelurahanData | null) => void;
}

export default function DistributionMap({ selectedBantuan, selectedTahun, onKelurahanSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      leafletRef.current = L as unknown as typeof import("leaflet");
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!, {
        center: [0.7960, 127.3700],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ position: "bottomleft", metric: true, imperial: false }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  // Update markers when filter changes
  useEffect(() => {
    const map = mapInstanceRef.current as { removeLayer: (l: unknown) => void; addLayer?: (l: unknown) => void } | null;
    const L = leafletRef.current as unknown as typeof import("leaflet").default | null;
    if (!map || !L) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current.clear();

    // Filter data
    const filteredData = selectedBantuan === "Semua Jenis"
      ? KELURAHAN_DATA
      : KELURAHAN_DATA.filter((k) => k.jenisBantuan === selectedBantuan);

    // Add filtered markers
    filteredData.forEach((k) => {
      const color = LEVEL_COLORS[k.level];
      const radius = LEVEL_RADIUS[k.level];

      const marker = L.circleMarker([k.lat, k.lng], {
        radius,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.82,
      }).addTo(map as unknown as import("leaflet").Map);

      marker.on("click", () => onKelurahanSelect(k));
      marker.on("mouseover", function (this: typeof marker) {
        (this as unknown as { setStyle: (s: object) => void }).setStyle({ weight: 3, fillOpacity: 1 });
      });
      marker.on("mouseout", function (this: typeof marker) {
        (this as unknown as { setStyle: (s: object) => void }).setStyle({ weight: 2, fillOpacity: 0.82 });
      });

      markersRef.current.set(k.id, marker);
    });
  }, [selectedBantuan, onKelurahanSelect]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      aria-label={`Peta distribusi bantuan sosial Ternate tahun ${selectedTahun} - ${selectedBantuan}`}
    />
  );
}

export type { KelurahanData };
export { KELURAHAN_DATA };
