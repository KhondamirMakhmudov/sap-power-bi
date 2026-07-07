"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import { MONTH_NAMES, toApiDate } from "./utils";

const YEAR_COUNT = 3;

function buildYearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: YEAR_COUNT }, (_, i) => {
    const y = String(current - 1 + i);
    return { value: y, label: y };
  });
}

const monthOptions = MONTH_NAMES.map((label, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label,
}));

const yearOptions = buildYearOptions();

export default function FilterCard({
  mode,
  setMode,
  dateInput,
  setDateInput,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  loading,
  hasData,
  error,
  onApply,
  onReset,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "period", label: "По месяцу / году" },
          { key: "date", label: "По конкретной дате" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === key
                ? "bg-slate-900 text-white"
                : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mode === "date" ? (
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата отчёта
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
            />
          </div>
        ) : (
          <>
            <CustomSelect
              label="Год"
              options={yearOptions}
              value={selectedYear}
              placeholder="Выберите"
              onChange={setSelectedYear}
            />
            <CustomSelect
              label="Месяц"
              options={monthOptions}
              value={selectedMonth}
              placeholder="Выберите"
              onChange={setSelectedMonth}
            />
          </>
        )}

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

export { toApiDate };
