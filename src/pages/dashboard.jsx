"use client";

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import CustomSelect from "@/components/ui/CustomSelect";
import { formatCurrency } from "@/utils/helpers";

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    month: "Июнь",
    scenario: "Факт / план",
    control: "Вся компания",
  });

  const kpiData = [
    {
      label: "Выручка",
      value: "2.92 трлн сум",
      plan: "2.91 трлн сум",
      change: "+0.3% к плану",
      borderColor: "border-l-4 border-green-600",
    },
    {
      label: "EBITDA",
      value: "676 млрд сум",
      plan: "685 млрд сум",
      change: "-1.3% к плану",
      borderColor: "border-l-4 border-orange-500",
    },
    {
      label: "Чистая прибыль",
      value: "213 млрд сум",
      plan: "220 млрд сум",
      change: "-3.2% к плану",
      borderColor: "border-l-4 border-orange-500",
    },
    {
      label: "Выработка",
      value: "5.28 млрд кВтч",
      plan: "5.32 млрд кВтч",
      change: "-0.8% к плану",
      borderColor: "border-l-4 border-green-600",
    },
    {
      label: "Средняя доступная мощность",
      value: "10 120 МВт",
      plan: "10 220 МВт",
      change: "-1.0% к плану",
      borderColor: "border-l-4 border-green-600",
    },
    {
      label: "УРУГ",
      value: "311.5 г/кВтч",
      plan: "305.0 г/кВтч",
      change: "+2.1% к плану",
      borderColor: "border-l-4 border-red-600",
    },
  ];

  const facilities = [
    {
      name: "Сырдарьинская ТЭС",
      status: "Текущий статус: Норма",
      statusDot: "green",
      metrics: { output: "1.07 / 1.08", power: "3 010 МВт", urug: "302" },
      risk: "Риск: Одиночений, требующих вмешательства, нет.",
    },
    {
      name: "Ангренская ТЭС",
      status: "Текущий статус: Вмешательство",
      statusDot: "red",
      metrics: { output: "0.45 / 0.50", power: "430 МВт", urug: "351" },
      risk: "Риск: Высокий УРУГ и 5 технологических нарушений требует вмешательства.",
    },
    {
      name: "Ново-Ангренская ТЭС",
      status: "Текущий статус: Контроль",
      statusDot: "orange",
      metrics: { output: "0.77 / 0.78", power: "1 940 МВт", urug: "326" },
      risk: "Риск: Топливная эффективность требует контроля.",
    },
    {
      name: "Ферганская ТЭЦ",
      status: "Текущий статус: Норма",
      statusDot: "green",
      metrics: { output: "0.16 / 0.16", power: "112 МВт", urug: "242" },
      risk: "Риск: Отклонений, требующих вмешательства, нет.",
    },
    {
      name: "Туракурганская ТЭС",
      status: "Текущий статус: Норма",
      statusDot: "green",
      metrics: { output: "0.56 / 0.56", power: "792 МВт", urug: "284" },
      risk: "Риск: Показатели в допустимом диапазоне.",
    },
    {
      name: "Ташкентская ТЭЦ",
      status: "Текущий статус: Норма",
      statusDot: "green",
      metrics: { output: "0.22 / 0.22", power: "108 МВт", urug: "238" },
      risk: "Риск: Показатели в норме, контроль теплосетевого узла в рабочем порядке.",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CustomSelect
              label="Месяц"
              options={[
                { value: "Июнь", label: "Июнь" },
                { value: "Май", label: "Май" },
                { value: "Апрель", label: "Апрель" },
              ]}
              value={filters.month}
              onChange={(value) => setFilters({ ...filters, month: value })}
            />
            <CustomSelect
              label="Сценарий"
              options={[
                { value: "Факт / план", label: "Факт / план" },
                { value: "Только факт", label: "Только факт" },
              ]}
              value={filters.scenario}
              onChange={(value) => setFilters({ ...filters, scenario: value })}
            />
            <CustomSelect
              label="Контур"
              options={[
                { value: "Вся компания", label: "Вся компания" },
                { value: "Генерация", label: "Генерация" },
              ]}
              value={filters.control}
              onChange={(value) => setFilters({ ...filters, control: value })}
            />
            <div className="flex items-end">
              <button className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Сбросить
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpi, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${kpi.borderColor}`}
            >
              <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                {kpi.value}
              </h3>
              <p className="text-xs text-gray-500 mt-2">План: {kpi.plan}</p>
              <p
                className={`text-xs font-medium mt-2 ${kpi.change.includes("-") ? "text-red-600" : "text-green-600"}`}
              >
                {kpi.change}
              </p>
            </div>
          ))}
        </div>

        {/* Stations Under Attention */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Станции в зоне внимания
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Активы, влияющие на месячный результат компании.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                  facility.statusDot === "green"
                    ? "border-l-green-600"
                    : facility.statusDot === "red"
                      ? "border-l-red-600"
                      : "border-l-orange-500"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{facility.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {facility.status}
                    </p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      facility.statusDot === "green"
                        ? "bg-green-600"
                        : facility.statusDot === "red"
                          ? "bg-red-600"
                          : "bg-orange-500"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Выработка
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {facility.metrics.output}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">
                      Мощность
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {facility.metrics.power}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">УРУГ</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {facility.metrics.urug}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-4">{facility.risk}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
