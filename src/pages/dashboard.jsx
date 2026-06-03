"use client";

import React, { useState } from "react";
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

export default function DashboardPage({ username }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ];
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

  const [filters, setFilters] = useState({
    year: String(currentYear),
    month: "",
    scenario: "",
    control: "",
  });

  const monthOptions = monthNames.map((label, index) => ({
    value: `${filters.year}-${String(index + 1).padStart(2, "0")}`,
    label,
  }));
  const [dashboardApiResponse, setDashboardApiResponse] = useState(null);
  const [dashboardApiLoading, setDashboardApiLoading] = useState(false);
  const [dashboardApiError, setDashboardApiError] = useState(null);

  const postDashboardData = async (selectedMonth = filters.month) => {
    if (!selectedMonth) {
      setDashboardApiError("Выберите месяц");
      return;
    }

    setDashboardApiLoading(true);
    setDashboardApiError(null);
    const { dateFrom, dateTo } = getDateRangeFromMonth(selectedMonth);

    try {
      const response = await fetch("/api/dashboard/post_fi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date_from: dateFrom,
          date_to: dateTo,
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

  const handleResetFilters = () => {
    setFilters({
      year: String(currentYear),
      month: "",
      scenario: "",
      control: "",
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
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={postDashboardData}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                disabled={dashboardApiLoading}
              >
                {dashboardApiLoading ? "Загрузка данных..." : "Выбрать"}
              </button>
              {dashboardApiError && (
                <p className="text-xs text-red-600">{dashboardApiError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
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

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
              onChange={(value) => {
                setFilters({ ...filters, month: value });
                postDashboardData(value);
              }}
            />
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
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>

        {dashboardApiLoading ? (
          <Loader
            label="Загрузка данных за выбранный месяц..."
            className="min-h-105"
          />
        ) : !dashboardApiResponse ? (
          <div className="flex flex-col items-center justify-center min-h-80 py-12 px-8 text-center">
            <i
              className="ti ti-calendar-off text-4xl text-gray-300 mb-4"
              aria-hidden="true"
            />
            <p className="text-lg font-medium text-gray-700 mb-1.5">
              Нет данных
            </p>
            <p className="text-sm text-gray-400 max-w-65 leading-relaxed">
              Выберите месяц в фильтре выше, чтобы загрузить данные
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
                label={"Выработка"}
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
                label={"УРУГ"}
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
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Станции в зоне внимания
              </h2>
              <p className="text-sm text-gray-600 mb-6">
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
