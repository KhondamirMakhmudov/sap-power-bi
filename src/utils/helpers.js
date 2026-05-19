import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toFixed(0);
}

export function formatPercent(value, decimals = 1) {
  return value.toFixed(decimals) + "%";
}

export function formatDate(date, formatStr = "MMM dd, yyyy") {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeTime(date) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function calculatePercentageChange(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function truncateString(str, length) {
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateGradient(colorStart, colorEnd) {
  return `linear-gradient(135deg, ${colorStart}, ${colorEnd})`;
}

export function getStatusColor(status) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    "at-risk": "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    high: "bg-green-100 text-green-800",
    medium: "bg-blue-100 text-blue-800",
    low: "bg-orange-100 text-orange-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusBadgeColor(status) {
  const statusColors = {
    active: { bg: "bg-green-50", text: "text-green-700" },
    inactive: { bg: "bg-gray-50", text: "text-gray-700" },
    "at-risk": { bg: "bg-red-50", text: "text-red-700" },
    completed: { bg: "bg-green-50", text: "text-green-700" },
    pending: { bg: "bg-yellow-50", text: "text-yellow-700" },
    failed: { bg: "bg-red-50", text: "text-red-700" },
    high: { bg: "bg-green-50", text: "text-green-700" },
    medium: { bg: "bg-blue-50", text: "text-blue-700" },
    low: { bg: "bg-orange-50", text: "text-orange-700" },
  };
  return statusColors[status] || { bg: "bg-gray-50", text: "text-gray-700" };
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function parseJSONSafely(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function generateRandomColor() {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#06b6d4", // cyan
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
