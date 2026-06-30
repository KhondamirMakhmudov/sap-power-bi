"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Globe,
  MapPin,
  Zap,
  Settings,
  LogOut,
  UserCheck,
  Landmark,
} from "lucide-react";

const sidebarItems = [
  {
    label: "Главная",
    description: "Сводка ГД",
    href: "/dashboard",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: "Финансы",
    description: "КПЭ и EBITDA",
    href: "/finances",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    label: "Ликвидность",
    description: "Дебиторская задолженность",
    href: "/liquidity",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Производство",
    description: "Показатели работы активов",
    href: "/production",
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: "Материальный баланс",
    description: "Топливо — энергия",
    href: "/material-balance",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    label: "GPS-панель",
    description: "Мониторинг транспорта",
    href: "/gps-dashboard",
    icon: <MapPin className="w-5 h-5" />,
  },
  {
    label: "Действия",
    description: "Решения ГД",
    href: "/actions",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    label: "HR панель",
    description: "Управление персоналом",
    href: "/hr-panel",
    icon: <UserCheck className="w-5 h-5" />,
  },
  {
    label: "Дебиторы / Кредиторы",
    description: "Задолженность ФИ",
    href: "/fi-debtor-creditor",
    icon: <Landmark className="w-5 h-5" />,
  },
];

export default function Sidebar({
  isOpen = true,
  onClose,
  isCollapsed = false,
}) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpanded = (label) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <div className="flex flex-col h-full bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Top Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-50" />

      {/* Logo Section */}
      <div className={`relative px-6 py-8 ${isCollapsed ? "px-2" : ""}`}>
        <Link
          href="/"
          className="flex items-center gap-3 group justify-center md:justify-start"
        >
          <div className="relative w-10 h-10">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Icon */}
            <div className="relative w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Analytics
              </h1>
              <p className="text-xs text-slate-400">Dashboard Pro</p>
            </div>
          )}
        </Link>
      </div>

      {/* Divider */}
      <div className="px-6">
        <div className="h-px bg-linear-to-r from-slate-700 via-slate-600 to-slate-700" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full">
        {sidebarItems.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              className={`group relative flex items-center justify-center md:justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                isCollapsed ? "md:justify-center md:px-2" : ""
              } ${
                isActive(item.href)
                  ? "bg-linear-to-r from-cyan-500/20 to-blue-600/20 text-cyan-100"
                  : "text-slate-400 hover:text-slate-100"
              }`}
              title={isCollapsed ? item.label : ""}
            >
              {/* Hover background effect */}
              {!isActive(item.href) && (
                <div className="absolute inset-0 bg-linear-to-r from-slate-700 to-slate-700 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200 -z-10" />
              )}

              {/* Active left border accent */}
              {isActive(item.href) && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-linear-to-b from-cyan-400 to-blue-600 rounded-full" />
              )}

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className={`shrink-0 transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-cyan-400"
                      : "text-slate-500 group-hover:text-cyan-400"
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm block">
                      {item.label}
                    </span>
                    {item.description && (
                      <span
                        className={`text-xs block mt-0.5 transition-colors duration-200 ${
                          isActive(item.href)
                            ? "text-cyan-300/70"
                            : "text-slate-500 group-hover:text-slate-400"
                        }`}
                      >
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="px-6">
        <div className="h-px bg-linear-to-r from-slate-700 via-slate-600 to-slate-700" />
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-6 space-y-2">
        <Link
          href="/settings"
          className="group flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-100 transition-all duration-200 relative"
          title={isCollapsed ? "Параметры" : ""}
        >
          <div className="absolute inset-0 bg-linear-to-r from-slate-700 to-slate-700 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200 -z-10" />
          <Settings className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors duration-200 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Параметры</span>
          )}
        </Link>

        <button
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-400 transition-all duration-200 relative"
          title={isCollapsed ? "Выход" : ""}
        >
          <div className="absolute inset-0 bg-linear-to-r from-red-950/30 to-red-950/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
          <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400 transition-colors duration-200 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Выход</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 flex-col overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-slate-900 flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
