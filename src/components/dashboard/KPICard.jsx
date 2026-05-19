"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function KPICard({
  label,
  value,
  change,
  trend,
  currency = "",
  icon,
  onClick,
}) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "success";
    if (trend === "down") return "error";
    return "info";
  };

  const getChangeColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition-all ${onClick ? "cursor-pointer" : ""}`}
      interactive={!!onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {currency}
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>
        {icon && <div className="text-2xl ml-4">{icon}</div>}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Badge variant={getTrendColor()} size="sm" icon={getTrendIcon()}>
          <span className={getChangeColor()}>
            {Math.abs(change).toFixed(1)}%
          </span>
        </Badge>
        <span className="text-sm text-gray-600">vs last month</span>
      </div>
    </Card>
  );
}
