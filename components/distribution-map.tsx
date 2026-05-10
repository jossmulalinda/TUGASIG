"use client";

import { useEffect, useRef, useState } from "react";
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

const API_URL = "http://localhost:8080";

function getColor(jumlahKpm: number, jenisBantuan: string): string {
  if (jenisBantuan === "PBI JK") {
    if (jumlahKpm > 6000) return "#d4460e";
    if (jumlahKpm > 2500) return "#e87d2c";
    if (jumlahKpm > 1800) return "#4caf7b";
    return "#2faebb";
  }
  if (jenisBantuan === "PKH") {
    if (jumlahKpm > 400) return "#d4460e";
    if (jumlahKpm > 281) return "#e87d2c";
    if (jumlahKpm > 226) return "#4caf7b";
    return "#2faebb";
  }
  if (jenisBantuan === "Sembako/BPNT") {
    if (jumlahKpm > 550) return "#d4460e";
    if (jumlahKpm > 401) return "#e87d2c";
    if (jumlahKpm > 351) return "#4caf7b";
    return "#2faebb";
  }
  if (jumlahKpm > 6000) return "#d4460e";
  if (jumlahKpm > 3000) return "#e87d2c";
  if (jumlahKpm > 1000) return "#4caf7b";
  return "#2faebb";
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
}

export default function DistributionMap({ selectedBantuan, selectedTahun, onKelurahanSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const layersRef = useRef<unknown[]>([]);
  const leafletRef = useRef<typeof L | null>(null);
  const [bansosData, setBansosData] = useState<BansosData[]>([]);
  const selectedKecamatanRef = useRef<string | null>(null);
  const selectedBantuanRef = useRef<string>(selectedBantuan);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    if (selectedTahun) params.append("tahun", selectedTahun);

    fetch(`${API_URL}/api/bansos?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setBansosData(data))
      .catch((err) => console.error("Error fetching bansos:", err));
  }, [selectedBantuan, selectedTahun]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const leafletModule = await import("leaflet");
      const L = leafletModule.default;
      leafletRef.current = L;
      await import("leaflet/dist/leaflet.css");

      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!, {
        center: [0.7960, 127.3700],
        zoom: 11,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ position: "bottomleft", metric: true, imperial: false }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current as L.Map | null;
    selectedBantuanRef.current = selectedBantuan;
    const L = leafletRef.current;
    if (!map || !L || bansosData.length === 0) return;

    layersRef.current.forEach((layer) => {
      (map as unknown as { removeLayer: (l: unknown) => void }).removeLayer(layer);
    });
    layersRef.current = [];

    fetch("/kecamatan_ternate.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const kpmMap: Record<string, number> = {};
        bansosData.forEach((d) => {
          if (selectedBantuan === "Semua Jenis" || d.jenis_bantuan === selectedBantuan) {
            kpmMap[d.kecamatan] = (kpmMap[d.kecamatan] || 0) + d.jumlah_kpm;
          }
        });

        const layer = L.geoJSON(geojson, {
          style: (feature) => {
            const nama = feature?.properties?.NAME_3 || "";
            const kpm = kpmMap[nama] || 0;
            return {
              fillColor: getColor(kpm, selectedBantuan),
              fillOpacity: 0.7,
              color: "#fff",
              weight: 2,
            };
          },
          onEachFeature: (feature, layer) => {
            const nama = feature?.properties?.NAME_3 || "";
            const kpm = kpmMap[nama] || 0;

            layer.on("click", () => {
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

            layer.on("mouseover", function (this: L.Layer) {
              (this as L.Path).setStyle({ fillOpacity: 1, weight: 3 });
            });

            layer.on("mouseout", function (this: L.Layer) {
              (this as L.Path).setStyle({ fillOpacity: 0.7, weight: 2 });
            });
          },
        }).addTo(map as unknown as L.Map);

        layersRef.current.push(layer);

        if (selectedKecamatanRef.current) {
          const nama = selectedKecamatanRef.current;
          const kpm = kpmMap[nama] || 0;
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
      })
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, [bansosData, onKelurahanSelect, selectedBantuan]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      aria-label={`Peta distribusi bantuan sosial Ternate tahun ${selectedTahun} - ${selectedBantuan}`}
    />
  );
}

export type { KelurahanData };