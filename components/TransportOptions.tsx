'use client';

import { TransportOption } from "../lib/types";

interface TransportOptionsProps {
  options: TransportOption[];
  current: TransportOption;
  onSelect: (id: string) => void;
}

const modeLabels: Record<TransportOption["mode"], string> = {
  flight: "Flight",
  train: "Train",
  bus: "Bus"
};

export function TransportOptions({
  options,
  current,
  onSelect
}: TransportOptionsProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Transport plan</h2>
        <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
          Agent choice: {modeLabels[current.mode]}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const isSelected = current.id === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`grid gap-2 rounded-xl border px-4 py-3 text-left shadow-sm transition ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {modeLabels[option.mode]}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {option.provider}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800">
                  ${option.priceUsd}
                </span>
                <span className="text-slate-500">{option.durationHours}h</span>
              </div>
              <div className="grid gap-1 text-xs text-slate-500">
                <p>
                  {option.origin.name} → {option.destination.name}
                </p>
                <p>
                  {option.departTime} – {option.arriveTime}
                </p>
                <p>CO₂e: {option.carbonKg} kg</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Confidence {Math.round(option.confidence * 100)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
