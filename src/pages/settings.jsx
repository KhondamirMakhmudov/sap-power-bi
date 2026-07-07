"use client";

import React from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated, getSessionUsername } from "@/utils/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut } from "lucide-react";

export default function SettingsPage({ username }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <MainLayout username={username}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Настройки
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Профиль и параметры отображения
          </p>
        </div>

        {/* Profile */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Профиль
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {username || "—"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Пользователь системы
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из системы
            </Button>
          </div>
        </Card>

        {/* Display Settings */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Отображение
          </h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Тёмная тема
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Переключает оформление всего приложения
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDarkMode}
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-full transition-colors ${
                isDarkMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { username: getSessionUsername(req) ?? "" } };
}
