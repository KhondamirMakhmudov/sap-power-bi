"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import { ENTITIES, TOP_OPTIONS } from "./config";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = String(currentYear - 2 + i);
  return { value: y, label: y };
});

export default function EntityFilter({
  entityKey,
  filter,
  setFilter,
  top,
  setTop,
  loading,
  hasData,
  error,
  onApply,
  onReset,
}) {
  const config = ENTITIES[entityKey].filter;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {config.type === "dateRange" && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дата с</label>
              <input
                type="date"
                value={filter.from || ""}
                onChange={(e) => setFilter({ ...filter, from: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дата по</label>
              <input
                type="date"
                value={filter.to || ""}
                onChange={(e) => setFilter({ ...filter, to: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
              />
            </div>
          </>
        )}

        {config.type === "text" && (
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.placeholder || "Фильтр"}
            </label>
            <input
              type="text"
              value={filter.value || ""}
              onChange={(e) => setFilter({ ...filter, value: e.target.value })}
              placeholder={config.placeholder || ""}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
            />
          </div>
        )}

        {config.type === "year" && (
          <div className="md:col-span-2">
            <CustomSelect
              label="Финансовый год"
              options={YEAR_OPTIONS}
              value={filter.year || ""}
              placeholder="Все годы"
              onChange={(v) => setFilter({ ...filter, year: v })}
            />
          </div>
        )}

        <CustomSelect
          label="Записей"
          options={TOP_OPTIONS}
          value={top}
          placeholder="50 записей"
          onChange={setTop}
        />

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={loading}
            className="flex-1 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {loading ? "Загрузка..." : "Применить"}
          </button>
          {hasData && (
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors text-sm"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
    </div>
  );
}
