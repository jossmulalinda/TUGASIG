import { X, Users, MapPin, TrendingUp, CheckCircle2 } from "lucide-react";
import type { KelurahanData } from "./distribution-map";

const LEVEL_LABELS: Record<KelurahanData["level"], string> = {
  "very-high": "Sangat Tinggi",
  "high": "Tinggi",
  "medium": "Sedang",
  "low": "Rendah",
  "very-low": "Sangat Rendah",
};

const LEVEL_COLORS: Record<KelurahanData["level"], string> = {
  "very-high": "bg-red-100 text-red-700",
  "high": "bg-orange-100 text-orange-700",
  "medium": "bg-yellow-100 text-yellow-700",
  "low": "bg-green-100 text-green-700",
  "very-low": "bg-teal-100 text-teal-700",
};

interface Props {
  data: KelurahanData;
  onClose: () => void;
}

export default function KelurahanPopup({ data, onClose }: Props) {
  const pct = Math.round((data.penerima / data.total) * 100);

  return (
    <div className="bg-card border border-border rounded-xl shadow-2xl w-72 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground text-base leading-tight">{data.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{data.kecamatan}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[data.level]}`}>
            {LEVEL_LABELS[data.level]}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Penerima</span>
            </div>
            <p className="text-lg font-bold text-foreground">{data.penerima.toLocaleString("id-ID")}</p>
            <p className="text-[10px] text-muted-foreground">jiwa</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total KK</span>
            </div>
            <p className="text-lg font-bold text-foreground">{data.total.toLocaleString("id-ID")}</p>
            <p className="text-[10px] text-muted-foreground">kepala keluarga</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Cakupan</span>
            </div>
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">dari total kepala keluarga</p>
        </div>
      </div>
    </div>
  );
}
