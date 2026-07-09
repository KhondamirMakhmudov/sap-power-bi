"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import Loader from "@/components/ui/Loader";
import { EntityFilter, EntityTable } from "@/components/logistics";
import { ENTITIES, ENTITY_KEYS, buildODataFilter } from "@/components/logistics/config";

const INITIAL_TAB_STATE = { filter: {}, top: "50", data: null, loading: false, error: null };

function defaultDateRange() {
  return { from: "2025-01-01", to: "2025-12-31" };
}

const initState = () =>
  Object.fromEntries(
    ENTITY_KEYS.map((k) => [
      k,
      {
        ...INITIAL_TAB_STATE,
        filter: ENTITIES[k].filter?.type === "dateRange" ? defaultDateRange() : {},
      },
    ]),
  );

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState("pr");
  const [tabs, setTabs] = useState(initState);

  const updateTab = (entity, patch) => {
    setTabs((prev) => ({ ...prev, [entity]: { ...prev[entity], ...patch } }));
  };

  const handleApply = async (entity) => {
    const { filter, top } = tabs[entity];
    const $filter = buildODataFilter(entity, filter);
    const query = { $top: top };
    if ($filter) query.$filter = $filter;

    updateTab(entity, { loading: true, error: null });

    try {
      const res = await fetch("/api/dashboard/logistics_bp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, query }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
      }
      updateTab(entity, { data: await res.json(), loading: false });
    } catch (e) {
      updateTab(entity, { error: e?.message || "Ошибка загрузки", loading: false });
    }
  };

  const handleReset = (entity) => {
    updateTab(entity, {
      ...INITIAL_TAB_STATE,
      filter: ENTITIES[entity].filter?.type === "dateRange" ? defaultDateRange() : {},
    });
  };

  useEffect(() => {
    queueMicrotask(() => handleApply("pr"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = tabs[activeTab];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Логистика</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            MM Dashboard — Закупки, Контракты, Заказы, Поступления, Счета
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit flex-wrap">
          {ENTITY_KEYS.map((key) => {
            const hasData = !!tabs[key].data;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {ENTITIES[key].label}
                {hasData && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-green-500 align-middle" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <EntityFilter
          entityKey={activeTab}
          filter={current.filter}
          setFilter={(f) => updateTab(activeTab, { filter: f })}
          top={current.top}
          setTop={(v) => updateTab(activeTab, { top: v })}
          loading={current.loading}
          hasData={!!current.data}
          error={current.error}
          onApply={() => handleApply(activeTab)}
          onReset={() => handleReset(activeTab)}
        />

        {current.loading && (
          <Loader
            label="Загрузка данных..."
            hint={`Получаем записи: ${ENTITIES[activeTab].labelFull}`}
          />
        )}

        {current.data && !current.loading && (
          <EntityTable entityKey={activeTab} data={current.data} />
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
