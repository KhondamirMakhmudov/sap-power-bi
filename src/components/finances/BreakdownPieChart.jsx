"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_COLORS, fmtSum } from "@/components/budgeting/utils";
import { useTheme } from "@/contexts/ThemeContext";

export default function BreakdownPieChart({ title, total, rows }) {
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

  const sum = chartData.reduce((s, r) => s + r.amount, 0);

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
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0" style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 min-w-0 w-full space-y-2.5">
            {chartData.map((r) => {
              const pct = sum ? Math.round((r.amount / sum) * 100) : 0;
              return (
                <div key={r.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: r.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">
                    {r.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{pct}%</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {fmtSum(r.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
