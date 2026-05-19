"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

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

const scenarioOptions = [
  { value: "fact", label: "Факт / бюджет" },
  { value: "forecast", label: "Прогноз" },
  { value: "plan", label: "План" },
];

const contourOptions = [
  { value: "all", label: "ПГУ / новая генерация" },
  { value: "tes", label: "ТЭС" },
  { value: "pgu", label: "ПГУ" },
];

const recommendedActions = [
  {
    title: "Стабилизировать Ангренскую ТЭС",
    description:
      "5 технологических нарушений и высокий УРУТ. Нужен отдельный план по надежности и топливной эффективности.",
    borderColor: "border-l-4 border-l-red-500",
    bgColor: "bg-red-50",
    icon: "alert",
  },
  {
    title: "Снизить УРУТ по старым блокам",
    description:
      "Отклонение УРУТ влияет на себестоимость в EBITDA. Нужен план по котлоагрегатам и режимам.",
    borderColor: "border-l-4 border-l-red-500",
    bgColor: "bg-red-50",
    icon: "alert",
  },
  {
    title: "Сохранить выполнение производственного плана",
    description:
      "Выработка и доступная мощность в допустимом диапазоне. Продолжить ежемесячный мониторинг.",
    borderColor: "border-l-4 border-l-green-500",
    bgColor: "bg-green-50",
    icon: "check",
  },
  {
    title: "Контролировать плановые ремонты без эскалации",
    description:
      "Плановые ремонты идут в рабочем режиме, влияние на месячный баланс компенсировано.",
    borderColor: "border-l-4 border-l-green-500",
    bgColor: "bg-green-50",
    icon: "check",
  },
  {
    title: "Поддержать положительную динамику EBITDA",
    description:
      "EBITDA близка к плану, основной резерв — снижение УРУТ. Основной резерв — снижение топливной составляющей.",
    borderColor: "border-l-4 border-l-blue-500",
    bgColor: "bg-blue-50",
    icon: "trending",
  },
];

const thresholdSignals = [
  {
    title: "Зеленый сигнал: производственный план в допустимом диапазоне",
    description: "Выработка компании -0.8% к плану, отклонение компенсируемое.",
    type: "success",
    borderColor: "border-l-4 border-l-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Зеленый сигнал: плановые ремонты без эскалации",
    description:
      "3 блока в ремонте при плане 3; критического влияния на баланс нет.",
    type: "success",
    borderColor: "border-l-4 border-l-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Желтый сигнал: 2-3 технологических нарушения",
    description: "Отдельные станции требуют контроля прячин и мероприятий.",
    type: "warning",
    borderColor: "border-l-4 border-l-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Красный сигнал: больше 3 нарушений",
    description: "Ангренская ТЭС: 5 нарушений, нужна программа стабилизации.",
    type: "error",
    borderColor: "border-l-4 border-l-red-500",
    bgColor: "bg-red-50",
  },
];

export default function ActionsPage() {
  const [selectedMonth, setSelectedMonth] = useState("may");
  const [selectedScenario, setSelectedScenario] = useState("fact");
  const [selectedContour, setSelectedContour] = useState("all");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Рекомендуемые действия
          </h1>
          <p className="text-gray-600 mt-1">Решения ГД</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Месяц
              </label>
              <CustomSelect
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сценарий
              </label>
              <CustomSelect
                options={scenarioOptions}
                value={selectedScenario}
                onChange={setSelectedScenario}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Контур
              </label>
              <CustomSelect
                options={contourOptions}
                value={selectedContour}
                onChange={setSelectedContour}
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Сбросить
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Actions and Threshold Signals - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Recommended Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Рекомендуемые действия
            </h2>
            <p className="text-xs text-gray-600 mb-6">
              События и инициативы, которые должны быть приняты на основе
              текущих данных и планов.
            </p>

            <div className="space-y-4">
              {recommendedActions.map((action, index) => (
                <div
                  key={index}
                  className={`${action.borderColor} ${action.bgColor} p-4 rounded`}
                >
                  <div className="flex items-start gap-3">
                    {action.icon === "alert" ? (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                    ) : action.icon === "check" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 text-blue-600 mt-1 shrink-0">
                        ↗
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-700 mt-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Threshold Signals */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Пороговые сигналы
            </h2>
            <p className="text-xs text-gray-600 mb-6">
              События, которые должны автоматически попадать на стартовый экран.
            </p>

            <div className="space-y-4">
              {thresholdSignals.map((signal, index) => (
                <div
                  key={index}
                  className={`${signal.borderColor} ${signal.bgColor} p-4 rounded`}
                >
                  <div className="flex items-start gap-3">
                    {signal.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                    ) : signal.type === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {signal.title}
                      </p>
                      <p className="text-xs text-gray-700 mt-2">
                        {signal.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-lg p-8 text-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">
            Итоговый статус на май 2026
          </h2>
          <p className="text-sm text-slate-200 mb-6">
            Производственные показатели в целом соответствуют плану. Основной
            риск сосредоточен на одной старой станции (Ангренская ТЭС) с
            повышенным УРУТ и технологическими нарушениями. Финансовые
            показатели близки к плану, с резервом по снижению УРУТ и оптимизации
            топливной составляющей. Рекомендуется концентрация внимания на
            стабилизации Ангренской ТЭС в ближайший квартал.
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-lg font-semibold">
              Статус: Контрольный мониторинг
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
