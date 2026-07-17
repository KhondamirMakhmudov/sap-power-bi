"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import CustomSelect from "@/components/ui/CustomSelect";
import MultiSelect from "@/components/ui/MultiSelect";
import Loader from "@/components/ui/Loader";
import KPICardComponent from "@/components/dashboard/KPICardComponent";
import FacilityCardComponent from "@/components/dashboard/FacilityCardComponent";
import { formatCurrency } from "@/utils/helpers";
import { isAuthenticated, getSessionUsername } from "@/utils/auth";
import { get } from "lodash";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Active org codes minus 1060 (Талимарджанская ТЭС) and 1140 (Ангренская ТЭС).
const TES_BRANCHES_GROUP = ["1010", "1020", "1070", "1080", "1090", "1100"];

const ORG_OPTIONS = [
  { value: "",     label: "Все организации" },
  { value: "TES_BRANCHES", label: "АО ТЭС и филиалы" },
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

const ALL_ORG_CODES = ORG_OPTIONS.filter((o) => o.value !== "").map((o) => o.value);

// `selected` is an array of ORG_OPTIONS values (may include the "TES_BRANCHES"
// group shortcut alongside individual codes) — expand + dedupe into plain codes.
function resolveCompCodes(selected) {
  if (!selected || selected.length === 0) return null;
  const codes = new Set();
  selected.forEach((v) => {
    if (v === "TES_BRANCHES") TES_BRANCHES_GROUP.forEach((c) => codes.add(c));
    else if (v) codes.add(v);
  });
  return codes.size > 0 ? Array.from(codes) : null;
}

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

const MONTH_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

const TREND_METRIC_OPTIONS = [
  { value: "Viruchka", label: "Выручка" },
  { value: "EBIT", label: "EBIT" },
  { value: "EBITDA", label: "EBITDA" },
  { value: "ChistiyPribil", label: "Чистая прибыль" },
  { value: "VirabotkaEE", label: "Реализация электроэнергии" },
  { value: "VirabotkaTE", label: "Реализация теплоэнергии" },
];

const TREND_LINE_COLORS = [
  "#2a78d6", "#eda100", "#1baf7a", "#e34948", "#4a3aa7",
  "#e87ba4", "#008300", "#eb6834", "#0891b2", "#a855f7",
];

// Enumerates every calendar month the [dateFrom, dateTo] range touches.
function monthsInRange(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return [];
  const [fy, fm] = dateFrom.split("-").map(Number);
  const [ty, tm] = dateTo.split("-").map(Number);
  const months = [];
  let y = fy, m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    const first = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const last = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    months.push({
      label: `${MONTH_SHORT[m - 1]}.${String(y).slice(2)}`,
      dateFrom: first,
      dateTo: last,
    });
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return months;
}

function formatCompactNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(3)} трлн`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(3)} млрд`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(3)} млн`;
  return `${sign}${new Intl.NumberFormat("ru").format(abs)}`;
}

// Compact tooltip — only the hovered month's values, scrollable if the org
// list is long, so it never balloons over the rest of the chart/page.
function TrendTooltip({ active, payload, label, hiddenSeries }) {
  if (!active || !payload || payload.length === 0) return null;
  const visible = payload.filter((p) => !hiddenSeries.has(p.dataKey));
  if (visible.length === 0) return null;

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs overflow-y-auto"
      style={{ maxWidth: 260, maxHeight: 240 }}
    >
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{label}</p>
      {visible.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="truncate">{p.dataKey}</span>
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap shrink-0">
            {formatCompactNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
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
      scenario: "Факт / план",
      comp: ALL_ORG_CODES,
    };
  });
  const [dashboardApiResponse, setDashboardApiResponse] = useState(null);
  const [dashboardApiLoading, setDashboardApiLoading] = useState(false);
  const [dashboardApiError, setDashboardApiError] = useState(null);
  const [trendRaw, setTrendRaw] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(TREND_METRIC_OPTIONS[0].value);
  const [hiddenSeries, setHiddenSeries] = useState(() => new Set());

  function toggleSeries(name) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

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
    setTrendLoading(true);

    const months = monthsInRange(dateFrom, dateTo);
    const compCodes = resolveCompCodes(filters.comp);
    const compFilter = compCodes ? { be: compCodes } : {};

    try {
      const [response, ...monthResponses] = await Promise.all([
        fetch("/api/dashboard/post_fi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date_from: dateFrom,
            date_to: dateTo,
            ...compFilter,
          }),
        }),
        ...months.map((m) =>
          fetch("/api/dashboard/post_fi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date_from: m.dateFrom,
              date_to: m.dateTo,
              ...compFilter,
            }),
          }).catch(() => null),
        ),
      ]);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      setDashboardApiResponse(responseData);

      // You can map this responseData into KPI and facilities content when ready.
      console.log("Dashboard POST response:", responseData);

      const monthPayloads = await Promise.all(
        monthResponses.map((r) => (r && r.ok ? r.json().catch(() => null) : null)),
      );
      setTrendRaw(
        months.map((m, i) => {
          const payload = monthPayloads[i];
          const orgs = get(payload, "data") ?? get(payload, "Data") ?? [];
          return { month: m.label, orgs: Array.isArray(orgs) ? orgs : [] };
        }),
      );
    } catch (error) {
      setDashboardApiError(error?.message || "Failed to fetch dashboard data");
      console.error("Dashboard POST error:", error);
    } finally {
      setDashboardApiLoading(false);
      setTrendLoading(false);
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
      scenario: "Факт / план",
      comp: ALL_ORG_CODES,
    });
    setDashboardApiResponse(null);
    setDashboardApiError(null);
    setTrendRaw(null);
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

  const trendOrgNames = useMemo(() => {
    if (!trendRaw) return [];
    const set = new Set();
    trendRaw.forEach((m) => m.orgs.forEach((o) => set.add(get(o, "BE", "—"))));
    return Array.from(set);
  }, [trendRaw]);

  const trendChartDataByMetric = useMemo(() => {
    if (!trendRaw) return {};
    const result = {};
    TREND_METRIC_OPTIONS.forEach((opt) => {
      result[opt.value] = trendRaw.map((m) => {
        const row = { month: m.month };
        m.orgs.forEach((o) => {
          row[get(o, "BE", "—")] = Number(get(o, opt.value, 0)) || 0;
        });
        return row;
      });
    });
    return result;
  }, [trendRaw]);

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
            <MultiSelect
              label="Организация"
              options={ORG_OPTIONS}
              selected={filters.comp}
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
                description="Доход от основной деятельности."
              />
              <KPICardComponent
                label={"EBIT"}
                value={get(dashboardApiResponse, "EBIT")}
                plan={get(dashboardApiResponse, "P_EBIT", 0)}
                change={get(dashboardApiResponse, "PF_EBIT", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="сум"
                unit={"сум"}
                description="Прибыль до процентов и налогов."
              />
              <KPICardComponent
                label={"EBITDA"}
                value={get(dashboardApiResponse, "EBITDA")}
                plan={get(dashboardApiResponse, "P_EBITDA", 0)}
                change={get(dashboardApiResponse, "PF_EBITDA", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="сум"
                unit={"сум"}
                description="Прибыль до процентов, налогов и амортизации."
              />
              <KPICardComponent
                label={"Чистая прибыль"}
                value={get(dashboardApiResponse, "ChistiyPribil", 0)}
                plan={get(dashboardApiResponse, "P_ChistiyPribil", 0)}
                change={get(dashboardApiResponse, "PF_ChistiyPribil", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="сум"
                unit={"сум"}
                description="Финансовый результат после всех расходов."
              />
              <KPICardComponent
                label={"Реализация электроэнергии"}
                value={get(dashboardApiResponse, "VirabotkaEE")}
                plan={get(dashboardApiResponse, "P_VirabotkaEE", 0)}
                change={get(dashboardApiResponse, "PF_VirabotkaEE", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="кВтч"
                unit={"кВтч"}
                description="Количество реализованной электроэнергии."
              />
              <KPICardComponent
                label={"Реализация теплоэнергии"}
                value={get(dashboardApiResponse, "VirabotkaTE")}
                plan={get(dashboardApiResponse, "P_VirabotkaTE", 0)}
                change={get(dashboardApiResponse, "PF_VirabotkaTE", 0)}
                showPlanAndChange={showPlanAndChangeInKpi}
                displayUnit="Гкал"
                unit={"Гкал"}
                description="Количество реализованной теплоэнергии."
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
                      revenue: get(facility, "Viruchka"),
                      revenuePlan: get(facility, "P_Viruchka"),
                      ebit: get(facility, "EBIT"),
                      ebitPlan: get(facility, "P_EBIT"),
                      ebitda: get(facility, "EBITDA"),
                      ebitdaPlan: get(facility, "P_EBITDA"),
                      netProfit: get(facility, "ChistiyPribil"),
                      netProfitPlan: get(facility, "P_ChistiyPribil"),
                      electricOutput: get(facility, "VirabotkaEE"),
                      electricOutputPlan: get(facility, "P_VirabotkaEE"),
                      heatOutput: get(facility, "VirabotkaTE"),
                      heatOutputPlan: get(facility, "P_VirabotkaTE"),
                    }}
                    risk={get(facility, "risk", "")}
                  />
                ))}
              </div>
            </div>

            {/* Trend by organization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Динамика по организациям
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Помесячный тренд по организациям за период{" "}
                {formatRuDate(filters.dateFrom)} – {formatRuDate(filters.dateTo)}
                {trendChartDataByMetric[selectedMetric]?.length === 1 && (
                  <span className="block text-xs text-gray-400 dark:text-gray-500 mt-1">
                    В выбранном периоде всего один месяц — тренд покажет одну точку.
                    Выберите «Квартал», «Полугодие» или «Год», чтобы увидеть линию.
                  </span>
                )}
              </p>

              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0" style={{ height: 380 }}>
                  {trendLoading ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                      Загрузка тренда…
                    </div>
                  ) : !trendRaw ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                      Нет данных за выбранный период
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendChartDataByMetric[selectedMetric]}
                        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          width={72}
                          tickFormatter={formatCompactNumber}
                        />
                        <Tooltip content={(p) => <TrendTooltip {...p} hiddenSeries={hiddenSeries} />} />
                        <Legend
                          onClick={(entry) => toggleSeries(entry.dataKey)}
                          wrapperStyle={{ fontSize: 11, lineHeight: "1.6", cursor: "pointer" }}
                          formatter={(value) => (
                            <span
                              style={{
                                opacity: hiddenSeries.has(value) ? 0.4 : 1,
                                textDecoration: hiddenSeries.has(value) ? "line-through" : "none",
                              }}
                            >
                              {value}
                            </span>
                          )}
                        />
                        {trendOrgNames.map((name, i) => (
                          <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stroke={TREND_LINE_COLORS[i % TREND_LINE_COLORS.length]}
                            strokeWidth={2}
                            strokeOpacity={hiddenSeries.has(name) ? 0 : 1}
                            dot={hiddenSeries.has(name) ? false : { r: 3 }}
                            activeDot={hiddenSeries.has(name) ? false : { r: 5 }}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="lg:w-64 shrink-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Показатель
                  </p>
                  <div className="space-y-2">
                    {TREND_METRIC_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2.5 text-sm text-gray-900 dark:text-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMetric === opt.value}
                          onChange={() => setSelectedMetric(opt.value)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                    Клик по организации в легенде скрывает/показывает её линию.
                  </p>
                </div>
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
