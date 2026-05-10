import { X, Users, MapPin, TrendingUp, CheckCircle2 } from "lucide-react";
import type { KelurahanData } from "./distribution-map";

type Level = "very-high" | "high" | "medium" | "low";

const LEVEL_LABELS: Record<Level, string> = {
  "very-high": "Sangat Tinggi",
  "high": "Tinggi",
  "medium": "Sedang",
  "low": "Rendah",
};

const LEVEL_COLORS: Record<Level, string> = {
  "very-high": "bg-red-100 text-red-700",
  "high": "bg-orange-100 text-orange-700",
  "medium": "bg-yellow-100 text-yellow-700",
  "low": "bg-teal-100 text-teal-700",
};

interface Props {
  data: KelurahanData;
  onClose: () => void;
}

export default function KelurahanPopup({ data, onClose }: Props) {
  const level = data.level as Level;

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
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_COLORS[level]}`}>
            {LEVEL_LABELS[level]}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Total KPM
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {data.penerima.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-muted-foreground">Keluarga Penerima Manfaat</p>
          </div>
        </div>

        {/* Jenis Bantuan */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Jenis Bantuan
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{data.jenisBantuan}</p>
        </div>

        {/* Kecamatan */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Kecamatan
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{data.kecamatan}</p>
        </div>
      </div>
    </div>
  );
}