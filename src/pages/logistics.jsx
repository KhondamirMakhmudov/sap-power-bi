"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import Loader from "@/components/ui/Loader";
import CustomSelect from "@/components/ui/CustomSelect";
import { JoinedTable, TotalsAnalytics } from "@/components/logistics";
import {
  GENERAL_BLOCK_GROUPS,
  buildGeneralBlockFilter,
  generalBlockRowKey,
} from "@/components/logistics/generalBlockConfig";
// import { buildODataFilter } from "@/components/logistics/config"; // old 5-entity source — commented out below
// import { joinPrContract, joinPoGrInvoice } from "@/components/logistics/joins"; // old 5-entity source — commented out below
import { PLANT_OPTIONS } from "@/data/organizations";

// ---------------------------------------------------------------------------
// Data source history for this page:
//   Old: 5 separate SAP OData entities (PR, Contract, PO, GR, Invoice) fetched
//        via /api/dashboard/logistics_bp and joined client-side (PR<->Contract
//        and PO<->GR<->Invoice only — SAP's PurchaseOrder API had no field
//        back to PR/Contract, so the two halves couldn't be linked). Commented
//        out below; logistics_bp.js itself is untouched if this needs reverting.
//   Current: one consolidated entity (GeneralBlock) via /api/dashboard/general_block,
//        already joined server-side by SAP. DASHBOARD account needs SAP
//        authorization for service group ZSC_GENERAL_BLOCK_O4 on 10.20.6.144 —
//        column names in generalBlockConfig.js are best-effort from one sample
//        row, verify against real data and adjust any mismatched column.
// ---------------------------------------------------------------------------

const FETCH_PAGE_SIZE = 2000;
const FETCH_SAFETY_CAP = 50000;

const PAGE_SIZE_OPTIONS = [
  { value: "25", label: "25 на странице" },
  { value: "50", label: "50 на странице" },
  { value: "100", label: "100 на странице" },
  { value: "200", label: "200 на странице" },
];

function defaultDateRange() {
  return { from: "2025-01-01", to: "2025-12-31" };
}

const DATE_INPUT_CLASS =
  "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 font-medium hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100 dark:hover:border-gray-500";

function DateRangeField({ label, range, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={range.from || ""}
          onChange={(e) => onChange({ ...range, from: e.target.value })}
          className={DATE_INPUT_CLASS}
        />
        <span className="text-gray-400 dark:text-gray-500 text-sm shrink-0">—</span>
        <input
          type="date"
          value={range.to || ""}
          onChange={(e) => onChange({ ...range, to: e.target.value })}
          className={DATE_INPUT_CLASS}
        />
      </div>
    </div>
  );
}

export default function LogisticsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryRange, setDeliveryRange] = useState(defaultDateRange());
  const [postingRange, setPostingRange] = useState(defaultDateRange());
  const [plant, setPlant] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const [page, setPage] = useState(1);

  const [totals, setTotals] = useState(null);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [totalsError, setTotalsError] = useState(null);

  const loadTotals = () => {
    setTotalsLoading(true);
    setTotalsError(null);
    fetch("/api/dashboard/logistics_totals")
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => setTotals(json?.value ?? []))
      .catch((e) => setTotalsError(e?.message || "Ошибка загрузки аналитики"))
      .finally(() => setTotalsLoading(false));
  };

  /* Old 5-entity source — state + fetch/join (commented out, see note above)
  const ENTITY_KEYS = ["pr", "contract", "po", "gr", "invoice"];
  const INITIAL_ENTITY_STATE = { data: null, loading: false, error: null, total: null };

  function num(v) {
    if (v === null || v === undefined || v === "") return "—";
    const n = Number(v);
    return Number.isNaN(n) ? String(v) : new Intl.NumberFormat("ru").format(n);
  }

  const ALL_GROUPS = [
    {
      label: "Заявка на закупку (ЗМЗ)",
      columns: [
        { key: "prNum", label: "№ ЗМЗ", render: (r) => r.pr?.PURCHASEREQUISITION },
        { key: "prItem", label: "Позиция", render: (r) => r.pr?.PurchaseRequisitionItem },
        { key: "material", label: "Материал", render: (r) => r.pr?.Material },
        { key: "text", label: "Описание", render: (r) => r.pr?.Purchaserequisitionitemtext },
        { key: "qty", label: "Кол-во", render: (r) => (r.pr ? num(r.pr.RequestedQuantity) : null) },
        { key: "prUnit", label: "Ед.", render: (r) => r.pr?.BaseUnit },
        { key: "plant", label: "Завод", render: (r) => r.pr?.Plant },
        { key: "creationDate", label: "Дата создания", render: (r) => r.pr?.CreationDate },
        { key: "deliveryDate", label: "Дата поставки", render: (r) => r.pr?.DeliveryDate },
      ],
    },
    {
      label: "Контракт",
      columns: [
        { key: "contractNum", label: "№ Контракта", render: (r) => r.contract?.Contract },
        { key: "contractItem", label: "Позиция", render: (r) => r.contract?.ContractItem },
        { key: "price", label: "Сумма", render: (r) => (r.contract ? num(r.contract.PriceAmount) : null) },
        { key: "contractCurrency", label: "Валюта", render: (r) => r.contract?.Currency },
      ],
    },
    {
      label: "Заказ на поставку (PO)",
      columns: [
        { key: "poNum", label: "№ ЗнЗ", render: (r) => r.po?.PurchaseOrder },
        { key: "poItem", label: "Позиция", render: (r) => r.po?.PurchaseOrderItem },
        { key: "docType", label: "Тип документа", render: (r) => r.po?.PurchaseDocType },
        { key: "volume", label: "Объём", render: (r) => (r.po ? num(r.po.OrderVolume) : null) },
        { key: "poUnit", label: "Ед.", render: (r) => r.po?.OrderVolumeUnit },
        { key: "amount", label: "Сумма", render: (r) => (r.po ? num(r.po.TotalAmount) : null) },
        { key: "poCurrency", label: "Валюта", render: (r) => r.po?.DocumentCurrency },
      ],
    },
    {
      label: "Поступления (GR)",
      columns: [
        { key: "grCount", label: "Кол-во док-тов", render: (r) => r.grCount },
        { key: "grQty", label: "Факт. кол-во", render: (r) => (r.grQtySum !== undefined ? num(r.grQtySum) : null) },
        { key: "grDate", label: "Посл. дата", render: (r) => r.grLastPosting },
      ],
    },
    {
      label: "Счета-фактуры",
      columns: [
        { key: "invCount", label: "Кол-во счетов", render: (r) => r.invCount },
        { key: "invAmount", label: "Сумма", render: (r) => (r.invAmountSum !== undefined ? num(r.invAmountSum) : null) },
        { key: "invCurrency", label: "Валюта", render: (r) => r.invCurrency },
      ],
    },
  ];

  const [entities, setEntities] = useState(() =>
    Object.fromEntries(ENTITY_KEYS.map((k) => [k, { ...INITIAL_ENTITY_STATE }])),
  );
  const [prDateRange, setPrDateRange] = useState(defaultDateRange());
  const [grDateRange, setGrDateRange] = useState(defaultDateRange());

  const updateEntity = (key, patch) => {
    setEntities((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const fetchEntity = async ($filter, key) => {
    updateEntity(key, { loading: true, error: null });
    let entityRows = [];
    let skip = 0;
    try {
      while (entityRows.length < FETCH_SAFETY_CAP) {
        const query = { $top: FETCH_PAGE_SIZE, $skip: skip };
        if ($filter) query.$filter = $filter;

        const res = await fetch("/api/dashboard/logistics_bp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity: key, query }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
        }
        const json = await res.json();
        const batch = json?.value ?? [];
        entityRows = entityRows.concat(batch);
        if (batch.length < FETCH_PAGE_SIZE) break;
        skip += FETCH_PAGE_SIZE;
      }
      updateEntity(key, { data: entityRows, loading: false, total: entityRows.length });
    } catch (e) {
      updateEntity(key, { error: e?.message || "Ошибка загрузки", loading: false });
    }
  };

  const loadAllOld = () => {
    const prParts = [buildODataFilter("pr", prDateRange)];
    if (plant) prParts.push(`Plant eq '${plant}'`);
    fetchEntity(prParts.filter(Boolean).join(" and ") || null, "pr");

    fetchEntity(null, "contract");
    fetchEntity(null, "po");
    fetchEntity(buildODataFilter("gr", grDateRange), "gr");
    fetchEntity(null, "invoice");

    setPage(1);
  };

  const oldLoading = ENTITY_KEYS.some((k) => entities[k].loading);
  const oldError = ENTITY_KEYS.map((k) => entities[k].error).find(Boolean);

  const prContractRows = joinPrContract(entities.pr.data, entities.contract.data);
  const poGrInvoiceRows = joinPoGrInvoice(entities.po.data, entities.gr.data, entities.invoice.data);
  const allRowsOld = [
    ...prContractRows.map((r) => ({
      ...r,
      __key: `pr-${r.pr.PURCHASEREQUISITION}-${r.pr.PurchaseRequisitionItem}`,
    })),
    ...poGrInvoiceRows.map((r) => ({
      ...r,
      __key: `po-${r.po.PurchaseOrder}-${r.po.PurchaseOrderItem}`,
    })),
  ];
  */

  // Loops $skip until SAP returns a short page (end of data) or the safety
  // cap is hit — so "показать все записи" doesn't silently stop at some
  // arbitrary $top, while still bounding worst-case request volume.
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    const $filter = buildGeneralBlockFilter({ deliveryRange, postingRange, plant });

    let allRows = [];
    let skip = 0;
    try {
      while (allRows.length < FETCH_SAFETY_CAP) {
        const query = { $top: FETCH_PAGE_SIZE, $skip: skip };
        if ($filter) query.$filter = $filter;

        const res = await fetch("/api/dashboard/general_block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson?.error || `Ошибка сервера: ${res.status}`);
        }
        const json = await res.json();
        const batch = json?.value ?? [];
        allRows = allRows.concat(batch);
        if (batch.length < FETCH_PAGE_SIZE) break;
        skip += FETCH_PAGE_SIZE;
      }
      setRows(allRows);
      setPage(1);
    } catch (e) {
      setError(e?.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(loadAll);
    queueMicrotask(loadTotals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const size = parseInt(pageSize, 10);
  const pageCount = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(page, pageCount);
  const pageRows = rows.slice((currentPage - 1) * size, currentPage * size);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Логистика</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            MM Dashboard — Закупки, Контракты, Заказы, Поступления, Счета
          </p>
        </div>

        <TotalsAnalytics rows={totals} loading={totalsLoading} error={totalsError} />

        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Фильтры</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
            <DateRangeField label="Дата поставки ЗМЗ" range={deliveryRange} onChange={setDeliveryRange} />
            <DateRangeField label="Дата проводки поступления" range={postingRange} onChange={setPostingRange} />

            <CustomSelect label="Завод" options={PLANT_OPTIONS} value={plant} placeholder="Все заводы" onChange={setPlant} />

            <CustomSelect
              label="На странице"
              options={PAGE_SIZE_OPTIONS}
              value={pageSize}
              placeholder="50 на странице"
              onChange={(v) => {
                setPageSize(v);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/60">
            {error ? (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={loadAll}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {loading ? "Загрузка..." : "Применить"}
            </button>
          </div>
        </div>

        {loading ? (
          <Loader
            label="Загрузка данных..."
            hint="Получаем все заявки, контракты, заказы, поступления и счета за период"
          />
        ) : (
          <>
            <JoinedTable
              title="Логистика — все стадии закупки"
              groups={GENERAL_BLOCK_GROUPS}
              rows={pageRows}
              rowKey={generalBlockRowKey}
            />

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Всего: {rows.length} записей — страница {currentPage} из {pageCount}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage >= pageCount}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-900/40 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Далее
                </button>
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
  return { props: {} };
}
