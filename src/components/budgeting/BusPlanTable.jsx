"use client";

import { fmtSum, fmtPercent, executionPct, changeClass } from "./utils";

function executionClass(pct) {
  if (pct === null) return "text-gray-400 dark:text-gray-500";
  if (pct >= 95 && pct <= 105) return "text-green-600 dark:text-green-400";
  if (pct >= 85 && pct <= 115) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export default function BusPlanTable({ rows }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Исполнение бизнес-плана</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">План против факта за выбранный период</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Показатель
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                План
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Факт
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Отклонение
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Исполнение
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const pct = executionPct(row.plan, row.fact);
              const diff = row.fact - row.plan;
              return (
                <tr key={row.key} className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                  <td className="py-3.5 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</td>
                  <td className="py-3.5 px-4 text-sm text-right text-gray-600 dark:text-gray-400">{fmtSum(row.plan)}</td>
                  <td className="py-3.5 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                    {fmtSum(row.fact)}
                  </td>
                  <td className={`py-3.5 px-4 text-sm text-right font-medium ${changeClass(diff)}`}>
                    {diff >= 0 ? "+" : ""}
                    {fmtSum(diff)}
                  </td>
                  <td className={`py-3.5 px-4 text-sm text-right font-semibold ${executionClass(pct)}`}>
                    {fmtPercent(pct)}
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  Нет данных за выбранный период
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
