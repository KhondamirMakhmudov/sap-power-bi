"use client";

import React from "react";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  COMPANY_NAMES,
  fmtMln,
  changeClass,
  signedFmt,
  groupItemsByCompany,
} from "./utils";

export default function CompanyMatrixTable({ activeSection, activeTab }) {
  const title =
    activeTab === "debtor" ? "Детализация дебиторов" : "Детализация кредиторов";

  const rows = groupItemsByCompany(activeSection.items);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Разбивка по организациям и категориям
          </p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {rows.length} организаций
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border border-gray-400 py-2.5 px-3 text-xs font-bold text-gray-900 text-center whitespace-nowrap bg-[#FCE4D6]">
                №
              </th>
              <th className="border border-gray-400 py-2.5 px-3 text-xs font-bold text-gray-900 text-center whitespace-nowrap bg-[#FCE4D6]">
                Организация
              </th>
              <th className="border border-gray-400 py-2.5 px-3 text-xs font-bold text-gray-900 text-center whitespace-nowrap bg-[#FCE4D6]">
                Нач. баланс
              </th>
              <th className="border border-gray-400 py-2.5 px-3 text-xs font-bold text-gray-900 text-center whitespace-nowrap bg-[#FCE4D6]">
                Тек. баланс
              </th>
              <th className="border border-gray-400 py-2.5 px-3 text-xs font-bold text-gray-900 text-center whitespace-nowrap bg-[#FFFF00]">
                Изменение
              </th>
              {CATEGORY_KEYS.map((k) => (
                <th
                  key={k}
                  className="border border-gray-400 py-2.5 px-3 text-xs font-bold text-gray-900 text-center whitespace-nowrap bg-[#FFFF00]"
                >
                  {CATEGORY_LABELS[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.companyCode}
                className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              >
                <td className="py-3.5 px-4 text-sm text-gray-400 dark:text-gray-500">
                  {idx + 1}
                </td>
                <td className="py-3.5 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {COMPANY_NAMES[row.companyCode] ?? row.companyCode}
                </td>
                <td className="py-3.5 px-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {fmtMln(row.openingBalance)}
                </td>
                <td className="py-3.5 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {fmtMln(row.currentBalance)}
                </td>
                <td
                  className={`py-3.5 px-4 text-sm text-right font-semibold whitespace-nowrap ${changeClass(row.change)}`}
                >
                  {signedFmt(row.change)}
                </td>
                {CATEGORY_KEYS.map((k) => (
                  <td
                    key={k}
                    className="py-3.5 px-4 text-sm text-right text-gray-600 dark:text-gray-400 whitespace-nowrap"
                  >
                    {fmtMln(row[k])}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5 + CATEGORY_KEYS.length}
                  className="py-16 text-center text-sm text-gray-400 dark:text-gray-500"
                >
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
