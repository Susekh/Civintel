"use client";
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface AnalyticsChartProps {
  type: "line" | "bar";
  data: { name: string; users?: number; spots?: number }[];
  dataKey: string;
  color: string;
  title: string;
  icon?: React.ReactNode;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: Record<string, unknown>;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  dataKey,
  color,
  title,
  icon,
}) => {
  const chartProps = {
    data,
    margin: { top: 20, right: 30, left: 0, bottom: 5 },
  };

  // Custom tooltip component
  const CustomTooltip = (props : TooltipProps<ValueType, NameType>) => {
  const { active, payload, label } = props as {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  };

  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-950/95 backdrop-blur-sm border border-neutral-800/50 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-neutral-400 text-xs font-light mb-1.5 uppercase tracking-wider">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-white font-light text-sm tabular-nums"
            style={{ color: entry.color }}
          >
            {entry.name}:{" "}
            <span className="font-medium">
              {entry.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};


  // Legend formatter
  const legendFormatter = (value: string): React.ReactElement => (
    <span className="text-neutral-400 font-light text-sm">{value}</span>
  );

  return (
    <div className="group relative bg-black border border-neutral-800/50 rounded-2xl p-6 hover:border-neutral-700/50 transition-all duration-500 overflow-hidden">
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/0 via-neutral-900/0 to-neutral-800/0 group-hover:from-neutral-900/20 group-hover:to-neutral-800/5 transition-all duration-500" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-6">
        {icon && (
          <div className="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/50">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-light text-white tracking-tight">{title}</h3>
      </div>

      {/* Chart */}
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={280}>
          {type === "line" ? (
            <LineChart {...chartProps}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#262626" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#737373"
                strokeWidth={0.5}
                tick={{ fill: "#737373", fontSize: 12, fontWeight: 300 }}
                axisLine={{ stroke: "#404040" }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#737373"
                strokeWidth={0.5}
                tick={{ fill: "#737373", fontSize: 12, fontWeight: 300 }}
                axisLine={{ stroke: "#404040" }}
                tickLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeOpacity: 0.1 }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={legendFormatter}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2, fill: color }}
                fill={`url(#gradient-${dataKey})`}
              />
            </LineChart>
          ) : (
            <BarChart {...chartProps}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#262626" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#737373"
                strokeWidth={0.5}
                tick={{ fill: "#737373", fontSize: 12, fontWeight: 300 }}
                axisLine={{ stroke: "#404040" }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#737373"
                strokeWidth={0.5}
                tick={{ fill: "#737373", fontSize: 12, fontWeight: 300 }}
                axisLine={{ stroke: "#404040" }}
                tickLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={legendFormatter}
              />
              <Bar
                dataKey={dataKey}
                fill={color}
                barSize={40}
                radius={[8, 8, 0, 0]}
                fillOpacity={0.9}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Decorative accent */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500" style={{ backgroundColor: color }} />
    </div>
  );
};

export default AnalyticsChart;