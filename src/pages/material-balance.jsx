"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import CustomSelect from "@/components/ui/CustomSelect";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

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

const stationOptions = [
  { value: "all", label: "Все станции" },
  { value: "syrdarya", label: "Сырдарьинская ТЭС" },
  { value: "novo-angrensky", label: "Ново-Ангренская ТЭС" },
  { value: "angrensky", label: "Ангренская ТЭС" },
];

const balanceTypeOptions = [
  { value: "fuel-power", label: "Топливо → электроэнергия" },
  { value: "fuel-heat", label: "Топливо → теплоэнергия" },
];

const unitOptions = [
  { value: "tut", label: "т.у.т." },
  { value: "gcal", label: "Гкал" },
];

const materialKpis = [
  {
    label: "Входящее топливо",
    value: "1 610",
    unit: "тыс. т.у.т.",
    plan: "План: 1 585",
    status: "Норма",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "Выработка",
    value: "5,3",
    unit: "млрд кВт∙ч",
    plan: "План: 5.3",
    status: "Норма",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "Отпуск с учи",
    value: "5",
    unit: "млрд кВт∙ч",
    plan: "План: 5",
    status: "Норма",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "Собственные нужды",
    value: "5,5%",
    unit: "",
    plan: "План: 5.4%",
    status: "Норма",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "УРУТ",
    value: "311,5",
    unit: "г/кВт∙ч",
    plan: "План: 305",
    status: "Контроль",
    statusType: "warning",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Расхождение баланса",
    value: "0,6%",
    unit: "",
    plan: "Цели: ≤ 1.0%",
    status: "Норма",
    statusType: "success",
    borderColor: "border-l-4 border-l-green-500",
  },
];

const balanceComponents = [
  {
    component: "Поступление топлива",
    fact: "1 610 тыс. т.у.т.",
    plan: "1 585",
    deviation: "1,6%",
    status: "Норма",
  },
  {
    component: "Расход топлива",
    fact: "1 497,3 тыс. т.у.т.",
    plan: "1 474.1",
    deviation: "1,6%",
    status: "Норма",
  },
  {
    component: "Выработка электроэнергии",
    fact: "5,3 млрд кВт∙ч",
    plan: "5.3",
    deviation: "-0,8%",
    status: "Норма",
  },
  {
    component: "Отпуск с шин",
    fact: "5 млрд кВт∙ч",
    plan: "5",
    deviation: "-0,6%",
    status: "Норма",
  },
  {
    component: "Собственные нужды",
    fact: "5,5%",
    plan: "5.4%",
    deviation: "0,1 п.п.",
    status: "Норма",
  },
  {
    component: "УРУТ",
    fact: "311,5 г/кВт∙ч",
    plan: "305",
    deviation: "2,1%",
    status: "Контроль",
  },
];

const fuelReserves = [
  { fuel: "Газ", amount: "1 040 млн м³", bar: "w-3/4" },
  { fuel: "Уголь", amount: "420 тыс. т", bar: "w-2/3" },
  { fuel: "Мазут", amount: "18 тыс. т", bar: "w-1/2" },
  { fuel: "Дней запаса", amount: "17 дней", bar: "w-1/2" },
];

const stationBalance = [
  {
    station: "Сырдарьинская ТЭС",
    fuel: "326 тыс. т.у.т.",
    output: "1,1 млрд кВт∙ч",
    delivery: "1 млрд кВт∙ч",
    ownNeeds: "5,6%",
    urut: "302",
    status: "Норма",
  },
  {
    station: "Ново-Ангренская ТЭС",
    fuel: "258 тыс. т.у.т.",
    output: "0,8 млрд кВт∙ч",
    delivery: "0,7 млрд кВт∙ч",
    ownNeeds: "6,2%",
    urut: "326",
    status: "Контроль",
  },
  {
    station: "Ангренская ТЭС",
    fuel: "159 тыс. т.у.т.",
    output: "0,5 млрд кВт∙ч",
    delivery: "0,4 млрд кВт∙ч",
    ownNeeds: "6,8%",
    urut: "351",
    status: "Вмешательство",
  },
  {
    station: "Наводнинская ТЭС",
    fuel: "248 тыс. т.у.т.",
    output: "0,8 млрд кВт∙ч",
    delivery: "0,8 млрд кВт∙ч",
    ownNeeds: "4,9%",
    urut: "296",
    status: "Норма",
  },
  {
    station: "Талимарджанская ТЭС",
    fuel: "214 тыс. т.у.т.",
    output: "0,7 млрд кВт∙ч",
    delivery: "0,7 млрд кВт∙ч",
    ownNeeds: "4,7%",
    urut: "289",
    status: "Норма",
  },
  {
    station: "Туракургинская ТЭС",
    fuel: "166 тыс. т.у.т.",
    output: "0,6 млрд кВт∙ч",
    delivery: "0,5 млрд кВт∙ч",
    ownNeeds: "4,8%",
    urut: "284",
    status: "Норма",
  },
  {
    station: "Тахинтинская ТЭС",
    fuel: "130 тыс. т.у.т.",
    output: "0,4 млрд кВт∙ч",
    delivery: "0,4 млрд кВт∙ч",
    ownNeeds: "5,7%",
    urut: "312",
    status: "Норма",
  },
  {
    station: "Ташкентская ТЭЦ",
    fuel: "64 тыс. т.у.т.",
    output: "0,2 млрд кВт∙ч",
    delivery: "0,2 млрд кВт∙ч",
    ownNeeds: "6,1%",
    urut: "238",
    status: "Норма",
  },
];

const recommendedActions = [
  {
    title: "Баланс сходится",
    description:
      "Расхождение находится в допустимом диапазоне. Продолжить ежемесячный контроль.",
    icon: "check",
  },
  {
    title: "Контроль УРУТ",
    description:
      "Сопоставить отклонение УРУТ с загруженность блоков, качеством топлива, пусками/остановками и режимом работы котлов.",
    icon: "alert",
  },
  {
    title: "Собственные нужды",
    description:
      "Разложить собственные нужды по насосам, вентиляторам, мельницам и вспомогательному оборудованию.",
    icon: "check",
  },
  {
    title: "Запасы топлива",
    description:
      "Контролировать достаточность запасов и график поставок, особенно для станций с угольной или мазутной составляющей.",
    icon: "alert",
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Норма":
      return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
    case "Контроль":
      return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
    case "Вмешательство":
      return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
  }
};

export default function MaterialBalancePage() {
  const [selectedMonth, setSelectedMonth] = useState("may");
  const [selectedScenario, setSelectedScenario] = useState("fact");
  const [selectedContour, setSelectedContour] = useState("all");
  const [selectedStation, setSelectedStation] = useState("all");
  const [selectedBalanceType, setSelectedBalanceType] = useState("fuel-power");
  const [selectedUnit, setSelectedUnit] = useState("tut");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Материальный баланс
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Топливо — энергия</p>
        </div>

        {/* First Filter Row */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Месяц
              </label>
              <CustomSelect
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сценарий
              </label>
              <CustomSelect
                options={scenarioOptions}
                value={selectedScenario}
                onChange={setSelectedScenario}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

        {/* Second Filter Row */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Станция
              </label>
              <CustomSelect
                options={stationOptions}
                value={selectedStation}
                onChange={setSelectedStation}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип баланса
              </label>
              <CustomSelect
                options={balanceTypeOptions}
                value={selectedBalanceType}
                onChange={setSelectedBalanceType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Единицы
              </label>
              <CustomSelect
                options={unitOptions}
                value={selectedUnit}
                onChange={setSelectedUnit}
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Сбросить
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {materialKpis.map((kpi, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${kpi.borderColor}`}
            >
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                {kpi.value}{" "}
                <span className="text-sm text-gray-600 dark:text-gray-400">{kpi.unit}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{kpi.plan}</p>
              <p
                className={`text-xs font-semibold mt-2 ${kpi.statusType === "success" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
              >
                {kpi.status}
              </p>
            </div>
          ))}
        </div>

        {/* Energy Flow Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 border-l-green-500">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              входящее топливо
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">1 610</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">тыс. т.у.т.</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              Газ, уголь, мазут в пересчете на условное топливо за выбранный
              месяц.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 border-l-orange-500">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              преобразование
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">38,4%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">КПД нетто</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              Контроль УРУТ, собственных нужд и тепловых потерь.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 border-l-green-500">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              полезный отпуск
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">5</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">млрд кВт∙ч</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              Отпуск с шин плюс полезный отпуск тепловой энергии для ТЭЦ.
            </p>
          </div>
        </div>

        {/* Balance Analysis - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Balance Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Баланс топлива и энергии
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Проверка сходимости: поступление топлива, расход, выработка,
                  собственные нужды, потери и остатки.
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                баланс сходится
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-900/40 rounded">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Поступление
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">1 610</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Расход</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">1 497,3</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Остатки</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">96,6</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Потери / небаланс
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">0,6%</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">КПД нетто</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">38,4%</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg mb-6">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                Расхождение материального баланса составляет 0,6% — в допустимом
                диапазоне.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase">
                компонент баланса
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Компонент
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Факт
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        План
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Отклонение
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceComponents.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                      >
                        <td className="py-3 px-3 text-gray-900 dark:text-gray-100">
                          {item.component}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                          {item.fact}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                          {item.plan}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                          {item.deviation}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Fuel Reserves */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Остатки топлива
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
              Контроль запасов, достаточности и риска ограничения генерации.
            </p>

            <div className="space-y-6">
              {fuelReserves.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.fuel}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {item.amount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`${item.bar} bg-green-500 h-2 rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material Balance by Stations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Материальный баланс по станциям
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
            Сравнение станций по входящему топливу, отпуску с шин и удельным
            показателям.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    станция
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    топливо
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    выработка
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    отпуск с шин
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    собств. нужды
                  </th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    урут
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {stationBalance.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                  >
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-medium">
                      {item.station}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                      {item.fuel}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                      {item.output}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                      {item.delivery}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                      {item.ownNeeds}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-600 dark:text-blue-400 font-medium">
                      {item.urut}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Рекомендуемые действия
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
            Автоматические подсказки по управлению топливом и потерями.
          </p>

          <div className="space-y-4">
            {recommendedActions.map((action, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded ${action.icon === "check" ? "border-l-green-500 bg-green-50 dark:bg-green-950/30" : "border-l-orange-500 bg-orange-50 dark:bg-orange-950/30"}`}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {action.title}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
}
