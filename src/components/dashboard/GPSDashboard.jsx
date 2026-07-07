"use client";

import React from "react";
import Card from "@/components/ui/Card";

export default function GPSDashboard() {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">GPS-панель</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Просмотр местоположения, маршрутов и статуса транспорта в режиме реального времени.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Активных трекеров</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">42</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Онлайн-сессий</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">18</p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Данные GPS будут отображаться здесь после подключения трекеров и настройки источника данных.
      </div>
    </Card>
  );
}
