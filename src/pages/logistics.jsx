"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import Loader from "@/components/ui/Loader";
import CustomSelect from "@/components/ui/CustomSelect";
import { JoinedTable } from "@/components/logistics";
import { buildODataFilter } from "@/components/logistics/config";
import { joinPrContract, joinPoGrInvoice } from "@/components/logistics/joins";
// import {
//   GENERAL_BLOCK_GROUPS,
//   buildGeneralBlockFilter,
//   generalBlockRowKey,
// } from "@/components/logistics/generalBlockConfig"; // new consolidated source — commented out below, see note
import { PLANT_OPTIONS } from "@/data/organizations";

// ---------------------------------------------------------------------------
// Data source history for this page:
//   Current: 5 separate SAP OData entities (PR, Contract, PO, GR, Invoice) via
//        /api/dashboard/logistics_bp, joined client-side (PR<->Contract and
//        PO<->GR<->Invoice only — SAP's PurchaseOrder API has no field back to
//        PR/Contract, so the two halves can't be linked). This is the one that
//        actually returns data right now — use it for showing managers.
//   New: one consolidated entity (GeneralBlock) via /api/dashboard/general_block,
//        already joined server-side by SAP — no more split-halves caveat once
//        it works. Currently 403s: DASHBOARD account still needs SAP to grant
//        access to service group ZSC_GENERAL_BLOCK_O4 on 10.20.6.144. Code is
//        commented out below (general_block.js / generalBlockConfig.js kept as
//        is) — switch back once that access lands.
// ---------------------------------------------------------------------------

const ENTITY_KEYS = ["pr", "contract", "po", "gr", "invoice"];
const INITIAL_ENTITY_STATE = { data: null, loading: false, error: null, total: null };

// SAP page size per request while looping $skip, and a hard safety cap so a
// runaway filter (e.g. no date range at all) can't pull the whole table in.
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

function num(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : new Intl.NumberFormat("ru").format(n);
}

// One wide table, all 5 process stages as header groups. A given row is
// either a PR+Contract pair (PO/GR/Invoice columns blank) or a PO/GR/Invoice
// aggregate (ЗМЗ/Контракт columns blank) — SAP's PurchaseOrder API has no
// field back to PurchaseRequisition/Contract, so rows from the two halves
// can't be matched to each other; this only puts them in one table visually.
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

export default function LogisticsPage() {
  const [entities, setEntities] = useState(() =>
    Object.fromEntries(ENTITY_KEYS.map((k) => [k, { ...INITIAL_ENTITY_STATE }])),
  );
  const [prDateRange, setPrDateRange] = useState(defaultDateRange());
  const [grDateRange, setGrDateRange] = useState(defaultDateRange());
  const [plant, setPlant] = useState("");
  const [pageSize, setPageSize] = useState("50");
  const [page, setPage] = useState(1);

  const updateEntity = (key, patch) => {
    setEntities((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  // Loops $skip until SAP returns a short page (end of data) or the safety
  // cap is hit — so "показать все записи" doesn't silently stop at some
  // arbitrary $top, while still bounding worst-case request volume.
  const fetchEntity = async ($filter, key) => {
    updateEntity(key, { loading: true, error: null });
    let rows = [];
    let skip = 0;
    try {
      while (rows.length < FETCH_SAFETY_CAP) {
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
        rows = rows.concat(batch);
        if (batch.length < FETCH_PAGE_SIZE) break;
        skip += FETCH_PAGE_SIZE;
      }
      updateEntity(key, { data: rows, loading: false, total: rows.length });
    } catch (e) {
      updateEntity(key, { error: e?.message || "Ошибка загрузки", loading: false });
    }
  };

  const loadAll = () => {
    const prParts = [buildODataFilter("pr", prDateRange)];
    if (plant) prParts.push(`Plant eq '${plant}'`);
    fetchEntity(prParts.filter(Boolean).join(" and ") || null, "pr");

    fetchEntity(null, "contract");
    fetchEntity(null, "po");
    fetchEntity(buildODataFilter("gr", grDateRange), "gr");
    fetchEntity(null, "invoice");

    setPage(1);
  };

  useEffect(() => {
    queueMicrotask(loadAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = ENTITY_KEYS.some((k) => entities[k].loading);
  const error = ENTITY_KEYS.map((k) => entities[k].error).find(Boolean);

  const prContractRows = joinPrContract(entities.pr.data, entities.contract.data);
  const poGrInvoiceRows = joinPoGrInvoice(entities.po.data, entities.gr.data, entities.invoice.data);
  const allRows = [
    ...prContractRows.map((r) => ({
      ...r,
      __key: `pr-${r.pr.PURCHASEREQUISITION}-${r.pr.PurchaseRequisitionItem}`,
    })),
    ...poGrInvoiceRows.map((r) => ({
      ...r,
      __key: `po-${r.po.PurchaseOrder}-${r.po.PurchaseOrderItem}`,
    })),
  ];

  /* New consolidated source (GeneralBlock) — commented out, see note above
  const [rows, setRows] = useState([]);
  const [deliveryRange, setDeliveryRange] = useState(defaultDateRange());
  const [postingRange, setPostingRange] = useState(defaultDateRange());

  const loadAllNew = async () => {
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
  */

  const size = parseInt(pageSize, 10);
  const pageCount = Math.max(1, Math.ceil(allRows.length / size));
  const currentPage = Math.min(page, pageCount);
  const pageRows = allRows.slice((currentPage - 1) * size, currentPage * size);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Логистика</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            MM Dashboard — Закупки, Контракты, Заказы, Поступления, Счета
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дата создания ЗМЗ с</label>
            <input
              type="date"
              value={prDateRange.from || ""}
              onChange={(e) => setPrDateRange({ ...prDateRange, from: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">по</label>
            <input
              type="date"
              value={prDateRange.to || ""}
              onChange={(e) => setPrDateRange({ ...prDateRange, to: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Дата проводки поступления с</label>
            <input
              type="date"
              value={grDateRange.from || ""}
              onChange={(e) => setGrDateRange({ ...grDateRange, from: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">по</label>
            <input
              type="date"
              value={grDateRange.to || ""}
              onChange={(e) => setGrDateRange({ ...grDateRange, to: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="w-56">
            <CustomSelect label="Завод" options={PLANT_OPTIONS} value={plant} placeholder="Все заводы" onChange={setPlant} />
          </div>
          <div className="w-40">
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
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Загрузка..." : "Применить"}
          </button>
          {error && <p className="text-xs text-red-600 dark:text-red-400 w-full">{error}</p>}
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
              groups={ALL_GROUPS}
              rows={pageRows}
              rowKey={(r) => r.__key}
            />

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Всего: {allRows.length} записей (ЗМЗ+Контракт: {prContractRows.length}, PO+Поступления+Счета:{" "}
                {poGrInvoiceRows.length}) — страница {currentPage} из {pageCount}
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

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Строки ЗМЗ/Контракт и строки Заказ/Поступление/Счёт не связаны между собой:
          SAP API заказа на поставку не содержит ссылки на заявку/контракт, поэтому единой
          сквозной цепочки ЗМЗ → Счёт для одной строки построить нельзя без доработки этого
          API на стороне SAP.
        </p>
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
