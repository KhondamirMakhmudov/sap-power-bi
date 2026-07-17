"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import CustomSelect from "@/components/ui/CustomSelect";
import MultiSelect from "@/components/ui/MultiSelect";
import Loader from "@/components/ui/Loader";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import BreakdownPieChart from "@/components/finances/BreakdownPieChart";
import { BusPlanTable } from "@/components/budgeting";
import {
  sumByKey,
  COSTS_BREAKDOWN_KEYS,
  REVENUE_BREAKDOWN_KEYS,
  buildBusplanRows,
} from "@/components/budgeting/utils";
import { ORG_OPTIONS, ALL_ORG_CODES, resolveCompCodes } from "@/data/organizations";

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const PERIOD_TYPES = [
  { value: "month", label: "Месяц" },
  { value: "quarter", label: "Квартал" },
  { value: "half", label: "Полугодие" },
  { value: "year", label: "Год" },
  { value: "custom", label: "Произвольно" },
];

const MONTH_OPTIONS = monthNames.map((label, i) => ({
  value: String(i + 1),
  label,
}));
const QUARTER_OPTIONS = [1, 2, 3, 4].map((q) => ({
  value: String(q),
  label: `${q} квартал`,
}));
const HALF_OPTIONS = [
  { value: "1", label: "I полугодие (янв–июн)" },
  { value: "2", label: "II полугодие (июл–дек)" },
];

const PERIOD_INDEX_LABELS = {
  month: "Месяц",
  quarter: "Квартал",
  half: "Полугодие",
};
const PERIOD_INDEX_OPTIONS = {
  month: MONTH_OPTIONS,
  quarter: QUARTER_OPTIONS,
  half: HALF_OPTIONS,
};

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
  let startMonth = 0,
    span = 12;
  if (type === "month") {
    startMonth = i - 1;
    span = 1;
  }
  if (type === "quarter") {
    startMonth = (i - 1) * 3;
    span = 3;
  }
  if (type === "half") {
    startMonth = (i - 1) * 6;
    span = 6;
  }
  const from = new Date(y, startMonth, 1);
  const to = new Date(y, startMonth + span, 0);
  return [toDateStr(from), toDateStr(to)];
}

function defaultIndexFor(type, month) {
  if (type === "quarter") return String(Math.ceil(month / 3));
  if (type === "half") return String(month <= 6 ? 1 : 2);
  return String(month);
}

function formatSum(value) {
  if (value === null || value === undefined) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(3)} трлн сум`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(3)} млрд сум`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(3)} млн сум`;
  return `${sign}${new Intl.NumberFormat("ru").format(abs)}`;
}

function buildKpiCards(d) {
  if (!d) return null;

  const pf = (v) => {
    if (v === null || v === undefined) return null;
    return `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}% к плану`;
  };
  const statusColor = (v) => (v >= 0 ? "positive" : "negative");
  const toneFromStatus = (status) => {
    if (status === "positive") return "green";
    if (status === "negative") return "red";
    return "orange";
  };
  const statusByText = (text) => (text === "в норме" ? "positive" : "warning");

  const virStatus = statusColor(d.PF_Viruchka);
  const ebitStatus = statusColor(d.PF_EBIT);
  const ebitdaStatus = statusColor(d.PF_EBITDA);
  const netProfitStatus = statusColor(d.PF_ChistayaPribil);
  const wcStatus = statusByText(d.Status_WorkingCapital);
  const fcfStatus = statusByText(d.Status_FCF);

  return [
    {
      label: "Выручка",
      value: formatSum(d.Viruchka),
      target: `План: ${formatSum(d.P_Viruchka)}`,
      status: pf(d.PF_Viruchka) ?? "—",
      statusColor: TONE_TEXT_CLASS[toneFromStatus(virStatus)],
      borderColor: TONE_BORDER_CLASS[toneFromStatus(virStatus)],
      description: "Доход от основной деятельности.",
    },
    {
      label: "EBIT",
      value: formatSum(d.EBIT),
      target: `План: ${formatSum(d.P_EBIT)}`,
      status: pf(d.PF_EBIT) ?? "—",
      statusColor: TONE_TEXT_CLASS[toneFromStatus(ebitStatus)],
      borderColor: TONE_BORDER_CLASS[toneFromStatus(ebitStatus)],
      description: "Прибыль до процентов и налогов.",
    },
    {
      label: "EBITDA",
      value: formatSum(d.EBITDA),
      target: `План: ${formatSum(d.P_EBITDA)}`,
      status: pf(d.PF_EBITDA) ?? "—",
      statusColor: TONE_TEXT_CLASS[toneFromStatus(ebitdaStatus)],
      borderColor: TONE_BORDER_CLASS[toneFromStatus(ebitdaStatus)],
      description: "Прибыль до процентов, налогов и амортизации.",
    },
    {
      label: "Чистая прибыль",
      value: formatSum(d.ChistayaPribil),
      target: `План: ${formatSum(d.P_ChistayaPribil)}`,
      status: pf(d.PF_ChistayaPribil) ?? "—",
      statusColor: TONE_TEXT_CLASS[toneFromStatus(netProfitStatus)],
      borderColor: TONE_BORDER_CLASS[toneFromStatus(netProfitStatus)],
      description: "Финансовый результат после всех расходов.",
    },
    {
      label: "Working Capital",
      value: formatSum(d.WorkingCapital),
      target: `План: ${formatSum(d.Plan_WorkingCapital)}`,
      status: d.Status_WorkingCapital ?? "—",
      statusColor: TONE_TEXT_CLASS[toneFromStatus(wcStatus)],
      borderColor: TONE_BORDER_CLASS[toneFromStatus(wcStatus)],
      description: "Оборотный капитал компании.",
    },
    {
      label: "FCF",
      value: formatSum(d.FCF),
      target: `План: ${formatSum(d.Plan_FCF)}`,
      status: d.Status_FCF ?? "—",
      statusColor: TONE_TEXT_CLASS[toneFromStatus(fcfStatus)],
      borderColor: TONE_BORDER_CLASS[toneFromStatus(fcfStatus)],
      description: "Свободный денежный поток.",
    },
  ];
}

// const ebitdaFactors = [
//   {
//     factor: "Недозаработка",
//     impact: "-9 млрд сум",
//     reason: "Незначительное отклонение по отдельным активам",
//     responsible: "Производственный блок",
//   },
//   {
//     factor: "Рост УРУТ",
//     impact: "-21 млрд сум",
//     reason: "Снижение эффективности старых блоков",
//     responsible: "Главный инженер",
//   },
//   {
//     factor: "Цена топлива",
//     impact: "-12 млрд сум",
//     reason: "Фактическая цена выше бюджетной",
//     responsible: "Финансовый блок",
//   },
//   {
//     factor: "Собственные нужды",
//     impact: "-4 млрд сум",
//     reason: "Превышение целевого уровня на 0.1 п.п.",
//     responsible: "Технический директор",
//   },
//   {
//     factor: "Компенсирующие факторы",
//     impact: "+37 млрд сум",
//     reason: "Рост выручки, экономия прочих ОРЕХ, курсовой и прочий эффект",
//     responsible: "Финансовый блок",
//   },
// ];

// `value != null` treats NaN as present (NaN != null is true), so a 0/0 upstream
// calculation renders as "NaNx" instead of a no-data state — guard with isFinite.
function formatRatio(value, suffix = "x", digits = 2) {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return "н/д";
  return `${n.toFixed(digits)}${suffix}`;
}

const TONE_TEXT_CLASS = {
  green: "text-green-600 dark:text-green-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
  gray: "text-gray-500 dark:text-gray-400",
};

const TONE_BORDER_CLASS = {
  green: "border-l-4 border-l-green-500",
  orange: "border-l-4 border-l-orange-500",
  red: "border-l-4 border-l-red-500",
  gray: "border-l-4 border-l-gray-300",
};

const NET_DEBT_EBITDA_STATUS_TONE = {
  "очень низкая долговая нагрузка": "green",
  "долговая нагрузка низкая, комфортная": "green",
  "умеренная долговая нагрузка, обычно приемлемая": "orange",
  "повышенная долговая нагрузка, требует внимания": "orange",
  "высокая долговая нагрузка, повышенный риск": "red",
  "очень высокая, возможны проблемы с обслуживанием долга": "red",
  "рассчитать не удалось": "gray",
};

const DSCR_STATUS_TONE = {
  "критично — денежных средств недостаточно для обслуживания долга": "red",
  "критично - денежных средств недостаточно для обслуживания долга": "red",
  "очень слабое покрытие, высокий риск": "red",
  "приемлемо, но запас прочности небольшой": "orange",
  "хороший уровень": "green",
  "отлично (низкий кредитный риск)": "green",
  "рассчитать не удалось": "gray",
};

function statusToColor(text, toneMap) {
  if (!text) return "text-gray-500 dark:text-gray-400";
  if (toneMap) {
    const tone = toneMap[text.trim().toLowerCase()];
    if (tone) return TONE_TEXT_CLASS[tone];
  }
  const t = text.toLowerCase();
  if (t.includes("норме") || t.includes("коридоре"))
    return "text-green-600 dark:text-green-400";
  if (t.includes("диапазоне")) return "text-orange-600 dark:text-orange-400";
  if (t.includes("контроль")) return "text-red-600 dark:text-red-400";
  return "text-red-600 dark:text-red-400";
}

function statusToBorder(text, toneMap) {
  if (!text) return "border-l-4 border-l-gray-300";
  if (toneMap) {
    const tone = toneMap[text.trim().toLowerCase()];
    if (tone) return TONE_BORDER_CLASS[tone];
  }
  const t = text.toLowerCase();
  if (t.includes("норме") || t.includes("коридоре"))
    return "border-l-4 border-l-green-500";
  if (t.includes("диапазоне")) return "border-l-4 border-l-orange-500";
  if (t.includes("контроль")) return "border-l-4 border-l-red-500";
  return "border-l-4 border-l-red-500";
}

function buildRatioCards(d) {
  const ndStatus = d?.Status_NetDebtEbitda ?? null;
  const dscrStatus = d?.Status_DSCR ?? null;
  const ebitMarginStatus = d?.Status_RentabelnostEBIT ?? null;
  const roiStatus = d?.PF_ROI ?? null;
  const roaStatus = d?.PF_ROA ?? null;

  const pf = (v) => {
    if (v === null || v === undefined) return null;
    return `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}% к плану`;
  };
  // Cost metrics: actual below plan (negative deviation) is GOOD → green;
  // above plan (positive deviation) is BAD → red — reversed vs revenue metrics
  // (per backend dev: "Минус - зелёный. Плюс - красный").
  const costTone = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "gray";
    return n <= 0 ? "green" : "red";
  };
  const costElectroTone = costTone(d?.PF_SebestoimostElektr);
  const costHeatTone = costTone(d?.PF_SebestoimostTeplo);

  const collectionRate = d?.CollectionRate;
  const collectionTone =
    collectionRate != null && Number(collectionRate) >= 98 ? "green" : "orange";

  return [
    {
      label: "Кредитный рейтинг",
      value: "BB",
      target: "Цели: суверенный уровень РУ",
      status: "в норме",
      statusColor: "text-green-600 dark:text-green-400",
      borderColor: "border-l-4 border-l-green-500",
      description: "Оценка кредитоспособности компании.",
    },
    {
      label: "Net Debt / EBITDA",
      value: formatRatio(d?.NetDebtEbitda),
      target: "Пороги: 3.5x-4.0x",
      status: ndStatus ?? "—",
      statusColor: statusToColor(ndStatus, NET_DEBT_EBITDA_STATUS_TONE),
      borderColor: statusToBorder(ndStatus, NET_DEBT_EBITDA_STATUS_TONE),
      description: "Долговая нагрузка к EBITDA.",
    },
    {
      label: "DSCR",
      value: formatRatio(d?.DSCR),
      target: "Пороги: > 1.1x-1.2x",
      status: dscrStatus ?? "—",
      statusColor: statusToColor(dscrStatus, DSCR_STATUS_TONE),
      borderColor: statusToBorder(dscrStatus, DSCR_STATUS_TONE),
      description: "Способность обслуживать долг.",
    },
    {
      label: "Рентабельность EBIT",
      value: formatRatio(d?.RentabelnostEBIT, "%", 1),
      target: `План: ${formatRatio(d?.Plan_RentabelnostEBIT, "%", 1)}`,
      status: ebitMarginStatus ?? "—",
      statusColor: statusToColor(ebitMarginStatus),
      borderColor: statusToBorder(ebitMarginStatus),
      description: "Доля EBIT в выручке.",
    },
    {
      label: "Рентабельность EBITDA",
      value: formatRatio(d?.EBITDAMargin, "%", 1),
      target: `Цели: ${d?.Plan_EBITDAMargin != null ? `${Number(d.Plan_EBITDAMargin).toFixed(1)}%` : "20%-25%"}`,
      status: d?.Status_EBITDAMargin ?? "—",
      statusColor: statusToColor(d?.Status_EBITDAMargin),
      borderColor: statusToBorder(d?.Status_EBITDAMargin),
      description: "Доля EBITDA в выручке.",
    },
    {
      label: "Collection Rate",
      value:
        collectionRate != null ? `${Number(collectionRate).toFixed(2)}%` : "—",
      target: "Цели: ≥ 98-99%",
      status:
        collectionRate != null
          ? collectionTone === "green"
            ? "в норме"
            : "ниже цели"
          : "—",
      statusColor:
        TONE_TEXT_CLASS[collectionRate != null ? collectionTone : "gray"],
      borderColor:
        TONE_BORDER_CLASS[collectionRate != null ? collectionTone : "gray"],
      description: "Уровень сбора дебиторской задолженности.",
    },
    {
      label: "Себестоимость электроэнергии",
      value: formatSum(d?.SebestoimostElektr),
      target: `План: ${formatSum(d?.P_SebestoimostElektr)}`,
      status: pf(d?.PF_SebestoimostElektr) ?? "—",
      statusColor: TONE_TEXT_CLASS[costElectroTone],
      borderColor: TONE_BORDER_CLASS[costElectroTone],
      description: "Затраты на производство электроэнергии.",
    },
    {
      label: "Себестоимость теплоэнергии",
      value: formatSum(d?.SebestoimostTeplo),
      target: `План: ${formatSum(d?.P_SebestoimostTeplo)}`,
      status: pf(d?.PF_SebestoimostTeplo) ?? "—",
      statusColor: TONE_TEXT_CLASS[costHeatTone],
      borderColor: TONE_BORDER_CLASS[costHeatTone],
      description: "Затраты на производство теплоэнергии.",
    },
    {
      label: "ROI",
      value: formatRatio(d?.ROI, "%", 1),
      target: `План: ${formatRatio(d?.P_ROI, "%", 1)}`,
      status: roiStatus ?? "—",
      statusColor: statusToColor(roiStatus),
      borderColor: statusToBorder(roiStatus),
      description: "Доходность инвестиций.",
    },
    {
      label: "ROA",
      value: formatRatio(d?.ROA, "%", 1),
      target: `План: ${formatRatio(d?.P_ROA, "%", 1)}`,
      status: roaStatus ?? "—",
      statusColor: statusToColor(roaStatus),
      borderColor: statusToBorder(roaStatus),
      description: "Эффективность использования активов.",
    },
  ];
}

export default function FinancesPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearOptions = [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
  ];

  // Default view is last month, not the current (still in-progress) one.
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultYear = prevMonthDate.getFullYear();
  const defaultMonth = prevMonthDate.getMonth() + 1;

  const [filters, setFilters] = useState(() => {
    const periodIndex = defaultIndexFor("month", defaultMonth);
    const [dateFrom, dateTo] = periodRange("month", defaultYear, periodIndex);
    return {
      periodType: "month",
      periodYear: String(defaultYear),
      periodIndex,
      dateFrom,
      dateTo,
      comp: ALL_ORG_CODES,
    };
  });
  const [financesApiLoading, setFinancesApiLoading] = useState(false);
  const [financesApiError, setFinancesApiError] = useState(null);
  const [financesData, setFinancesData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  function selectPeriodType(type) {
    if (type === "custom") {
      setFilters((f) => ({ ...f, periodType: type }));
      return;
    }
    const periodIndex = defaultIndexFor(type, currentMonth);
    const [dateFrom, dateTo] = periodRange(
      type,
      filters.periodYear,
      periodIndex,
    );
    setFilters((f) => ({
      ...f,
      periodType: type,
      periodIndex,
      dateFrom,
      dateTo,
    }));
  }

  function selectPeriodYear(year) {
    const [dateFrom, dateTo] = periodRange(
      filters.periodType,
      year,
      filters.periodIndex,
    );
    setFilters((f) => ({ ...f, periodYear: year, dateFrom, dateTo }));
  }

  function selectPeriodIndex(index) {
    const [dateFrom, dateTo] = periodRange(
      filters.periodType,
      filters.periodYear,
      index,
    );
    setFilters((f) => ({ ...f, periodIndex: index, dateFrom, dateTo }));
  }

  const postFinancesData = async () => {
    const { dateFrom, dateTo } = filters;
    if (!dateFrom || !dateTo) {
      setFinancesApiError("Выберите период");
      return;
    }

    setFinancesApiLoading(true);
    setFinancesApiError(null);

    const calyear = dateFrom.split("-")[0];
    const monthFrom = dateFrom.split("-")[1];
    const monthTo = dateTo.split("-")[1];
    const compCodes = resolveCompCodes(filters.comp);
    try {
      const [res, budgetRes] = await Promise.all([
        fetch("/api/dashboard/post_fi2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date_from: dateFrom,
            date_to: dateTo,
            ...(compCodes ? { be: compCodes } : {}),
          }),
        }),
        fetch("/api/dashboard/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calyear,
            version: "EDU",
            month_from: monthFrom,
            month_to: monthTo,
            ...(compCodes ? { comp: compCodes } : {}),
          }),
        }),
      ]);

      if (!res.ok) throw new Error(`post_fi2 failed with status ${res.status}`);

      const data = await res.json();
      setFinancesData(data);
      setBudgetData(budgetRes.ok ? await budgetRes.json() : null);
    } catch (error) {
      setFinancesApiError(error?.message || "Failed to fetch finances data");
      console.error("Finances POST error:", error);
    } finally {
      setFinancesApiLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => postFinancesData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetFilters = () => {
    const periodIndex = defaultIndexFor("month", defaultMonth);
    const [dateFrom, dateTo] = periodRange("month", defaultYear, periodIndex);
    setFilters({
      periodType: "month",
      periodYear: String(defaultYear),
      periodIndex,
      dateFrom,
      dateTo,
      comp: ALL_ORG_CODES,
    });
    setFinancesApiError(null);
    setFinancesData(null);
    setBudgetData(null);
  };

  console.log(financesData, "data");

  const costsMap = sumByKey(budgetData?.costs);
  const revenueMap = sumByKey(budgetData?.revenue);
  const costsRows = COSTS_BREAKDOWN_KEYS.map((k) => costsMap.get(k)).filter(
    Boolean,
  );
  const totalCosts =
    costsMap.get("TOTAL")?.amount ??
    costsRows.reduce((s, r) => s + r.amount, 0);
  const revenueRows = REVENUE_BREAKDOWN_KEYS.map((k) =>
    revenueMap.get(k),
  ).filter(Boolean);
  const totalRevenue = revenueRows.reduce((s, r) => s + r.amount, 0);

  const busplanRows = buildBusplanRows(financesData);

  const kpiCards = buildKpiCards(financesData);
  const ratioCards = buildRatioCards(financesData);
  const allCards = kpiCards ? [...kpiCards, ...ratioCards] : null;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Финансы
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">КПЭ и EBITDA</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
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
                onClick={() => postFinancesData()}
                disabled={financesApiLoading}
                className="flex-1 px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
              >
                {financesApiLoading ? "Загрузка..." : "Применить"}
              </button>
              {financesData && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors text-sm"
                >
                  Сбросить
                </button>
              )}
            </div>
          </div>
          {financesApiError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {financesApiError}
            </p>
          )}
        </div>

        {financesApiLoading ? (
          <Loader
            label="Загрузка финансовых данных..."
            hint="Получаем КПЭ и данные EBITDA за выбранный период"
          />
        ) : !financesData ? (
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
          <div className="space-y-8">
            {/* KPI & Ratio Cards */}
            {allCards && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {allCards.map((card, index) => (
                  <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${card.borderColor}`}
                  >
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      {card.target}
                    </p>
                    <p
                      className={`text-sm font-semibold mt-2 ${card.statusColor}`}
                    >
                      {card.status}
                    </p>
                    {card.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                        {card.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* EBITDA Impact Section */}
            {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            Влияние на EBITDA
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Демонстрация финансового отклонения за месяц
          </p>


          <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-500 p-6 mb-6 rounded">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-1 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Суммарное отклонение EBITDA: факт против плана
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  План: EBITDA 665 млрд сум - факт: EBITDA 676 млрд сум - ниже
                  показана декомпозиция отклонение по факторам
                </p>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                -9 млрд сум
              </p>
            </div>
          </div>

    
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ФАКТОР
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ВЛИЯНИЕ
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ПРИЧИНА
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ОТВЕТСТВЕННЫЙ
                  </th>
                </tr>
              </thead>
              <tbody>
                {ebitdaFactors.map((factor, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {factor.factor}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {factor.impact}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {factor.reason}
                    </td>
                    <td className="py-4 px-4 text-sm text-blue-600 dark:text-blue-400">
                      {factor.responsible}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Бюджетирование - плановые показатели
              </h1>
            </div>

            {/* Cost / Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BreakdownPieChart
                title="Состав затрат"
                total={totalCosts}
                rows={costsRows}
              />
              <BreakdownPieChart
                title="Структура доходов"
                total={totalRevenue}
                rows={revenueRows}
              />
            </div>

            {/* Business Plan Execution */}
            <BusPlanTable rows={busplanRows} />

            {/* Strategic Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Financial Stability */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      1. Финансовая устойчивость холдинга
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цель — уровень суверенного кредитного рейтинга на
                      суверенном уровне РУ, чтобы сохранить доступ к дешевым
                      зарубежным займам.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                    Комплекс
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Чистый долг / EBITDA
                      </h4>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatRatio(financesData?.NetDebtEbitda)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели: 3.5x-4.0x
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${statusToColor(financesData?.Status_NetDebtEbitda, NET_DEBT_EBITDA_STATUS_TONE)}`}
                    >
                      {financesData?.Status_NetDebtEbitda
                        ? `Статус: ${financesData.Status_NetDebtEbitda}`
                        : "Статус: —"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Рост выше порога блокирует новые транши от Минфина и
                      международных банков.
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        DSCR — коэффициент покрытия обслуживания долга
                      </h4>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatRatio(financesData?.DSCR)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели: строго {`>`} 1.1x-1.2x
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${statusToColor(financesData?.Status_DSCR, DSCR_STATUS_TONE)}`}
                    >
                      {financesData?.Status_DSCR
                        ? `Статус: ${financesData.Status_DSCR}`
                        : "Статус: —"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Показывает способность компании обслуживать кредиты
                      модернизации ТСС без средств государства.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* 2. Liquidity */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-orange-500">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      2. Ликвидность и платежная дисциплина
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Контроль кассовых разрывов из-за задержек оплат и
                      дисциплины расчетов НСЭ / РЭС.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded">
                    Контроль
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Свободный денежный поток, FCF
                      </h4>
                      <span
                        className={`text-2xl font-bold ${financesData?.FCF != null && financesData.FCF >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {financesData?.FCF != null
                          ? formatSum(financesData.FCF)
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели: положительный FCF
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Горизонт: год / YTD
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Маркер способности финансировать текущие ремонты станций
                      за счет собственных источников.
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Collection Rate
                      </h4>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {financesData?.CollectionRate != null
                          ? `${Number(financesData.CollectionRate).toFixed(2)}%`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Цели: ≥ 98-99%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Контрагенты: НЭУ / РЭС
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Показывает уровень собираемости выручки от ключевых
                      участников энергосистемы.
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        DSO просроченной дебиторской задолженности
                      </h4>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {financesData?.DSO != null
                          ? `${Number(financesData.DSO)} дней`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели: {financesData?.Plan_DSO ?? "—"}
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${statusToColor(financesData?.Status_DSO)}`}
                    >
                      Статус: {financesData?.Status_DSO ?? "—"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Снижение коммерческих потерь и удержание оборачиваемости в
                      рамках нормативов Минэнерго.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* 3. Operational Efficiency */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      3. Операционная эффективность и маржинальность
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Контроль эффективности производства операций и динамики
                      электроэнергии при действующих тарифах.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                    В норме
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Рентабельность по EBITDA
                      </h4>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatRatio(financesData?.EBITDAMargin, "%", 1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели:{" "}
                      {financesData?.Plan_EBITDAMargin != null
                        ? `${Number(financesData.Plan_EBITDAMargin).toFixed(1)}%`
                        : "20-25%"}
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${statusToColor(financesData?.Status_EBITDAMargin)}`}
                    >
                      {financesData?.Status_EBITDAMargin
                        ? `Статус: ${financesData.Status_EBITDAMargin}`
                        : "Статус: —"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Запас прочности до вычета процентов по валидным кредитам.
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Удельный расход условного топлива, УРУТ
                      </h4>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {financesData?.URUT != null
                          ? `${Number(financesData.URUT)} г/кВт∙ч`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      План:{" "}
                      {financesData?.Plan_URUT != null
                        ? `${Number(financesData.Plan_URUT)} г/кВт∙ч`
                        : "—"}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                      {financesData?.PlanFakt_URUT
                        ? `Статус: ${financesData.PlanFakt_URUT}`
                        : "Статус: —"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Сквозной KPI всех станций: финансовый эквивалент — Fuel
                      Cost Variance.
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Fuel Cost Variance
                      </h4>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {financesData?.FuelCostVariance != null
                          ? `${Number(financesData.FuelCostVariance)} млрд сум`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Причина: газ / уголь выше нормы
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Ответственный: производство + финансы
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Отклонение фактических затрат на топливо от утвержденного
                      тарифного уровня.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* 4. Investments & Reforms */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-orange-500">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  4. Инвестиции и государственные реформы
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Контроль цифровизации, внедрения ПГУ, трансформации отчетности
                  и приватизационной готовности активов.
                </p>
              </div>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold rounded">
                Контроль
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    CapEx Execution Rate
                  </h4>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">78%</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Цели: 95-100% годового плана
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                  Статус: отставание
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Недосбережение бюджета означает риск срыва новых мощностей по
                  спрограммам.
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Доля станций на МСФО и международном аудите
                  </h4>
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">72%</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Цели: 100%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                  Критерий: безговорочное заключение
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Доля активов, получивших безоговорочное аудиторское заключение
                  в сроки Кабинета.
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Cost Reduction KPI
                  </h4>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">-6.2%</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Цели: снижение 5-10% ежегодно
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Источник: автоматизация / закупки
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Директивный показатель оптимизации непроизводственных расходов
                  холдинга.
                </p>
              </div>
            </div>
          </div> */}
            </div>
          </div>
        )}
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
