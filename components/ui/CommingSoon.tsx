"use client";

import { Wrench, ArrowLeft } from "lucide-react";

interface ComingSoonProps {
  label?: string;
  onBack?: () => void;
}

export default function ComingSoon({ label, onBack }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <Wrench className="w-9 h-9 text-gray-400" />
      </div>

      <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md mb-4 inline-block">
        Dalam Pengembangan
      </span>

      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {label ? `"${label}" belum tersedia` : "Fitur belum tersedia"}
      </h1>
      <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
        Halaman ini sedang kami siapkan dan akan segera hadir dalam waktu dekat.
      </p>

      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Home
        </button>
      )}
    </div>
  );
}