"use client";
import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  trend?: string;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: StatCardProps) => (
  <div className="group relative bg-black border border-neutral-800/50 rounded-2xl p-6 hover:border-neutral-700/50 transition-all duration-500 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/0 via-neutral-900/0 to-neutral-800/0 group-hover:from-neutral-900/30 group-hover:to-neutral-800/10 transition-all duration-500" />
    
    {/* Content */}
    <div className="relative z-10">
      {/* Icon and Title Row */}
      <div className="flex items-center justify-between mb-8">
        <div className={`p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/50 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${color}`} strokeWidth={1.5} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-400 transition-colors">
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className="text-4xl font-light text-white tracking-tight tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-sm font-light text-neutral-500 tracking-wide uppercase">
          {title}
        </p>
      </div>
    </div>

    {/* Decorative corner accent */}
    <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`} />
  </div>
);

export default StatCard;