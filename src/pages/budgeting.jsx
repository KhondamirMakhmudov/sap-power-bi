"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import Loader from "@/components/ui/Loader";
import {
  FilterCard,
  BreakdownChart,
  BusPlanTable,
  FinKpiSection,
} from "@/components/budgeting";
import {
  COSTS_BREAKDOWN_KEYS,
  REVENUE_BREAKDOWN_KEYS,
  BUSPLAN_KEYS,
  FINKPI_KEYS,
  sumByKey,
  sumByKeyVtype,
} from "@/components/budgeting/utils";

export default function BudgetingPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(String(currentYear));
  const [version, setVersion] = useState("EDU");
  const [compInput, setCompInput] = useState("");
  const [monthFrom, setMonthFrom] = useState("01");
  const [monthTo, setMonthTo] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleApply = async () => {
    if (!year || !version) {
      setError("Выберите год и версию плана");
      return;
    }

    const comp = compInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calyear: year,
          version,
          ...(comp.length > 0 ? { comp } : {}),
          month_from: monthFrom,
          month_to: monthTo,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
      }
      setData(await res.json());
    } catch (e) {
      setError(e?.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  useEffect(() => {
    handleApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const costsMap = sumByKey(data?.costs);
  const revenueMap = sumByKey(data?.revenue);
  const busplanMap = sumByKeyVtype(data?.busplan);
  const finkpiMap = sumByKeyVtype(data?.finkpi);

  const costsRows = COSTS_BREAKDOWN_KEYS.map((k) => costsMap.get(k)).filter(Boolean);
  const totalCosts =
    costsMap.get("TOTAL")?.amount ?? costsRows.reduce((s, r) => s + r.amount, 0);

  const revenueRows = REVENUE_BREAKDOWN_KEYS.map((k) => revenueMap.get(k)).filter(Boolean);
  const totalRevenue = revenueRows.reduce((s, r) => s + r.amount, 0);

  const busplanRows = BUSPLAN_KEYS.map((k) => busplanMap.get(k)).filter(Boolean);

  const finkpiRows = FINKPI_KEYS.map((k) => finkpiMap.get(k)).filter(Boolean);
  const bsAssets = finkpiMap.get("BS_ASSETS");
  const bsLiab = finkpiMap.get("BS_LIAB");

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Бюджетирование</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            БДР, БДДС и Баланс — план/факт по данным SAP BPC
          </p>
        </div>

        <FilterCard
          year={year}
          setYear={setYear}
          version={version}
          setVersion={setVersion}
          compInput={compInput}
          setCompInput={setCompInput}
          monthFrom={monthFrom}
          setMonthFrom={setMonthFrom}
          monthTo={monthTo}
          setMonthTo={setMonthTo}
          loading={loading}
          hasData={!!data}
          error={error}
          onApply={handleApply}
          onReset={handleReset}
        />

        {loading && (
          <Loader
            label="Загрузка данных..."
            hint="Получаем данные бюджета из SAP BPC"
          />
        )}

        {data && !loading && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BreakdownChart title="Состав затрат" total={totalCosts} rows={costsRows} />
              <BreakdownChart title="Структура доходов" total={totalRevenue} rows={revenueRows} />
            </div>

            <BusPlanTable rows={busplanRows} />

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                Основные финансовые показатели
              </h2>
              <FinKpiSection kpis={finkpiRows} bsAssets={bsAssets} bsLiab={bsLiab} />
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
