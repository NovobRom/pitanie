import React from 'react';
import { useI18n } from '@/lib/i18n';

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightEntry[];
}

export function WeightChart({ data }: WeightChartProps) {
  const { t } = useI18n();

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-[var(--color-text-muted)] italic">
        {t('profile.noWeightData') || 'No weight data logged yet'}
      </div>
    );
  }

  // Sort by date ascending
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Chart dimensions
  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const weights = sortedData.map((d) => d.weight);
  const minWeight = Math.min(...weights) - 2;
  const maxWeight = Math.max(...weights) + 2;
  const weightRange = maxWeight - minWeight || 10;

  // Map data to SVG points
  const points = sortedData.map((entry, index) => {
    const x = paddingLeft + (index / (sortedData.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((entry.weight - minWeight) / weightRange) * chartHeight;
    return { x, y, ...entry };
  });

  // Generate SVG path string
  let pathD = '';
  let areaD = '';

  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach((pt) => {
      pathD += ` L ${pt.x} ${pt.y}`;
    });

    // Close the path for the filled gradient area
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider">
        {t('profile.weightTrend') || 'Weight Trend'}
      </h3>
      <div className="w-full overflow-x-auto no-scrollbar">
        <div style={{ minWidth: '400px' }} className="relative bg-white/40 p-2 rounded-2xl border border-gray-100/50">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + chartHeight * ratio;
              const val = minWeight + (1 - ratio) * weightRange;
              return (
                <g key={idx} className="opacity-40">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#e8e8e5"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-[var(--color-text-muted)]"
                  >
                    {Math.round(val)}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Point Markers */}
            {points.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill="white"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  className="transition-all duration-200 hover:r-6"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="transparent"
                  className="peer"
                />
                {/* Tooltip on hover */}
                <g className="opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect
                    x={Math.max(10, pt.x - 30)}
                    y={pt.y - 32}
                    width="60"
                    height="20"
                    rx="6"
                    fill="var(--color-text)"
                    className="shadow-sm"
                  />
                  <text
                    x={Math.max(10, pt.x - 30) + 30}
                    y={pt.y - 19}
                    textAnchor="middle"
                    fill="white"
                    className="text-[9px] font-bold font-mono"
                  >
                    {pt.weight} kg
                  </text>
                </g>
              </g>
            ))}

            {/* Date Labels */}
            {points.map((pt, idx) => {
              // Only render first, middle and last date labels to prevent overlap
              if (idx === 0 || idx === points.length - 1 || (points.length > 5 && idx === Math.floor(points.length / 2))) {
                const formattedDate = new Date(pt.date).toLocaleDateString('ru-RU', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-[var(--color-text-muted)] font-semibold"
                  >
                    {formattedDate}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
