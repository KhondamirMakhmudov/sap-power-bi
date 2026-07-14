"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import CustomSelect from "@/components/ui/CustomSelect";
import Loader from "@/components/ui/Loader";
import KPICardComponent from "@/components/dashboard/KPICardComponent";
import FacilityCardComponent from "@/components/dashboard/FacilityCardComponent";
import { formatCurrency } from "@/utils/helpers";
import { isAuthenticated, getSessionUsername } from "@/utils/auth";
import { get } from "lodash";

const ORG_OPTIONS = [
  { value: "",     label: "Все организации" },
  { value: "1010", label: "1010 — ТЭС ЦА (Ташкент)" },
  { value: "1020", label: "1020 — Филиал Сырдарьинская ТЭС (Ширин)" },
  // { value: "1030", label: "1030 — АО «Ташкентская ТЭС» (Ташкент)" },
  // { value: "1040", label: "1040 — АО «Навоийская ТЭС» (Навои)" },
  // { value: "1050", label: "1050 — АО «Тахиаташская ТЭС» (Тахиаташ)" },
  { value: "1060", label: "1060 — АО «Талимарджанская ТЭС» (Талимарджан)" },
  { value: "1070", label: "1070 — Филиал Туракурганская ТЭС (Туракурган)" },
  { value: "1080", label: "1080 — Филиал Мубарекская ТЭЦ (Мубарек)" },
  { value: "1090", label: "1090 — Филиал Ферганская ТЭЦ (Фергана)" },
  { value: "1100", label: "1100 — Филиал Ташкентская ТЭЦ (Ташкент)" },
  // { value: "1110", label: "1110 — ООО «Узэнергосозлаш»" },
  // { value: "1120", label: "1120 — АО «Узбекэнерготаъмир»" },
  // { value: "1130", label: "1130 — АО «Узэнерготаъминлаш» (Ташкент)" },
  { value: "1140", label: "1140 — АО «Ангренская ТЭС»" },
  // { value: "1150", label: "1150 — ООО «Ташкентская тепловая» (Ташкент)" },
];

const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const PERIOD_TYPES = [
  { value: "month",   label: "Месяц" },
  { value: "quarter", label: "Квартал" },
  { value: "half",    label: "Полугодие" },
  { value: "year",    label: "Год" },
  { value: "custom",  label: "Произвольно" },
];

const MONTH_OPTIONS = monthNames.map((label, i) => ({ value: String(i + 1), label }));
const QUARTER_OPTIONS = [1, 2, 3, 4].map((q) => ({ value: String(q), label: `${q} квартал` }));
const HALF_OPTIONS = [
  { value: "1", label: "I полугодие (янв–июн)" },
  { value: "2", label: "II полугодие (июл–дек)" },
];

const PERIOD_INDEX_LABELS = { month: "Месяц", quarter: "Квартал", half: "Полугодие" };
const PERIOD_INDEX_OPTIONS = { month: MONTH_OPTIONS, quarter: QUARTER_OPTIONS, half: HALF_OPTIONS };

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatRuDate(s) {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

// month is 1-based; quarter 1-4; half 1-2
function periodRange(type, year, index) {
  const y = parseInt(year);
  const i = parseInt(index || "1");
  let startMonth = 0, span = 12;
  if (type === "month")   { startMonth = i - 1;     span = 1; }
  if (type === "quarter") { startMonth = (i - 1) * 3; span = 3; }
  if (type === "half")    { startMonth = (i - 1) * 6; span = 6; }
  const from = new Date(y, startMonth, 1);
  const to = new Date(y, startMonth + span, 0);
  return [toDateStr(from), toDateStr(to)];
}

function defaultIndexFor(type, month) {
  if (type === "quarter") return String(Math.ceil(month / 3));
  if (type === "half")    return String(month <= 6 ? 1 : 2);
  return String(month);
}

export default function DashboardPage({ username }) {
  const router = useRouter();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearOptions = [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ];

  const [filters, setFilters] = useState(() => {
    const periodIndex = defaultIndexFor("month", currentMonth);
    const [dateFrom, dateTo] = periodRange("month", currentYear, periodIndex);
    return {
      periodType: "month",
      periodYear: String(currentYear),
      periodIndex,
      dateFrom,
      dateTo,
      scenario: "",
      control: "",
      comp: "",
    };
  });
  const [dashboardApiResponse, setDashboardApiResponse] = useState(null);
  const [dashboardApiLoading, setDashboardApiLoading] = useState(false);
  const [dashboardApiError, setDashboardApiError] = useState(null);

  function selectPeriodType(type) {
    if (type === "custom") {
      setFilters((f) => ({ ...f, periodType: type }));
      return;
    }
    const periodIndex = defaultIndexFor(type, currentMonth);
    const [dateFrom, dateTo] = periodRange(type, filters.periodYear, periodIndex);
    setFilters((f) => ({ ...f, periodType: type, periodIndex, dateFrom, dateTo }));
  }

  function selectPeriodYear(year) {
    const [dateFrom, dateTo] = periodRange(filters.periodType, year, filters.periodIndex);
    setFilters((f) => ({ ...f, periodYear: year, dateFrom, dateTo }));
  }

  function selectPeriodIndex(index) {
    const [dateFrom, dateTo] = periodRange(filters.periodType, filters.periodYear, index);
    setFilters((f) => ({ ...f, periodIndex: index, dateFrom, dateTo }));
  }

  const postDashboardData = async () => {
    const { dateFrom, dateTo } = filters;
    if (!dateFrom || !dateTo) {
      setDashboardApiError("Выберите период");
      return;
    }

    setDashboardApiLoading(true);
    setDashboardApiError(null);

    try {
      const response = await fetch("/api/dashboard/post_fi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date_from: dateFrom,
          date_to: dateTo,
          ...(filters.comp ? { comp: filters.comp } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      setDashboardApiResponse(responseData);

      // You can map this responseData into KPI and facilities content when ready.
      console.log("Dashboard POST response:", responseData);
    } catch (error) {
      setDashboardApiError(error?.message || "Failed to fetch dashboard data");
      console.error("Dashboard POST error:", error);
    } finally {
      setDashboardApiLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => postDashboardData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetFilters = () => {
    const periodIndex = defaultIndexFor("month", currentMonth);
    const [dateFrom, dateTo] = periodRange("month", currentYear, periodIndex);
    setFilters({
      periodType: "month",
      periodYear: String(currentYear),
      periodIndex,
      dateFrom,
      dateTo,
      scenario: "",
      control: "",
      comp: "",
    });
    setDashboardApiResponse(null);
    setDashboardApiError(null);
  };

  const apiFacilities =
    get(dashboardApiResponse, "data") ??
    get(dashboardApiResponse, "Data") ??
    [];
  const facilityList =
    Array.isArray(apiFacilities) && apiFacilities.length > 0
      ? apiFacilities
      : [];
  const showPlanAndChangeInKpi = filters.scenario === "Факт / план";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <MainLayout username={username}>
      <div className="space-y-8">
        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
              Выйти
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900/40 rounded-lg p-1">
              {PERIOD_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => selectPeriodType(pt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    filters.periodType === pt.value
                      ? "bg-slate-900 dark:bg-slate-700 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatRuDate(filters.dateFrom)} – {formatRuDate(filters.dateTo)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
            {filters.periodType === "custom" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    С
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    max={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    По
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    min={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <CustomSelect
                  label="Год"
                  options={yearOptions}
                  value={filters.periodYear}
                  placeholder="Год"
                  onChange={selectPeriodYear}
                />
                {PERIOD_INDEX_OPTIONS[filters.periodType] && (
                  <CustomSelect
                    label={PERIOD_INDEX_LABELS[filters.periodType]}
                    options={PERIOD_INDEX_OPTIONS[filters.periodType]}
                    value={filters.periodIndex}
                    placeholder="Период"
                    onChange={selectPeriodIndex}
                  />
                )}
              </>
            )}
            <CustomSelect
              label="Сценарий"
              options={[
                { value: "Факт / план", label: "Факт / план" },
                { value: "Только факт", label: "Только факт" },
              ]}
              value={filters.scenario}
              placeholder="Выберите"
              onChange={(value) => setFilters({ ...filters, scenario: value })}
            />
            <CustomSelect
              label="Контур"
              options={[
                { value: "Вся компания", label: "Вся компания" },
                { value: "Генерация", label: "Генерация" },
              ]}
              value={filters.control}
              placeholder="Выберите"
              onChange={(value) => setFilters({ ...filters, control: value })}
            />
            <CustomSelect
              label="Организация"
              options={ORG_OPTIONS}
              value={filters.comp}
              placeholder="Все организации"
              onChange={(value) => setFilters({ ...filters, comp: value })}
            />
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => postDashboardData()}
                disabled={dashboardApiLoading}
                className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
              >
                {dashboardApiLoading ? "Загрузка..." : "Применить"}
              </button>
              {dashboardApiResponse && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors text-sm"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
          {dashboardApiError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-3">
              {dashboardApiError}
            </p>
          )}
        </div>

        {dashboardApiLoading ? (
          <Loader
            label="Загрузка данных за выбранный месяц..."
            className="min-h-105"
          />
        ) : !dashboardApiResponse ? (
          <div className="flex flex-col items-center justify-center min-h-80 py-12 px-8 text-center">
            <i
              className="ti ti-calendar-off text-4xl text-gray-300 dark:text-gray-400 mb-4"
              aria-hidden="true"
            />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Нет данных
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-65 leading-relaxed">
              Выберите период в фильтре выше, чтобы загрузить данные
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPICardComponent
                label={"Выручка"}
                value={get(dashboardApiResponse, "Viruchka")}
                plan={get(dashboardApiResponse, "P_Viruchka", 0)}
                change={get(dashboardApiResponse, "PF_Viruchka", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="сум"
                unit={"сум"}
              />

              <KPICardComponent
                label={"EBITDA"}
                value={get(dashboardApiResponse, "EBITDA")}
                plan={get(dashboardApiResponse, "P_EBITDA", 0)}
                change={get(dashboardApiResponse, "PF_EBITDA", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="сум"
                unit={"сум"}
              />
              <KPICardComponent
                label={"Чистая прибыль"}
                value={get(dashboardApiResponse, "ChistiyPribil", 0)}
                plan={get(dashboardApiResponse, "P_ChistiyPribil", 0)}
                change={get(dashboardApiResponse, "PF_ChistiyPribil", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="сум"
                unit={"сум"}
              />
              <KPICardComponent
                label={"Реализация электр энергии"}
                value={get(dashboardApiResponse, "VirabotkaEE")}
                plan={get(dashboardApiResponse, "P_VirabotkaEE", 0)}
                change={get(dashboardApiResponse, "PF_VirabotkaEE", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="кВтч"
                unit={"кВтч"}
              />
              <KPICardComponent
                label={"Средняя доступная мощность"}
                value={get(dashboardApiResponse, "VirabotkaTE")}
                plan={get(dashboardApiResponse, "P_VirabotkaTE", 0)}
                change={get(dashboardApiResponse, "PF_VirabotkaTE", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="МВт"
                unit={"МВт"}
              />
              <KPICardComponent
                label={"УРУТ"}
                value={get(dashboardApiResponse, "urug")}
                plan={get(dashboardApiResponse, "P_urug", 0)}
                change={get(dashboardApiResponse, "PF_urug", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="г/кВтч"
                unit={"г/кВтч"}
              />
            </div>

            {/* Stations Under Attention */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Станции в зоне внимания
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Активы, влияющие на месячный результат компании.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilityList.map((facility, idx) => (
                  <FacilityCardComponent
                    key={idx}
                    name={get(facility, "BE", get(facility, "name", "-"))}
                    status={get(facility, "status")}
                    statusDot={get(facility, "statusDot", "orange")}
                    metrics={{
                      output: get(
                        facility,
                        "VirabotkaEE",
                        get(facility, "metrics.output", 0),
                      ),
                      outputKey: "VirabotkaEE",
                      outputPlan: get(
                        facility,
                        "P_VirabotkaEE",
                        get(
                          facility,
                          "metrics.outputPlan",
                          get(facility, "metrics.outputSecondary", 0),
                        ),
                      ),
                      outputPlanKey: "P_VirabotkaEE",
                      power: get(
                        facility,
                        "metrics.power",
                        get(facility, "sdm", "-"),
                      ),
                      powerKey: "sdm",
                      urug: get(
                        facility,
                        "metrics.urug",
                        get(facility, "urug", "-"),
                      ),
                      urugKey: "urug",
                    }}
                    risk={get(facility, "risk", "")}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { username: getSessionUsername(req) ?? "" } };
}
