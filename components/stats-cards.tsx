"use client";

import { useEffect, useRef, useState } from "react";
import { Users, MapPin, TrendingUp, Database } from "lucide-react";

interface BansosData {
  id: number;
  kecamatan: string;
  jenis_bantuan: string;
  jumlah_kpm: number;
  tahun: number;
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return count;
}

function AnimatedStat({ target, duration }: { target: number; duration?: number }) {
  const count = useCountUp(target, duration);
  return <span>{count.toLocaleString("id-ID")}</span>;
}

const STATS_CONFIG = [
  {
    key: "totalKpm",
    label: "Total KPM",
    sub: "Keluarga Penerima Manfaat",
    icon: Users,
    iconBg: "bg-blue-500/15 dark:bg-blue-400/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    accent: "from-blue-500/10 to-blue-500/5",
    duration: 2000,
  },
  {
    key: "kecamatanCount",
    label: "Kecamatan",
    sub: "Wilayah distribusi",
    icon: MapPin,
    iconBg: "bg-emerald-500/15 dark:bg-emerald-400/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    accent: "from-emerald-500/10 to-emerald-500/5",
    duration: 1200,
  },
  {
    key: "jenisBantuanCount",
    label: "Jenis Bantuan",
    sub: "Program aktif",
    icon: TrendingUp,
    iconBg: "bg-amber-500/15 dark:bg-amber-400/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    accent: "from-amber-500/10 to-amber-500/5",
    duration: 1600,
  },
  {
    key: "totalData",
    label: "Total Data",
    sub: "Record tersimpan",
    icon: Database,
    iconBg: "bg-violet-500/15 dark:bg-violet-400/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    accent: "from-violet-500/10 to-violet-500/5",
    duration: 1000,
  },
];

export default function StatsCards({ selectedBantuan }: { selectedBantuan: string }) {
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
      .catch(err => { console.error("Error fetching stats:", err); setLoading(false); });
  }, [selectedBantuan]);

  const values = {
    totalKpm: data.reduce((s, k) => s + k.jumlah_kpm, 0),
    kecamatanCount: new Set(data.map(k => k.kecamatan)).size,
    jenisBantuanCount: new Set(data.map(k => k.jenis_bantuan)).size,
    totalData: data.length,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS_CONFIG.map((s) => (
          <div
            key={s.key}
            className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-sm animate-pulse"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-16 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS_CONFIG.map(({ key, label, sub, icon: Icon, iconBg, iconColor, accent, duration }) => (
        <div
          key={key}
          className={`relative overflow-hidden bg-gradient-to-br ${accent} bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          {/* Background card base */}
          <div className="absolute inset-0 bg-card -z-10" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${iconBg} shrink-0`}>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-xl font-bold text-foreground leading-tight tabular-nums">
                <AnimatedStat target={values[key as keyof typeof values]} duration={duration} />
              </p>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight truncate mt-0.5">
                {label}
              </p>
              <p className="text-[10px] text-muted-foreground/60 leading-tight hidden sm:block">
                {sub}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}