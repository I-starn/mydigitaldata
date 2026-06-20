// src/components/AnalyticsChart.tsx
'use client';
import { ServiceRecord } from '../utils/supabase/client';

interface ChartProps {
  services: ServiceRecord[];
  filter: 'month' | 'year';
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsChart({ services, filter }: ChartProps) {
  let displayData: { label: string; value: number }[] = [];

  if (filter === 'year') {
    // Generate 12 data points representing each calendar month
    const monthlyTotals = Array(12).fill(0);
    services.forEach(s => {
      const month = new Date(s.service_date).getMonth();
      monthlyTotals[month] += Number(s.price);
    });
    displayData = MONTH_LABELS.map((m, i) => ({
      label: m,
      value: monthlyTotals[i]
    }));
  } else {
    // Single month: Sort actual transactions chronologically
    const sorted = [...services].sort((a, b) => 
      new Date(a.service_date).getTime() - new Date(b.service_date).getTime()
    );
    displayData = sorted.map(s => {
      const day = new Date(s.service_date).getDate();
      return {
        label: `Day ${day}`,
        value: Number(s.price)
      };
    });
  }

  const values = displayData.map(d => d.value);
  const maxVal = values.length ? Math.max(...values, 100) : 100;

  // Chart layout dimensions (extra top spacing to avoid value label clipping)
  const width = 600;
  const height = 190;
  const paddingX = 40;
  const paddingY = 28; // Increased padding to prevent values from touching the top border

  // Map coordinates to SVG box dimensions
  const points = displayData.map((d, i) => {
    const x = paddingX + (i / Math.max(displayData.length - 1, 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.value / maxVal) * (height - paddingY * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
        <span className="font-semibold uppercase tracking-wider text-neonCyan">Revenue Trend Line</span>
        {/* Changed Currency Symbol to MWK below */}
        <span>Peak Amount: MWK {maxVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="relative glass-panel rounded-xl p-4 overflow-hidden border border-white/5">
        {displayData.length > 1 ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />

            {/* Glowing Trend Line */}
            <polyline
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.5"
              points={points}
              className="drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
            />

            {/* Value Labels Above Nodes (Using Compact MWK format) */}
            {displayData.map((d, i) => {
              const x = paddingX + (i / Math.max(displayData.length - 1, 1)) * (width - paddingX * 2);
              const y = height - paddingY - (d.value / maxVal) * (height - paddingY * 2);

              if (d.value > 0) {
                return (
                  <text
                    key={`val-${i}`}
                    x={x}
                    y={y - 10}
                    fill="#00f0ff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
                  >
                    MWK {d.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </text>
                );
              }
              return null;
            })}

            {/* Glowing Nodes */}
            {displayData.map((d, i) => {
              const x = paddingX + (i / Math.max(displayData.length - 1, 1)) * (width - paddingX * 2);
              const y = height - paddingY - (d.value / maxVal) * (height - paddingY * 2);
              
              if (filter === 'year' || d.value > 0) {
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ff007f"
                      className="drop-shadow-[0_0_4px_rgba(255,0,127,0.8)]"
                    />
                  </g>
                );
              }
              return null;
            })}

            {/* X-Axis Labels */}
            {displayData.map((d, i) => {
              if (filter === 'month' && displayData.length > 10 && i % 3 !== 0) return null;
              
              const x = paddingX + (i / Math.max(displayData.length - 1, 1)) * (width - paddingX * 2);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 6}
                  fill="#9ca3af"
                  fontSize="8"
                  textAnchor="middle"
                  className="font-mono tracking-tighter"
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        ) : (
          <div className="h-[140px] flex items-center justify-center text-sm text-gray-500">
            {displayData.length === 1 
              ? "A minimum of 2 database entries is required to render graph progression." 
              : "No services logged for this timeframe."}
          </div>
        )}
      </div>
    </div>
  );
}