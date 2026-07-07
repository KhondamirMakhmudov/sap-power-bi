"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import Input from "@/components/ui/Input";
import { MONTH_NAMES } from "./utils";

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
  year,
  setYear,
  version,
  setVersion,
  compInput,
  setCompInput,
  monthFrom,
  setMonthFrom,
  monthTo,
  setMonthTo,
  loading,
  hasData,
  error,
  onApply,
  onReset,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <CustomSelect
          label="Год"
          options={yearOptions}
          value={year}
          placeholder="Выберите"
          onChange={setYear}
        />
        <Input
          label="Версия плана"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="EDU"
        />
        <CustomSelect
          label="Месяц с"
          options={monthOptions}
          value={monthFrom}
          placeholder="Выберите"
          onChange={setMonthFrom}
        />
        <CustomSelect
          label="Месяц по"
          options={monthOptions}
          value={monthTo}
          placeholder="Выберите"
          onChange={setMonthTo}
        />
        <Input
          label="Балансовые единицы"
          value={compInput}
          onChange={(e) => setCompInput(e.target.value)}
          placeholder="1010, T007 (необязательно)"
        />
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
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

      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
    </div>
  );
}
