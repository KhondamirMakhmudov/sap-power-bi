"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import CustomSelect from "@/components/ui/CustomSelect";
import Loader from "@/components/ui/Loader";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

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

function formatSum(value) {
  if (value === null || value === undefined) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)} трлн сум`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(0)} млрд сум`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(0)} млн сум`;
  return `${sign}${new Intl.NumberFormat("ru").format(abs)}`;
}

function buildKpiCards(d) {
  if (!d) return null;

  const pf = (v) => {
    if (v === null || v === undefined) return null;
    return `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}% к плану`;
  };
  const statusColor = (v) => (v >= 0 ? "positive" : "negative");
  const borderByStatus = (status) => {
    if (status === "positive") return "border-l-4 border-l-green-500";
    if (status === "negative") return "border-l-4 border-l-red-500";
    return "border-l-4 border-l-orange-500";
  };
  const statusByText = (text) => (text === "в норме" ? "positive" : "warning");

  const virStatus = statusColor(d.PF_Viruchka);
  const ebitStatus = statusColor(d.PF_EBITDA);
  const wcStatus = statusByText(d.Status_WorkingCapital);
  const fcfStatus = statusByText(d.Status_FCF);

  return [
    {
      label: "Выручка",
      value: formatSum(d.Viruchka),
      plan: `План: ${formatSum(d.P_Viruchka)}`,
      change: pf(d.PF_Viruchka),
      status: virStatus,
      borderColor: borderByStatus(virStatus),
    },
    {
      label: "EBITDA",
      value: formatSum(d.EBITDA),
      plan: `План: ${formatSum(d.P_EBITDA)}`,
      change: pf(d.PF_EBITDA),
      status: ebitStatus,
      borderColor: borderByStatus(ebitStatus),
    },
    {
      label: "Working Capital",
      value: formatSum(d.WorkingCapital),
      plan: `План: ${formatSum(d.Plan_WorkingCapital)}`,
      change: d.Status_WorkingCapital ?? "—",
      status: wcStatus,
      borderColor: borderByStatus(wcStatus),
    },
    {
      label: "FCF",
      value: formatSum(d.FCF),
      plan: `План: ${formatSum(d.Plan_FCF)}`,
      change: d.Status_FCF ?? "—",
      status: fcfStatus,
      borderColor: borderByStatus(fcfStatus),
    },
  ];
}

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

function statusToColor(text) {
  if (!text) return "text-gray-500 dark:text-gray-400";
  const t = text.toLowerCase();
  if (t.includes("норме") || t.includes("коридоре")) return "text-green-600 dark:text-green-400";
  if (t.includes("диапазоне")) return "text-orange-600 dark:text-orange-400";
  if (t.includes("контроль")) return "text-red-600 dark:text-red-400";
  return "text-red-600 dark:text-red-400";
}

function statusToBorder(text) {
  if (!text) return "border-l-4 border-l-gray-300";
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

  return [
    {
      label: "Кредитный рейтинг",
      value: "BB-",
      target: "Цели: суверенный уровень РУ",
      status: "в норме",
      statusColor: "text-green-600 dark:text-green-400",
      borderColor: "border-l-4 border-l-green-500",
    },
    {
      label: "Net Debt / EBITDA",
      value:
        d?.NetDebtEbitda != null
          ? `${Number(d.NetDebtEbitda).toFixed(2)}x`
          : "—",
      target: "Пороги: 3.5x-4.0x",
      status: ndStatus ?? "—",
      statusColor: statusToColor(ndStatus),
      borderColor: statusToBorder(ndStatus),
    },
    {
      label: "DSCR",
      value: d?.DSCR != null ? `${Number(d.DSCR).toFixed(2)}x` : "—",
      target: "Пороги: > 1.1x-1.2x",
      status: dscrStatus ?? "—",
      statusColor: statusToColor(dscrStatus),
      borderColor: statusToBorder(dscrStatus),
    },
    {
      label: "EBITDA Margin",
      value: d?.EBITDAMargin != null ? `${Number(d.EBITDAMargin)}%` : "—",
      target: `Цели: ${d?.Plan_EBITDAMargin != null ? `${Number(d.Plan_EBITDAMargin).toFixed(1)}%` : "20%-25%"}`,
      status: d?.Status_EBITDAMargin ?? "—",
      statusColor: statusToColor(d?.Status_EBITDAMargin),
      borderColor: statusToBorder(d?.Status_EBITDAMargin),
    },
  ];
}

export default function FinancesPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthValue = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const yearOptions = [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ];
  const [filters, setFilters] = useState({
    year: String(currentYear),
    month: currentMonthValue,
  });
  const [financesApiLoading, setFinancesApiLoading] = useState(false);
  const [financesApiError, setFinancesApiError] = useState(null);
  const [financesData, setFinancesData] = useState(null);

  const monthOptions = monthNames.map((label, index) => ({
    value: `${filters.year}-${String(index + 1).padStart(2, "0")}`,
    label,
  }));

  const getDateRangeFromMonth = (monthValue) => {
    const [yearText, monthText] = String(monthValue || "").split("-");
    const year = Number(yearText);
    const month = Number(monthText);

    if (!year || !month || month < 1 || month > 12) {
      return { dateFrom: "2025-01-01", dateTo: "2025-03-31" };
    }

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDayDate = new Date(year, month, 0);
    const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDayDate.getDate()).padStart(2, "0")}`;

    return { dateFrom: firstDay, dateTo: lastDay };
  };

  const postFinancesData = async (selectedMonth = filters.month) => {
    if (!selectedMonth) {
      setFinancesApiError("Выберите месяц");
      return;
    }

    setFinancesApiLoading(true);
    setFinancesApiError(null);

    const { dateFrom, dateTo } = getDateRangeFromMonth(selectedMonth);
    try {
      const res = await fetch("/api/dashboard/post_fi2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
      });

      if (!res.ok) throw new Error(`post_fi2 failed with status ${res.status}`);

      const data = await res.json();
      setFinancesData(data);
    } catch (error) {
      setFinancesApiError(error?.message || "Failed to fetch finances data");
      console.error("Finances POST error:", error);
    } finally {
      setFinancesApiLoading(false);
    }
  };

  useEffect(() => {
    postFinancesData(currentMonthValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetFilters = () => {
    setFilters({
      year: String(currentYear),
      month: currentMonthValue,
    });
    setFinancesApiError(null);
    setFinancesData(null);
  };

  console.log(financesData, "data");

  const kpiCards = buildKpiCards(financesData);
  const ratioCards = buildRatioCards(financesData);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Финансы</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">КПЭ и EBITDA</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSelect
              label="Год"
              options={yearOptions}
              value={filters.year}
              placeholder="Выберите"
              onChange={(value) =>
                setFilters({ ...filters, year: value, month: "" })
              }
            />
            <CustomSelect
              label="Месяц"
              options={monthOptions}
              value={filters.month}
              placeholder="Выберите"
              onChange={(value) => setFilters({ ...filters, month: value })}
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
            <p className="text-xs text-red-600 dark:text-red-400 mt-3">{financesApiError}</p>
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
              Выберите месяц в фильтре выше, чтобы загрузить данные
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            {kpiCards && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, index) => (
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{card.plan}</p>
                    <p
                      className={`text-sm font-semibold mt-2 ${
                        card.status === "positive"
                          ? "text-green-600 dark:text-green-400"
                          : card.status === "negative"
                            ? "text-red-600 dark:text-red-400"
                            : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {card.change}
                    </p>
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

            {/* Financial Ratios Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ratioCards.map((card, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${card.borderColor}`}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-3">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{card.target}</p>
                  <p
                    className={`text-sm font-semibold mt-3 ${card.statusColor}`}
                  >
                    {card.status}
                  </p>
                </div>
              ))}
            </div>

            {/* Strategic Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Financial Stability */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500">
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
                        {financesData?.NetDebtEbitda != null
                          ? `${Number(financesData.NetDebtEbitda).toFixed(2)}x`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели: 3.5x-4.0x
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${statusToColor(financesData?.Status_NetDebtEbitda)}`}
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
                        {financesData?.DSCR != null
                          ? `${Number(financesData.DSCR).toFixed(2)}x`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Цели: строго {`>`} 1.1x-1.2x
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${statusToColor(financesData?.Status_DSCR)}`}
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
              </div>

              {/* 2. Liquidity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-orange-500">
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
              </div>

              {/* 3. Operational Efficiency */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 border-l-green-500">
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
                        {financesData?.EBITDAMargin != null
                          ? `${Number(financesData.EBITDAMargin).toFixed(1)}%`
                          : "—"}
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
              </div>

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
