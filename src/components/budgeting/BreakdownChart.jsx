"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, fmtSum } from "./utils";
import { useTheme } from "@/contexts/ThemeContext";

export default function BreakdownChart({ title, total, rows }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = [...rows]
    .filter((r) => r.amount !== 0)
    .sort((a, b) => b.amount - a.amount)
    .map((r, i) => ({
      name: r.name,
      amount: r.amount,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const height = Math.max(chartData.length * 44, 120);
  // Recharts anchors vertical-axis category labels at their right edge and never
  // wraps/truncates them, so a fixed width clips the start of long names off the
  // left of the SVG. Size the axis to the longest label instead of a flat guess.
  const longestName = chartData.reduce((max, r) => Math.max(max, r.name.length), 0);
  const yAxisWidth = Math.min(260, Math.max(140, longestName * 6.5 + 16));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{fmtSum(total)}</span>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
          Нет данных за выбранный период
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
            barCategoryGap={10}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#52514e" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: isDark ? "#334155" : "#f0efec" }}
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "white",
                color: isDark ? "#F1F5F9" : "#0b0b0b",
                border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
              }}
              formatter={(value) => [fmtSum(value), "Сумма"]}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {chartData.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList
                dataKey="amount"
                position="right"
                formatter={fmtSum}
                style={{ fontSize: 12, fill: isDark ? "#F1F5F9" : "#0b0b0b", fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
