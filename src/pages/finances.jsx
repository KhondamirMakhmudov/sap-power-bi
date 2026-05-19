"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

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

const kpiCards = [
  {
    label: "Выручка",
    value: "2.92 трлн сум",
    plan: "План: 2.91 трлн сум",
    change: "+8.3% к плану",
    status: "positive",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "EBITDA",
    value: "676 млрд сум",
    plan: "План: 665 млрд сум",
    change: "-1.3% к плану",
    status: "negative",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Working Capital",
    value: "-420 млрд сум",
    plan: "Цели: не хуже -350 млрд сум",
    change: "контроль ликвидности",
    status: "warning",
    borderColor: "border-l-4 border-l-red-500",
  },
  {
    label: "FCF",
    value: "+84 млрд сум",
    plan: "Цели: положительный FCF",
    change: "в норме",
    status: "positive",
    borderColor: "border-l-4 border-l-blue-500",
  },
];

const ebitdaFactors = [
  {
    factor: "Недозаработка",
    impact: "-9 млрд сум",
    reason: "Незначительное отклонение по отдельным активам",
    responsible: "Производственный блок",
  },
  {
    factor: "Рост УРУТ",
    impact: "-21 млрд сум",
    reason: "Снижение эффективности старых блоков",
    responsible: "Главный инженер",
  },
  {
    factor: "Цена топлива",
    impact: "-12 млрд сум",
    reason: "Фактическая цена выше бюджетной",
    responsible: "Финансовый блок",
  },
  {
    factor: "Собственные нужды",
    impact: "-4 млрд сум",
    reason: "Превышение целевого уровня на 0.1 п.п.",
    responsible: "Технический директор",
  },
  {
    factor: "Компенсирующие факторы",
    impact: "+37 млрд сум",
    reason: "Рост выручки, экономия прочих ОРЕХ, курсовой и прочий эффект",
    responsible: "Финансовый блок",
  },
];

const ratioCards = [
  {
    label: "Кредитный рейтинг",
    value: "BB-",
    target: "Цели: суверенный уровень РУ",
    status: "в норме",
    statusColor: "text-green-600",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "Net Debt / EBITDA",
    value: "3.2x",
    target: "Пороги: 3.5x-4.0x",
    status: "в коридоре",
    statusColor: "text-green-600",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "DSCR",
    value: "1.18x",
    target: "Пороги: > 1.1x-1.2x",
    status: "контроль",
    statusColor: "text-orange-600",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "EBITDA Margin",
    value: "23.2%",
    target: "Цели: 20%-25%",
    status: "в диапазоне",
    statusColor: "text-blue-600",
    borderColor: "border-l-4 border-l-blue-500",
  },
];

export default function FinancesPage() {
  const [selectedMonth, setSelectedMonth] = useState("may");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Финансы</h1>
          <p className="text-gray-600 mt-1">КПЭ и EBITDA</p>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${card.borderColor}`}
            >
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-3">{card.plan}</p>
              <p
                className={`text-sm font-semibold mt-2 ${
                  card.status === "positive"
                    ? "text-green-600"
                    : card.status === "negative"
                      ? "text-red-600"
                      : "text-orange-600"
                }`}
              >
                {card.change}
              </p>
            </div>
          ))}
        </div>

        {/* EBITDA Impact Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Влияние на EBITDA
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Демонстрация финансового отклонения за месяц
          </p>

          {/* Summary Banner */}
          <div className="bg-red-50 border-l-4 border-l-red-500 p-6 mb-6 rounded">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 mt-1 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Суммарное отклонение EBITDA: факт против плана
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  План: EBITDA 665 млрд сум - факт: EBITDA 676 млрд сум - ниже
                  показана декомпозиция отклонение по факторам
                </p>
              </div>
              <p className="text-2xl font-bold text-red-600 whitespace-nowrap">
                -9 млрд сум
              </p>
            </div>
          </div>

          {/* Factors Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    ФАКТОР
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    ВЛИЯНИЕ
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    ПРИЧИНА
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    ОТВЕТСТВЕННЫЙ
                  </th>
                </tr>
              </thead>
              <tbody>
                {ebitdaFactors.map((factor, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {factor.factor}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      {factor.impact}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {factor.reason}
                    </td>
                    <td className="py-4 px-4 text-sm text-blue-600">
                      {factor.responsible}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Ratios Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ratioCards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${card.borderColor}`}
            >
              <p className="text-sm font-medium text-gray-600">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-3">{card.target}</p>
              <p className={`text-sm font-semibold mt-3 ${card.statusColor}`}>
                {card.status}
              </p>
            </div>
          ))}
        </div>

        {/* Strategic Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Financial Stability */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  1. Финансовая устойчивость холдинга
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Цель — уровень суверенного кредитного рейтинга на суверенном
                  уровне РУ, чтобы сохранить доступ к дешевым зарубежным займам.
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                Комплекс
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Чистый долг / EBITDA
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">3.2x</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Цели: 3.5x-4.0x</p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  Статус: в коридоре
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Рост выше порога блокирует новые транши от Минфина и
                  международных банков.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    DSCR — коэффициент покрытия обслуживания долга
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">
                    1.18x
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Цели: строго {`>`} 1.1x-1.2x
                </p>
                <p className="text-xs text-orange-600 font-medium mt-1">
                  Статус: контроль
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Показывает способность компании обслуживать кредиты
                  модернизации ТСС без средств государства.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Liquidity */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  2. Ликвидность и платежная дисциплина
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Контроль кассовых разрывов из-за задержек оплат и дисциплины
                  расчетов НСЭ / РЭС.
                </p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                Контроль
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Свободный денежный поток, FCF
                  </h4>
                  <span className="text-2xl font-bold text-green-600">
                    +84 млрд сум
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Цели: положительный FCF
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Горизонт: год / YTD
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Маркер способности финансировать текущие ремонты станций за
                  счет собственных источников.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Collection Rate
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">
                    98.4%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Цели: ≥ 98-99%</p>
                <p className="text-xs text-gray-600 mt-1">
                  Контрагенты: НЭУ / РЭС
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Показывает уровень собираемости выручки от ключевых участников
                  энергосистемы.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    DSO просроченной дебиторской задолженности
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">
                    42 дня
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Цели: 30-45 дней</p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  Статус: в норме
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Снижение коммерческих потерь и удержание оборачиваемости в
                  рамках нормативов Минэнерго.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Operational Efficiency */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  3. Операционная эффективность и маржинальность
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Контроль эффективности производства операций и динамики
                  электроэнергии при действующих тарифах.
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                В норме
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Рентабельность по EBITDA
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">
                    23.2%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Цели: 20-25%</p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Статус: в целевом диапазоне
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Запас прочности до вычета процентов по валидным кредитам.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Удельный расход условного топлива, УРУТ
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">
                    311.5 г/кВт∙ч
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  План: 305.0 г/кВт∙ч
                </p>
                <p className="text-xs text-orange-600 font-medium mt-1">
                  Отклонение: +2.1%
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Сквозной KPI всех станций: финансовый эквивалент — Fuel Cost
                  Variance.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Fuel Cost Variance
                  </h4>
                  <span className="text-2xl font-bold text-red-600">
                    -21 млрд сум
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Причина: газ / уголь выше нормы
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Ответственный: производство + финансы
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Отклонение фактических затрат на топливо от утвержденного
                  тарифного уровня.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Investments & Reforms */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  4. Инвестиции и государственные реформы
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Контроль цифровизации, внедрения ПГУ, трансформации отчетности
                  и приватизационной готовности активов.
                </p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                Контроль
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    CapEx Execution Rate
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">78%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Цели: 95-100% годового плана
                </p>
                <p className="text-xs text-orange-600 font-medium mt-1">
                  Статус: отставание
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Недосбережение бюджета означает риск срыва новых мощностей по
                  спрограммам.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Доля станций на МСФО и международном аудите
                  </h4>
                  <span className="text-2xl font-bold text-gray-900">72%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Цели: 100%</p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Критерий: безговорочное заключение
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Доля активов, получивших безоговорочное аудиторское заключение
                  в сроки Кабинета.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Cost Reduction KPI
                  </h4>
                  <span className="text-2xl font-bold text-red-600">-6.2%</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Цели: снижение 5-10% ежегодно
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Источник: автоматизация / закупки
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Директивный показатель оптимизации непроизводственных расходов
                  холдинга.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
