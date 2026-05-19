"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const monthOptions = [
  { value: "january", label: "Январь" },
  { value: "february", label: "Февраль" },
  { value: "march", label: "Март" },
  { value: "april", label: "Апрель" },
  { value: "may", label: "Май" },
  { value: "june", label: "Июнь" },
  { value: "july", label: "Июль" },
  { value: "august", label: "Август" },
  { value: "september", label: "Сентябрь" },
  { value: "october", label: "Октябрь" },
  { value: "november", label: "Ноябрь" },
  { value: "december", label: "Декабрь" },
];

const liquidityKpis = [
  {
    label: "Дебиторская задолженность",
    value: "1.42 трлн сум",
    limit: "Лимит: 1.30 трлн сум",
    status: "+9.2% к лимиту",
    statusType: "warning",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Просроченная ДЗ",
    value: "486 млрд сум",
    limit: "Цели: ≤ 350 млрд сум",
    status: "требует взысканий",
    statusType: "error",
    borderColor: "border-l-4 border-l-red-500",
  },
  {
    label: "DSO",
    value: "42 дня",
    limit: "Норматив: 30-45 дней",
    status: "верхняя граница",
    statusType: "warning",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Collection Rate",
    value: "98.4%",
    limit: "Цели: ≥ 98-99%",
    status: "в норме",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "FCF",
    value: "+84 млрд сум",
    limit: "Цели: положительный FCF",
    status: "ликвидность сохранена",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "Working Capital",
    value: "-420 млрд сум",
    limit: "Цели: не хуже -350 млрд сум",
    status: "контроль",
    statusType: "warning",
    borderColor: "border-l-4 border-l-orange-500",
  },
];

const dsoAging = [
  {
    range: "0-30 дней",
    amount: "614 млрд сум",
    percentage: "43% портфеля",
    color: "bg-green-500",
  },
  {
    range: "31-45 дней",
    amount: "318 млрд сум",
    percentage: "22% портфеля",
    color: "bg-green-500",
  },
  {
    range: "46-60 дней",
    amount: "196 млрд сум",
    percentage: "14% портфеля",
    color: "bg-orange-500",
  },
  {
    range: "61-90 дней",
    amount: "162 млрд сум",
    percentage: "11% портфеля",
    color: "bg-orange-500",
  },
  {
    range: "90+ дней",
    amount: "130 млрд сум",
    percentage: "9% портфеля",
    color: "bg-red-500",
  },
];

const monthlyDso = [
  { month: "Июнь", days: 58, color: "bg-red-600" },
  { month: "Июль", days: 56, color: "bg-red-600" },
  { month: "Авг", days: 54, color: "bg-orange-600" },
  { month: "Сен", days: 52, color: "bg-orange-600" },
  { month: "Окт", days: 50, color: "bg-orange-600" },
  { month: "Ноя", days: 48, color: "bg-orange-600" },
  { month: "Дек", days: 46, color: "bg-orange-600" },
  { month: "Янв", days: 44, color: "bg-green-600" },
  { month: "Фев", days: 43, color: "bg-green-600" },
  { month: "Мар", days: 42, color: "bg-green-600" },
  { month: "Апр", days: 42, color: "bg-green-600" },
  { month: "Май", days: 41, color: "bg-green-600" },
];

export default function LiquidityPage() {
  const [selectedMonth, setSelectedMonth] = useState("may");
  const [activeTab, setActiveTab] = useState("debtor");

  const getStatusColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-orange-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ликвидность</h1>
          <p className="text-gray-600 mt-1">Дебиторская задолженность</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Месяц
              </label>
              <CustomSelect
                label="Месяц"
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
            <button className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Сбросить
            </button>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("debtor")}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === "debtor"
                ? "bg-slate-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Дебиторская задолженность
          </button>
          <button
            onClick={() => setActiveTab("creditor")}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              activeTab === "creditor"
                ? "bg-slate-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Кредиторская задолженность
          </button>
        </div>

        {activeTab === "debtor" && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {liquidityKpis.map((kpi, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${kpi.borderColor}`}
                >
                  <p className="text-xs font-medium text-gray-600">
                    {kpi.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-2">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{kpi.limit}</p>
                  <p
                    className={`text-xs font-semibold mt-2 ${getStatusColor(kpi.statusType)}`}
                  >
                    {kpi.status}
                  </p>
                </div>
              ))}
            </div>

            {/* DSO Aging Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Дебиторская задолженность по срокам
              </h2>
              <p className="text-xs text-gray-600 mb-6">
                Тенденция к сокращению срока оборачиваемости дебиторской
                задолженности. Целевой коридор — 30-45 дней.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {dsoAging.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <p className="text-sm font-medium text-gray-900">
                        {item.range}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {item.amount}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {item.percentage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* DSO 12-Month Chart */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  DSO за 12 месяцев
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  снижение
                </span>
              </div>

              <div className="space-y-3">
                {monthlyDso.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium text-gray-700">
                      {item.month}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center h-6 bg-gray-100 rounded relative">
                        <div
                          className={`${item.color} h-full rounded flex items-center justify-end pr-2`}
                          style={{ width: `${(item.days / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                      {item.days} дней
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Note */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  DSO сократился с 58 до 41 дней за 12 месяцев: минус 17 дней,
                  показатель вошел в целевой коридор 30-45 дней.
                </p>
              </div>
            </div>

            {/* Main Debtors and Cash Calendar - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Debtors Table */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Основные должники</h2>
                <p className="text-xs text-gray-600 mb-6">
                  Структура портфеля дебиторской задолженности по ключевым контрагентам.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700">
                          ДОЛЖНИК
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700">
                          СУММА
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700">
                          ПРОСРОЧКА
                        </th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700">
                          DSO
                        </th>
                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700">
                          СТАТУС
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          АО &quot;Национальные электрические сети Узбекистана&quot;
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          780 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          210 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          <div className="inline-block w-12 h-2 bg-orange-500 rounded" />
                          <span className="ml-2">38 дней</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-orange-600 font-medium">контроль</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          АО &quot;Региональные электрические сети&quot;
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          460 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          190 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          <div className="inline-block w-16 h-2 bg-red-600 rounded" />
                          <span className="ml-2">52 дня</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-red-600 font-medium">взысканий</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          Теплоснабжающие организации / потребители тепла
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          86 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          42 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          <div className="inline-block w-20 h-2 bg-red-500 rounded" />
                          <span className="ml-2">64 дня</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-red-600 font-medium">просрочка</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          Прочие промышленные потребители
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          54 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          24 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          <div className="inline-block w-14 h-2 bg-orange-500 rounded" />
                          <span className="ml-2">47 дней</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-orange-600 font-medium">контроль</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-3 text-sm font-medium text-gray-900">
                          Прочие дебиторы
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          40 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          20 млрд сум
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-gray-900">
                          <div className="inline-block w-10 h-2 bg-green-500 rounded" />
                          <span className="ml-2">35 дней</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-green-600 font-medium">норма</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Calendar */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Кассовый календарь поступлений
                </h2>
                <p className="text-xs text-gray-600 mb-6">
                  Контроль ожидаемых платежей и рисков разрыва ликвидности.
                </p>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">05 июня</span>
                      <span className="text-sm font-semibold text-gray-900">180 млрд сум</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      Платеж НЭСУ по графику
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">10 июня</span>
                      <span className="text-sm font-semibold text-gray-900">95 млрд сум</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      Погашение просрочки РЭС
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">15 июня</span>
                      <span className="text-sm font-semibold text-gray-900">18 млрд сум</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      Платеж по тепловой энергии
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">20 июня</span>
                      <span className="text-sm font-semibold text-gray-900">120 млрд сум</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      Очередной платеж РЭС
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">25 июня</span>
                      <span className="text-sm font-semibold text-gray-900">24 млрд сум</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      Прочие дебиторы
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Actions and Control Thresholds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommended Actions */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Рекомендуемые действия по ДЗ
                </h2>
                <p className="text-xs text-gray-600 mb-6">
                  Действия для финансового блока, юридической службы и взаимодействия с контрагентами.
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-l-red-500 bg-red-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      РЭС: согласовать график погашения 190 млрд сум просрочки
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Ответственные: финансовый директор, юридическая служба. Контролы: ежемесячно до снижения DSO ниже 45 дней.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-orange-500 bg-orange-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      НСЭ: удержать платежи в рамках 30-45 дней
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Проверить акты свечи, исключить накопление новой просрочки, синхронизировать платежи с топливными обязательствами.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-orange-500 bg-orange-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      Тепловые потребители: выделить портфель 90+ дней
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Сформировать список с претензионной работой и отдельный график реструктуризации.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-green-500 bg-green-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      FCF: сохранить положительный денежный поток
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Не допустить, чтобы рост ДЗ привел к перечему ремонтных платежей и закупок топлива.
                    </p>
                  </div>
                </div>
              </div>

              {/* Control Thresholds */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Контрольные пороги
                </h2>
                <p className="text-xs text-gray-600 mb-6">
                  Правила автоматической эскалации на уровень генерального директора.
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-l-green-500 bg-green-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">DSO ≤ 45 дней</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Норма. Контроль на уровне финансового блока.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-orange-500 bg-orange-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">DSO 46-60 дней</p>
                    <p className="text-xs text-gray-600 mt-2">
                      Контроль. Требует график погашения и акт сверки.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-red-500 bg-red-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      DSO {`>`} 60 дней или 90+ портфель растет
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Эскалация. Включить юридический блок и выстав на совещание ГД.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-red-500 bg-red-50 p-4 rounded">
                    <p className="text-sm font-semibold text-gray-900">
                      Collection Rate {`<`} 98%
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Риск кассового разрыва и перечислении ремонтов / закупок топлива.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "creditor" && (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <p className="text-gray-600">
              Содержимое по кредиторской задолженности будет добавлено вскоре.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
