"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_KEYS, CATEGORY_LABELS, fmtMln, changeClass, signedFmt } from "./utils";

export default function ItemsTable({ activeSection, activeTab, expandedRows, toggleRow }) {
  const title =
    activeTab === "debtor" ? "Детализация дебиторов" : "Детализация кредиторов";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Нажмите на строку для просмотра разбивки по категориям
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium">
          {activeSection.items?.length ?? 0} позиций
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">
                №
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Контрагент
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Код
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Нач. баланс
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Тек. баланс
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Изменение
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {activeSection.items?.map((item) => {
              const rowKey = `${item.companyCode}-${item.partner}-${item.seq}`;
              const isExpanded = expandedRows.has(rowKey);
              const nonZeroCats = CATEGORY_KEYS.filter(
                (k) => item[k] !== undefined && Number(item[k]) !== 0
              );

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    onClick={() => toggleRow(rowKey)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-sm text-gray-400">
                      {item.seq}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-sm font-medium text-gray-900">
                        {item.partnerName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.partner}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600">
                      {item.companyCode}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-right text-gray-600">
                      {fmtMln(item.openingBalance)}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-right font-semibold text-gray-900">
                      {fmtMln(item.currentBalance)}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-sm text-right font-semibold ${changeClass(item.change)}`}
                    >
                      {signedFmt(item.change)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-center">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="border-b border-gray-200 bg-slate-50">
                      <td colSpan={7} className="px-6 py-4">
                        {nonZeroCats.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                              Разбивка по категориям (млн UZS)
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                              {nonZeroCats.map((k) => (
                                <div
                                  key={k}
                                  className="bg-white rounded-lg p-3 border border-gray-200"
                                >
                                  <p className="text-xs text-gray-500">
                                    {CATEGORY_LABELS[k]}
                                  </p>
                                  <p
                                    className={`text-sm font-bold mt-1 ${changeClass(item[k])}`}
                                  >
                                    {fmtMln(item[k])}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            Нет данных по категориям
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {(!activeSection.items || activeSection.items.length === 0) && (
              <tr>
                <td
                  colSpan={7}
                  className="py-16 text-center text-sm text-gray-400"
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
