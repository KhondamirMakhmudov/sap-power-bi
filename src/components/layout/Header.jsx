"use client";

import React, { useState } from "react";
import {
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/router";
import { useTheme } from "@/hooks";

export default function Header({
  onMenuClick,
  isMobileMenuOpen,
  onSidebarToggle,
  isSidebarCollapsed,
  username,
  notificationsPayload,
}) {
  const router = useRouter();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const fallbackNotifications = [
    { id: 1, title: "Новый заказ", message: "Заказ ORD001 выполнен" },
    {
      id: 2,
      title: "Низкий запас",
      message: "Premium Headphones - мало на складе",
    },
    {
      id: 3,
      title: "Аналитика готова",
      message: "Ежедневный отчёт доступен",
    },
  ];

  const normalizeNotifications = (payload) => {
    if (!payload) return fallbackNotifications;

    let source = payload;

    if (typeof source === "string") {
      try {
        source = JSON.parse(source);
      } catch {
        return [{ id: 1, title: "Сообщение", message: source }];
      }
    }

    if (Array.isArray(source)) {
      return source.map((item, idx) => ({
        id: item?.id ?? idx + 1,
        title: item?.title || item?.name || "Сообщение",
        message:
          typeof item?.message === "string"
            ? item.message
            : JSON.stringify(item),
      }));
    }

    if (Array.isArray(source?.archives)) {
      return source.archives.map((item, idx) => ({
        id: item?.id ?? idx + 1,
        title: item?.title || item?.name || "Архив",
        message:
          typeof item?.message === "string"
            ? item.message
            : JSON.stringify(item),
      }));
    }

    if (Array.isArray(source?.messages)) {
      return source.messages.map((item, idx) => ({
        id: item?.id ?? idx + 1,
        title: item?.title || item?.name || "Сообщение",
        message:
          typeof item?.message === "string"
            ? item.message
            : JSON.stringify(item),
      }));
    }

    return [
      {
        id: source?.id ?? 1,
        title: source?.title || source?.name || "Сообщение",
        message:
          typeof source?.message === "string"
            ? source.message
            : JSON.stringify(source),
      },
    ];
  };

  const notificationItems = normalizeNotifications(notificationsPayload);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={onSidebarToggle}
            className="hidden md:inline-flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={
              isSidebarCollapsed
                ? "Показать боковую панель"
                : "Скрыть боковую панель"
            }
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isDark ? "Светлая тема" : "Тёмная тема"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Уведомления</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notificationItems.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <p className="font-medium text-sm text-gray-900">
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationOpen(false);
              }}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-semibold">
                {initials}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900">
                    {username || "-"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Пользователь системы
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти из системы
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
