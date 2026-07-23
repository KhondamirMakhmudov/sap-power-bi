"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import Loader from "@/components/ui/Loader";
import {
  // FilterCard, // old SAP tab — commented out for now, see block below to re-enable
  KPISummaryCards,
  TotalsCards,
  CompanyMatrixTable,
} from "@/components/fi-debtor-creditor";
// import { toApiDate } from "@/components/fi-debtor-creditor/utils"; // old SAP tab — re-enable together with FilterCard above

// ---------------------------------------------------------------------------
// Data source history for this page:
//   1. Live SAP proxy (/api/dashboard/fi_bp) — commented out below, see that block.
//   2. Live operdtkt proxy (/api/dashboard/new_fi_bp), single date_to param —
//      commented out below; will be re-enabled next week once SAP grants
//      DASHBOARD access to service group. Do not delete new_fi_bp.js.
//   3. Current: Excel snapshot (/api/dashboard/fi_bp_excel), file updated to
//      "Д-т К-т 22.07.2026.xlsx" (see fi_bp_excel.js).
// ---------------------------------------------------------------------------

export default function FinDebtorCreditorPage() {
  const [activeTab, setActiveTab] = useState("debtor");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* Old SAP live source — state + fetch (commented out)
  const now = new Date();
  const [mode, setMode] = useState("period");
  const [dateInput, setDateInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [sapData, setSapData] = useState(null);
  const [sapLoading, setSapLoading] = useState(false);
  const [sapError, setSapError] = useState(null);

  const handleApply = async () => {
    let body;
    if (mode === "date") {
      if (!dateInput) { setSapError("Выберите дату"); return; }
      body = { date: toApiDate(dateInput), month: "", year: "" };
    } else {
      if (!selectedMonth || !selectedYear) { setSapError("Выберите месяц и год"); return; }
      body = { date: "", month: String(parseInt(selectedMonth, 10)), year: selectedYear };
    }

    setSapLoading(true);
    setSapError(null);

    try {
      const res = await fetch("/api/dashboard/fi_bp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
      }
      setSapData(await res.json());
      setActiveTab("debtor");
    } catch (e) {
      setSapError(e?.message || "Ошибка загрузки данных");
    } finally {
      setSapLoading(false);
    }
  };

  const handleReset = () => {
    setSapData(null);
    setSapError(null);
  };
  */

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      fetch("/api/dashboard/fi_bp_excel")
        .then(async (res) => {
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
          }
          return res.json();
        })
        .then((json) => {
          if (!cancelled) setData(json);
        })
        .catch((e) => {
          if (!cancelled) setError(e?.message || "Ошибка загрузки файла");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Live operdtkt source — state + fetch (commented out, re-enable next week)
  function todayIso() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  const [dateTo, setDateTo] = useState(todayIso());

  const fetchLiveData = (targetDateTo) => {
    setLoading(true);
    setError(null);
    fetch("/api/dashboard/new_fi_bp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date_to: targetDateTo }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setActiveTab("debtor");
      })
      .catch((e) => {
        setError(e?.message || "Ошибка загрузки данных");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    queueMicrotask(() => fetchLiveData(dateTo));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  */

  const debtorSection = data?.sections?.debtor;
  const creditorSection = data?.sections?.creditor;
  const activeSection = activeTab === "debtor" ? debtorSection : creditorSection;

  const tabConfig = [
    { key: "debtor", label: "Дебиторы", count: debtorSection?.items?.length ?? 0 },
    { key: "creditor", label: "Кредиторы", count: creditorSection?.items?.length ?? 0 },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Финансы: Дебиторы и Кредиторы
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Задолженность ФИ по контрагентам — значения в млн UZS
          </p>
        </div>

        {/* Old source switcher (SAP / Excel) — commented out, see notes above
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
          {[
            { key: "sap", label: "Живые данные (SAP)" },
            { key: "excel", label: "Excel-снимок 01.07.2026" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSource(key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                source === key
                  ? "bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        */}

        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Справка о дебиторской и кредиторской задолженности предприятий, входящих в состав АО «ИЭС», по состоянию на 22 июля 2026 года
        </p>

        {/* Live date picker (operdtkt source) — commented out, re-enable next week
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Дата
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchLiveData(dateTo)}
              disabled={loading || !dateTo}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500"
            >
              {loading ? "Загрузка..." : "Применить"}
            </button>
          </div>
        </div>
        */}

        {/* Old FilterCard (month/year or date, SAP source) — commented out
        <FilterCard
          mode={mode}
          setMode={setMode}
          dateInput={dateInput}
          setDateInput={setDateInput}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          loading={sapLoading}
          hasData={!!sapData}
          error={sapError}
          onApply={handleApply}
          onReset={handleReset}
        />
        */}

        {loading && (
          <Loader
            label="Загрузка данных..."
            hint="Получаем информацию по дебиторской и кредиторской задолженности"
          />
        )}

        {error && !loading && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {data && (
          <>
            <KPISummaryCards
              debtorSection={debtorSection}
              creditorSection={creditorSection}
            />

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
              {tabConfig.map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    activeTab === key
                      ? "bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      activeTab === key
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {activeSection && (
              <div className="space-y-6">
                <TotalsCards
                  activeSection={activeSection}
                  activeTab={activeTab}
                />
                <CompanyMatrixTable
                  activeSection={activeSection}
                  activeTab={activeTab}
                  preserveOrder
                />
              </div>
            )}
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
  return { props: {} };
}
