import React from 'react';

interface MacroDistributionDonutProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
}

export const MacroDistributionDonut: React.FC<MacroDistributionDonutProps> = ({
  protein,
  carbs,
  fat,
  size = 120,
}) => {
  const pCal = protein * 4;
  const cCal = carbs * 4;
  const fCal = fat * 9;
  const totalCal = pCal + cCal + fCal || 1;

  const pPct = (pCal / totalCal) * 100;
  const cPct = (cCal / totalCal) * 100;
  const fPct = (fCal / totalCal) * 100;

  // SVG Donut calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const cOffset = 0;
  const cDash = (cPct / 100) * circumference;

  const pOffset = cDash;
  const pDash = (pPct / 100) * circumference;

  const fOffset = cDash + pDash;
  const fDash = (fPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(120, 113, 108, 0.15)"
            strokeWidth={strokeWidth}
          />
          {/* Carbs Segment (Amber) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${cDash} ${circumference - cDash}`}
            strokeDashoffset={-cOffset}
            className="transition-all duration-500"
          />
          {/* Protein Segment (Blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeDasharray={`${pDash} ${circumference - pDash}`}
            strokeDashoffset={-pOffset}
            className="transition-all duration-500"
          />
          {/* Fat Segment (Green) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${fDash} ${circumference - fDash}`}
            strokeDashoffset={-fOffset}
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute text-center">
          <span className="text-xs font-black text-stone-800 dark:text-[var(--dark-text)]">
            {Math.round(totalCal)}
          </span>
          <span className="block text-[9px] font-bold text-stone-400 uppercase">kcal</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] font-bold">
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>Karb %{Math.round(cPct)}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span>Prot %{Math.round(pPct)}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Yağ %{Math.round(fPct)}</span>
        </div>
      </div>
    </div>
  );
};
