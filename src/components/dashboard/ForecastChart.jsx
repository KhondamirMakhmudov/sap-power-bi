"use client";

import React from "react";
import Card from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

export default function ForecastChart({
  data,
  title = "Revenue Forecast",
  height = 350,
}) {
  return (
    <Card>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="upper"
            fill="url(#colorConfidence)"
            stroke="none"
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lower"
            fill="white"
            stroke="none"
            name="Lower Bound"
          />
          {data[0]?.actual && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Actual"
            />
          )}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Forecast"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
