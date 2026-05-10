"use client";

import { useEffect, useRef, useState } from "react";
import { Users, MapPin, TrendingUp, Building2 } from "lucide-react";

interface BansosData {
  id: number;
  kecamatan: string;
  jenis_bantuan: string;
  jumlah_kpm: number;
  tahun: number;
}

function useCountUp(target: number, duration = 1800, start = 1) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      setCount(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, start]);

  return count;
}

function AnimatedStat({ target, suffix = "", duration }: { target: number; suffix?: string; duration?: number; }) {
  const count = useCountUp(target, duration);
  return <span>{count.toLocaleString("id-ID")}{suffix}</span>;
}

export default function StatsCards({ selectedBantuan }: { selectedBantuan: string }) {
  const [data, setData] = useState<BansosData[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBantuan !== "Semua Jenis") params.append("jenis", selectedBantuan);
    params.append("tahun", "2026");

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bansos?${params.toString()}`)
      .then(res => res.json())
      .then(result => setData(result))
      .catch(err => console.error("Error fetching stats:", err));
  }, [selectedBantuan]);

  const totalPenerima = data.reduce((s, k) => s + k.jumlah_kpm, 0);
  const kecamatanCount = new Set(data.map(k => k.kecamatan)).size;
  const jenisBantuanCount = new Set(data.map(k => k.jenis_bantuan)).size;

  const stats = [
    {
      label: "Total KPM",
      target: totalPenerima,
      suffix: "",
      sub: "jiwa terdaftar",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      duration: 2000,
    },
    {
      label: "Kecamatan",
      target: kecamatanCount,
      suffix: "",
      sub: "wilayah distribusi",
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      duration: 1200,
    },
    {
      label: "Jenis Bantuan",
      target: jenisBantuanCount,
      suffix: "",
      sub: "program aktif",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      duration: 1600,
    },
    {
      label: "Total Data",
      target: data.length,
      suffix: "",
      sub: "record tersimpan",
      icon: Building2,
      color: "text-violet-600",
      bg: "bg-violet-50",
      duration: 1000,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, target, suffix, sub, icon: Icon, color, bg, duration }) => (
        <div
          key={label}
          className="bg-card rounded-xl border border-border p-3 sm:p-4 shadow-sm flex items-center gap-2 sm:gap-3"
        >
          <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${bg} shrink-0`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-xl font-bold text-foreground leading-tight truncate">
              <AnimatedStat target={target} suffix={suffix} duration={duration} />
            </p>
            <p className="text-[11px] text-muted-foreground font-medium leading-tight truncate">{label}</p>
            <p className="text-[10px] text-muted-foreground/70 leading-tight hidden sm:block">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}