"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import CustomSelect from "@/components/ui/CustomSelect";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

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

const assetTypeOptions = [
  { value: "all", label: "Все" },
  { value: "tes", label: "ТЭС" },
  { value: "gpp", label: "ПГУ новая генерация" },
];

const statusOptions = [
  { value: "all", label: "Все" },
  { value: "control", label: "Контроль" },
  { value: "normal", label: "Норма" },
  { value: "warning", label: "Вмешательство" },
];

const productionKpis = [
  {
    label: "Доступная мощность",
    value: "9 264,8",
    unit: "МВт",
    plan: "План: 9 468 МВт",
    status: "-2.1% к плану",
    statusType: "negative",
    borderColor: "border-l-4 border-l-green-500",
  },
  {
    label: "Выработка",
    value: "5,1",
    unit: "млрд кВт∙ч / месяц",
    plan: "План: 5.3 млрд",
    status: "-3.4% к плану",
    statusType: "negative",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Средняя готовность",
    value: "83,5",
    unit: "%",
    plan: "План: 90%",
    status: "-7.2% к плану",
    statusType: "negative",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Средний УРУТ",
    value: "290,3",
    unit: "г/кВт∙ч",
    plan: "План: 305 г/кВт∙ч",
    status: "-4.8% к плану",
    statusType: "positive",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Отпуск с учи",
    value: "4,9",
    unit: "млрд кВт∙ч / месяц",
    plan: "План: 5 млрд",
    status: "-3.4% к плану",
    statusType: "negative",
    borderColor: "border-l-4 border-l-orange-500",
  },
  {
    label: "Собственные нужды",
    value: "5,5",
    unit: "%",
    plan: "План: 5.4%",
    status: "+1.9% к плану",
    statusType: "negative",
    borderColor: "border-l-4 border-l-green-500",
  },
];

const powerPlants = [
  {
    name: "Сырдарьинская ТЭС",
    type: "ТЭС",
    region: "Сырдарьинская область - Газ / мазут",
    status: "control",
    output: "1,1 / 1,1 млрд кВт∙ч",
    planStatus: "-2.8% к плану",
    availableCapacity: "2 790 МВт",
    operatingCapacity:
      "Средняя доступная мощность: 93%, Готовность: 302 г/кВт∙ч, УРУТ: 2 Нарушения",
  },
  {
    name: "Ново-Ангренская ТЭС",
    type: "ТЭС",
    region: "Ташкентская область - Уголь / газ",
    status: "normal",
    output: "0.8 / 0.8 млрд кВт∙ч",
    planStatus: "-2.6% к плану",
    availableCapacity: "1 890 МВт",
    operatingCapacity:
      "Средняя доступная мощность: 90%, Готовность: 334 г/кВт∙ч, УРУТ: 4 Нарушения",
  },
  {
    name: "Ангренская ТЭС",
    type: "ТЭС",
    region: "Ташкентская область - Уголь / газ",
    status: "normal",
    output: "0.4 / 0.5 млрд кВт∙ч",
    planStatus: "-14% к плану",
    availableCapacity: "413 МВт",
    operatingCapacity:
      "Средняя доступная мощность: 86%, Готовность: 351 г/кВт∙ч, УРУТ: 7 Нарушения",
  },
  {
    name: "Наводнинская ТЭС",
    type: "ПГУ новая генерация",
    region: "Наводойская область - Газ",
    status: "normal",
    output: "0.8 / 0.8 млрд кВт∙ч",
    planStatus: "+2.5% к плану",
    availableCapacity: "1 890 МВт",
    operatingCapacity:
      "Средняя доступная мощность: высокая, Готовность: хорошая, УРУТ: минимум",
  },
  {
    name: "Талимарджанская ТЭС",
    type: "ПГУ новая генерация",
    region: "Сурхандарьинская область - Газ",
    status: "normal",
    output: "0.7 / 0.7 млрд кВт∙ч",
    planStatus: "+1.4% к плану",
    availableCapacity: "1 890 МВт",
    operatingCapacity:
      "Средняя доступная мощность: в норме, Готовность: в норме, УРУТ: минимум",
  },
  {
    name: "Туракургинская ТЭС",
    type: "ПГУ новая генерация",
    region: "Наводойская область - Газ",
    status: "warning",
    output: "0.5 / 0.6 млрд кВт∙ч",
    planStatus: "-3.6% к плану",
    availableCapacity: "1 890 МВт",
    operatingCapacity:
      "Средняя доступная мощность: требует контроля, Готовность: ниже плана",
  },
];

const powerStations = [
  {
    num: 1,
    name: "Сырдарьинская ТЭС",
    type: "ТЭС",
    output: "1,1 млрд кВт∙ч",
    availability: "93%",
    urut: "302 г/кВт∙ч",
    repair: "98%",
    status: "Контроль",
  },
  {
    num: 2,
    name: "Наводнинская ТЭС",
    type: "ПГУ новая генерация",
    output: "0,8 млрд кВт∙ч",
    availability: "88%",
    urut: "296 г/кВт∙ч",
    repair: "91%",
    status: "Норма",
  },
  {
    num: 3,
    name: "Ново-Ангренская ТЭС",
    type: "ТЭС",
    output: "0,8 млрд кВт∙ч",
    availability: "90%",
    urut: "334 г/кВт∙ч",
    repair: "92%",
    status: "Вмешательство",
  },
  {
    num: 4,
    name: "Талимарджанская ТЭС",
    type: "ПГУ новая генерация",
    output: "0,7 млрд кВт∙ч",
    availability: "85%",
    urut: "289 г/кВт∙ч",
    repair: "89%",
    status: "Норма",
  },
  {
    num: 5,
    name: "Туракургинская ТЭС",
    type: "ПГУ новая генерация",
    output: "0,5 млрд кВт∙ч",
    availability: "84%",
    urut: "284 г/кВт∙ч",
    repair: "86%",
    status: "Контроль",
  },
  {
    num: 6,
    name: "Ташкентская ТЭЦ",
    type: "ТЭЦ",
    output: "0,2 млрд кВт∙ч",
    availability: "78%",
    urut: "238 г/кВт∙ч",
    repair: "82%",
    status: "Контроль",
  },
  {
    num: 7,
    name: "Тахинтинская ТЭС",
    type: "ТЭС",
    output: "0,4 млрд кВт∙ч",
    availability: "82%",
    urut: "312 г/кВт∙ч",
    repair: "84%",
    status: "Контроль",
  },
  {
    num: 8,
    name: "Ангренская ТЭС",
    type: "ТЭС",
    output: "0,4 млрд кВт∙ч",
    availability: "86%",
    urut: "351 г/кВт∙ч",
    repair: "85%",
    status: "Вмешательство",
  },
  {
    num: 9,
    name: "Ферганская ТЭЦ",
    type: "ТЭЦ",
    output: "0,1 млрд кВт∙ч",
    availability: "76%",
    urut: "245 г/кВт∙ч",
    repair: "78%",
    status: "Вмешательство",
  },
  {
    num: 10,
    name: "Мубаракская ТЭЦ",
    type: "ТЭЦ",
    output: "0,1 млрд кВт∙ч",
    availability: "73%",
    urut: "252 г/кВт∙ч",
    repair: "75%",
    status: "Контроль",
  },
];

const criticalIssues = [
  {
    name: "Ангренская ТЭС",
    issue:
      "Высокий УРУТ, рост нарушений, ремонтная программа 85%. Требуется отдельный план стабилизации.",
    status: "warning",
  },
  {
    name: "Ферганская ТЭЦ",
    issue:
      "Готовность 76%, ремонтная программа 78%. Риск для отопительного периода.",
    status: "warning",
  },
  {
    name: "Ново-Ангренская ТЭС",
    issue:
      "Экологическая модернизация и топливная эффективность требует решения на уровне правления.",
    status: "error",
  },
  {
    name: "Туракургинская ТЭС",
    issue:
      "Ограниченная мощность на одном блоке. Необходимо закрыть диагностику и план восстановления.",
    status: "warning",
  },
  {
    name: "Ташкентская ТЭЦ",
    issue:
      "Потеря тепла и теплосетей требуют усиленного контроля перед зимним периодом.",
    status: "warning",
  },
];

export default function ProductionPage() {
  const [selectedMonth, setSelectedMonth] = useState("may");
  const [selectedAssetType, setSelectedAssetType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusBadge = (status) => {
    switch (status) {
      case "control":
        return "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/30";
      case "normal":
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/30";
      case "warning":
        return "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/30";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

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

  const getIssueColor = (status) => {
    return status === "error"
      ? "border-l-red-500 bg-red-50 dark:bg-red-950/30"
      : "border-l-orange-500 bg-orange-50 dark:bg-orange-950/30";
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Производство</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Показатели работы активов</p>
        </div>

        {/* Filters */}
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
                Тип актива
              </label>
              <CustomSelect
                options={assetTypeOptions}
                value={selectedAssetType}
                onChange={setSelectedAssetType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Статус
              </label>
              <CustomSelect
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
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
          {productionKpis.map((kpi, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${kpi.borderColor}`}
            >
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {kpi.value}{" "}
                <span className="text-sm text-gray-600 dark:text-gray-400">{kpi.unit}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{kpi.plan}</p>
              <p
                className={`text-xs font-semibold mt-2 ${kpi.statusType === "positive" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {kpi.status}
              </p>
            </div>
          ))}
        </div>

        {/* Power Plants Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Основные тепловые электростанции
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {powerPlants.map((plant, index) => (
              <div
                key={index}
                className={`rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${getStatusBadge(plant.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {plant.type}
                    </h3>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {plant.name}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{plant.region}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {plant.status === "normal" ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : plant.status === "warning" ? (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    )}
                    <span className="text-xs font-medium">Текущий статус</span>
                  </div>
                </div>

                <div className="border-t border-current border-opacity-10 pt-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {plant.output}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    факт / план за месяц
                  </p>
                  <p
                    className={`text-sm font-semibold mt-2 ${plant.planStatus.includes("-") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
                  >
                    {plant.planStatus}
                  </p>

                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 bg-opacity-50 rounded">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {plant.operatingCapacity}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    <span className="font-medium">
                      {plant.availableCapacity}
                    </span>{" "}
                    в подключенной сети
                  </p>
                </div>

                <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Детали →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Comparative Table and Critical Issues */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparative Assets Table */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Сравнительная таблица активов
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
              Бойтай рейтинг для ежемесячного совещания выработку, готовность,
              эффективность и ремонтная дисциплина.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      #
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      СТАНЦИЯ
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      ТИП
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      ВЫРАБОТКА
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      ГОТОВНОСТЬ
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      УРУТ
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      РЕМОНТ
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      СТАТУС
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {powerStations.map((station, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-100 font-medium">
                        {station.num}
                      </td>
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-100">
                        {station.name}
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400 text-xs">
                        {station.type}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                        {station.output}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                        {station.availability}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                        {station.urut}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-900 dark:text-gray-100">
                        {station.repair}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(station.status)}`}
                        >
                          {station.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Критические вопросы
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
              Проблемы, которые должны иметь мероприятия, срок и ответственного.
            </p>

            <div className="space-y-3">
              {criticalIssues.map((issue, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded ${getIssueColor(issue.status)}`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {issue.name}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2">{issue.issue}</p>
                </div>
              ))}
            </div>
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
