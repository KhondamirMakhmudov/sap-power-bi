"use client";

import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { isAuthenticated } from "@/utils/auth";
import CustomSelect from "@/components/ui/CustomSelect";
import Loader from "@/components/ui/Loader";
import { AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── constants ───────────────────────────────────────────────────────────────

const MONTHS = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",
];

const CAT_KEYS = ["directors","specialists","technical_staff","service_staff","production_staff"];
const CAT_LABELS = {
  directors:       "Руководители",
  specialists:     "Специалисты",
  technical_staff: "Технический персонал",
  service_staff:   "Служащие",
  production_staff:"Рабочие",
};
const CAT_COLORS = ["#1E40AF","#3B82F6","#60A5FA","#F59E0B","#EF4444"];

const TOOLTIP_STYLE = {
  fontSize: 12,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "6px 10px",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseMetrics(data) {
  if (!Array.isArray(data)) return {};
  const map = {};
  for (const item of data) {
    const { categories, ...rest } = item;
    const key = Object.keys(rest)[0];
    if (key !== undefined) map[key] = { value: rest[key], cats: categories?.[0] ?? {} };
  }
  return map;
}

function num(v) {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("ru").format(v);
}

function lastDay(year, month) {
  return new Date(year, month, 0).getDate();
}

// ─── small components ─────────────────────────────────────────────────────────

const TOOLTIP_FN = (v, name) => [num(v), name];

function DonutCenter({ value, label }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{num(value)}</span>
      {label && <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</span>}
    </div>
  );
}

function MiniDonut({ data, size = 120, innerRadius = 34, outerRadius = 52, centerValue, centerLabel }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={data} dataKey="value" cx="50%" cy="50%"
          innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2} startAngle={90} endAngle={-270}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={TOOLTIP_FN} />
      </PieChart>
      {centerValue !== undefined && <DonutCenter value={centerValue} label={centerLabel} />}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function HrPanelPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const yearOptions = [-1, 0, 1].map((d) => ({
    value: String(currentYear + d),
    label: String(currentYear + d),
  }));
  const monthOptions = MONTHS.map((label, i) => ({ value: String(i + 1), label }));
  const categoryOptions = [
    { value: "", label: "Все" },
    ...CAT_KEYS.map((k) => ({ value: k, label: CAT_LABELS[k] })),
  ];

  const [filters, setFilters] = useState({
    year: String(currentYear),
    month: String(currentMonth),
    category: "",
  });
  const [metrics, setMetrics]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [sapDetail, setSapDetail] = useState(null);

  async function loadData() {
    const year  = parseInt(filters.year);
    const month = parseInt(filters.month);
    const begda = `${year}-${String(month).padStart(2,"0")}-01`;
    const endda = `${year}-${String(month).padStart(2,"0")}-${String(lastDay(year, month)).padStart(2,"0")}`;

    setLoading(true);
    setError(null);
    setSapDetail(null);
    try {
      const res = await fetch("/api/hcm/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgin: "", begda, endda }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body.sap_body) setSapDetail(body.sap_body);
        throw new Error(body.error || `Ошибка ${res.status}`);
      }
      setMetrics(parseMetrics(await res.json()));
    } catch (err) {
      setError(err.message || "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const get  = (key) => metrics?.[key]?.value;
  const cats = (key) => metrics?.[key]?.cats ?? {};

  // when a category is selected return that category's count, else the total
  const getF = (key) => {
    if (!metrics) return undefined;
    if (!filters.category) return metrics[key]?.value;
    return metrics[key]?.cats?.[filters.category]?.all;
  };

  // gender totals
  const gender = useMemo(() => {
    if (!metrics) return null;
    if (filters.category) {
      const cat = cats("all_count")[filters.category] ?? {};
      return { men: (cat.all ?? 0) - (cat.women ?? 0), women: cat.women ?? 0 };
    }
    const c = cats("all_count");
    const women = CAT_KEYS.reduce((s, k) => s + (c[k]?.women ?? 0), 0);
    return { men: (get("all_count") ?? 0) - women, women };
  }, [metrics, filters.category]);

  // composition donut — selected category is highlighted, rest dimmed
  const compositionData = useMemo(() => {
    if (!metrics) return [];
    const c = cats("all_count");
    return CAT_KEYS.map((k, i) => ({
      name: CAT_LABELS[k],
      value: c[k]?.all ?? 0,
      color: !filters.category || filters.category === k ? CAT_COLORS[i] : "#e5e7eb",
    })).filter((d) => d.value > 0);
  }, [metrics, filters.category]);

  // education donut
  const eduData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Высшее",         value: getF("higher") ?? 0,                              color: "#1E40AF" },
      { name: "Магистратура",   value: (getF("obr_acad") ?? 0) + (getF("obr_bsch") ?? 0), color: "#2563EB" },
      { name: "Среднее спец.",  value: getF("secondary") ?? 0,                           color: "#3B82F6" },
      { name: "Проч. образов.", value: getF("secondary_prof_general_lower") ?? 0,         color: "#93C5FD" },
      { name: "PhD / DSc",      value: getF("phd_dsc") ?? 0,                             color: "#1E3A5F" },
    ].filter((d) => d.value > 0);
  }, [metrics, filters.category]);

  // age bar
  const ageData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "16–29", value: getF("age_16_29") ?? 0 },
      { name: "30–39", value: getF("age_30_39") ?? 0 },
      { name: "40–49", value: getF("age_40_49") ?? 0 },
      { name: "50–59", value: getF("age_50_59") ?? 0 },
      { name: "60+",   value: getF("age_60all") ?? 0 },
    ];
  }, [metrics, filters.category]);

  // pensioners by category
  const pensData = useMemo(() => {
    if (!metrics) return [];
    const c = cats("pens");
    const colors = ["#EF4444","#F97316","#EAB308","#10B981","#8B5CF6"];
    if (filters.category) {
      const cat = c[filters.category];
      return cat ? [{ name: CAT_LABELS[filters.category], value: cat.all ?? 0, color: colors[CAT_KEYS.indexOf(filters.category)] }] : [];
    }
    return CAT_KEYS.map((k, i) => ({
      name: CAT_LABELS[k], value: c[k]?.all ?? 0, color: colors[i],
    })).filter((d) => d.value > 0);
  }, [metrics, filters.category]);

  const hireCats    = useMemo(() => cats("all_hire"), [metrics]);
  const dismissCats = useMemo(() => cats("all_dismissed"), [metrics]);

  return (
    <MainLayout>
      <div className="space-y-4 text-sm">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="rounded-xl" style={{ background: "linear-gradient(90deg,#0B1F4B 0%,#0D2660 100%)" }}>
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-lg font-bold" style={{ color: "#F5C518" }}>
              Доска руководителя — Управление персоналом
            </h1>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-300 mb-1">Год</p>
                <CustomSelect options={yearOptions} value={filters.year} placeholder="Год"
                  onChange={(v) => setFilters({ ...filters, year: v })} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-300 mb-1">Месяц</p>
                <CustomSelect options={monthOptions} value={filters.month} placeholder="Месяц"
                  onChange={(v) => setFilters({ ...filters, month: v })} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-blue-300 mb-1">Категория</p>
                <CustomSelect
                  options={categoryOptions}
                  value={filters.category}
                  placeholder="Все"
                  onChange={(v) => setFilters({ ...filters, category: v })}
                />
              </div>
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="px-5 py-1.5 rounded-lg font-semibold text-sm transition-colors"
                style={{ background: loading ? "#334155" : "#2563EB", color: "#fff" }}
              >
                {loading ? "Загрузка…" : "Применить"}
              </button>
              <p className="text-xs text-blue-300 self-end pb-1">
                {now.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          {error && (
            <div className="px-6 pb-3 space-y-1">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              {sapDetail && (
                <pre className="text-xs bg-red-950/40 rounded p-2 text-red-300 overflow-x-auto whitespace-pre-wrap break-all">
                  {sapDetail}
                </pre>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <Loader
            label="Загрузка данных HR панели..."
            hint="Получаем кадровые показатели из SAP HCM за выбранный период"
          />
        ) : !metrics ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-20 flex items-center justify-center text-gray-400 dark:text-gray-500">
            Выберите период и нажмите «Применить»
          </div>
        ) : (
          <>
            {/* ── KPI strip ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-gray-200 dark:bg-gray-600 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {[
                { label: "Общая численность",    value: num(getF("all_count")),      sub: null,                             subColor: "" },
                { label: "Принято с нач. года",  value: num(getF("all_hire")),        sub: `▲ ${num(getF("all_hire"))}`,    subColor: "text-green-600 dark:text-green-400" },
                { label: "Уволено с нач. года",  value: num(getF("all_dismissed")),   sub: `▼ ${num(getF("all_dismissed"))}`, subColor: "text-red-500" },
                { label: "Текучесть кадров %",   value: `${Number(get("all_ternoved") ?? 0).toFixed(2)}`, sub: null,       subColor: "" },
                { label: "Кол-во вакансий",      value: num(getF("all_vacant")),      sub: `▼ ${num(getF("all_vacant"))}`, subColor: "text-red-500" },
                { label: "Пенсионеры",           value: num(getF("pens")),            sub: "— чел.",                        subColor: "text-gray-400 dark:text-gray-500" },
                { label: "Инвалиды II гр.",      value: num(getF("disability_2")),    sub: null,                            subColor: "" },
                { label: "По ГПХ / совм.",       value: num((getF("gph_work") ?? 0) + (getF("by_work") ?? 0)), sub: null, subColor: "" },
              ].map(({ label, value, sub, subColor }) => (
                <div key={label} className="bg-white dark:bg-gray-800 px-4 py-3">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 leading-none">{value}</p>
                  {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
                </div>
              ))}
            </div>

            {/* ── Row 1 ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

              {/* Gender */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Количество (Муж/Жен)</p>
                {gender && (
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center gap-1">
                      <MiniDonut
                        data={[
                          { name: "Мужчины", value: gender.men,   color: "#2563EB" },
                          { name: "Женщины", value: gender.women, color: "#e5e7eb" },
                        ]}
                        centerValue={gender.men}
                        size={110} innerRadius={32} outerRadius={50}
                      />
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Мужчины</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <MiniDonut
                        data={[
                          { name: "Женщины", value: gender.women, color: "#EC4899" },
                          { name: "Мужчины", value: gender.men,   color: "#e5e7eb" },
                        ]}
                        centerValue={gender.women}
                        size={110} innerRadius={32} outerRadius={50}
                      />
                      <p className="text-xs font-semibold text-pink-600">Женщины</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hired / Dismissed grid */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm lg:col-span-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Принято / Уволено с нач. года
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {CAT_KEYS.map((k) => (
                    <div key={k} className="space-y-0.5">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{CAT_LABELS[k]}</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300 leading-none">{num(hireCats[k]?.all)}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">принято</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400 leading-none">{num(dismissCats[k]?.all)}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">уволено</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dismissal reasons */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Причины увольнений</p>
                <div className="space-y-2">
                  {[
                    { label: "Сокращение штата",  key: "dismissed_st" },
                    { label: "Дисциплинарные",    key: "dismissed_disp" },
                    { label: "По решению суда",   key: "dismissed_sanc" },
                    { label: "Прочие причины",    key: "dismissed_other" },
                  ].map(({ label, key }) => {
                    const val = getF(key) ?? 0;
                    const total = getF("all_dismissed") || 1;
                    const pct = Math.round((val / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                          <span>{label}</span>
                          <span className="font-semibold">{num(val)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Row 2 ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Pensioners donut */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Пенсионеры</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{num(getF("pens"))}</p>
                <div className="flex gap-4 items-center">
                  <MiniDonut data={pensData} centerValue={getF("pens")} size={120} innerRadius={34} outerRadius={52} />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {pensData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{d.name}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{num(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Age distribution bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Возрастные группы</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={ageData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [num(v), "чел."]} />
                    <Bar dataKey="value" radius={[4,4,0,0]} barSize={28}>
                      {ageData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? "#2563EB" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-5 gap-1 mt-2 text-center">
                  {ageData.map((d) => (
                    <div key={d.name}>
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{num(d.value)}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{d.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education donut */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Образование</p>
                <div className="flex gap-4 items-center">
                  <MiniDonut
                    data={eduData}
                    centerValue={getF("education")}
                    size={120} innerRadius={34} outerRadius={52}
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {eduData.map((d) => {
                      const total = getF("education") || 1;
                      const p = Math.round((d.value / total) * 100);
                      return (
                        <div key={d.name} className="flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{d.name}</span>
                          <span className="text-gray-400 dark:text-gray-500 mr-1">{p}%</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{num(d.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 3 ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Composition donut */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Состав работающих</p>
                <div className="flex gap-4 items-center">
                  <MiniDonut
                    data={compositionData}
                    centerValue={getF("all_count")}
                    size={120} innerRadius={34} outerRadius={52}
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {compositionData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{d.name}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{num(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Training */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Повышение квалификации (КПК)
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Всего прошли КПК",          key: "kl" },
                    { label: "КПК за рубежом",            key: "kl_z" },
                    { label: "КПК — Академия госупр.",     key: "kl_acad" },
                    { label: "КПК — Высш. школа бизнеса", key: "kl_bsch" },
                    { label: "КПК — Ин-т молодёжи",       key: "kl_inst" },
                  ].map(({ label, key }) => {
                    const val = getF(key) ?? 0;
                    const total = getF("kl") || 1;
                    const pct = Math.round((val / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                          <span>{label}</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{num(val)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special statuses */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Особые статусы</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Отпуск по уходу", key: "leave_child" },
                    { label: "Инвалиды II гр.", key: "disability_2" },
                    { label: "Внешние совм.",   key: "by_work" },
                    { label: "По ГПХ",          key: "gph_work" },
                    { label: "Новые должности", key: "new_position" },
                    { label: "Вакансии",        key: "all_vacant" },
                  ].map(({ label, key }) => (
                    <div key={key} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{num(getF(key))}</p>
                    </div>
                  ))}
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
  return { props: {} };
}
