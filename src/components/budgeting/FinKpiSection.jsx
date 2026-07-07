"use client";

import { FINKPI_PERCENT_KEYS, BS_LABELS, fmtSum, fmtPercent } from "./utils";

export default function FinKpiSection({ kpis, bsAssets, bsLiab }) {
  const formatValue = (key, value) =>
    FINKPI_PERCENT_KEYS.has(key) ? fmtPercent(value) : fmtSum(value);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const hasPlan = kpi.plan !== 0;
          return (
            <div
              key={kpi.key}
              className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {kpi.name}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {formatValue(kpi.key, kpi.fact)}
              </p>
              {hasPlan && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  План: {formatValue(kpi.key, kpi.plan)}
                </p>
              )}
            </div>
          );
        })}

        {kpis.length === 0 && (
          <p className="col-span-full text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
            Нет данных за выбранный период
          </p>
        )}
      </div>

      {(bsAssets || bsLiab) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "BS_ASSETS", data: bsAssets },
            { key: "BS_LIAB", data: bsLiab },
          ].map(({ key, data }) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-slate-400"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {BS_LABELS[key]}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {fmtSum(data?.fact ?? 0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
