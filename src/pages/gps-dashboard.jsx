"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import CustomSelect from "@/components/ui/CustomSelect";
import Loader from "@/components/ui/Loader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { MapPin, Search } from "lucide-react";
import { isAuthenticated, getSessionUsername } from "@/utils/auth";
import { useTheme } from "@/contexts/ThemeContext";

const CATEGORY_MAP = {
  Автомобиль: { label: "Легковые", color: "#3B82F6" },
  car: { label: "Легковые", color: "#3B82F6" },
  Автобус: { label: "Автобусы", color: "#F97316" },
  bus: { label: "Автобусы", color: "#F97316" },
  Грузовой: { label: "Грузовые", color: "#EAB308" },
  truck: { label: "Грузовые", color: "#EAB308" },
  crane: { label: "Кран", color: "#A855F7" },
  tractor: { label: "Трактор", color: "#8B5CF6" },
  forklift: { label: "Погрузчик", color: "#EC4899" },
  bulldozer: { label: "Бульдозер", color: "#14B8A6" },
  excavator: { label: "Экскаватор", color: "#0EA5E9" },
  fire: { label: "Пожарный", color: "#EF4444" },
  garbage: { label: "Мусоровоз", color: "#6B7280" },
  dump: { label: "Самосвал", color: "#CA8A04" },
  Скутер: { label: "Скутер", color: "#06B6D4" },
  scooter: { label: "Скутер", color: "#06B6D4" },
  unknown: { label: "Не определено", color: "#64748B" },
  Другое: { label: "Прочие", color: "#94A3B8" },
};

// Keyed by the Russian label that normalizeFuel() produces, so fuelData always
// looks up color after translation — no need to duplicate raw English keys here.
const FUEL_COLORS = {
  Дизель: "#3B82F6",
  Бензин: "#F59E0B",
  Электро: "#10B981",
  Газ: "#8B5CF6",
  Метан: "#06B6D4",
  "Бензин/метан": "#EC4899",
  Другое: "#94A3B8",
};

const STATUS_BADGE = {
  online: { bg: "#DCFCE7", color: "#15803D", dot: "#16A34A", label: "Онлайн" },
  offline: { bg: "#FEE2E2", color: "#B91C1C", dot: "#DC2626", label: "Офлайн" },
  unknown: { bg: "#FEF3C7", color: "#92400E", dot: "#D97706", label: "Неизвестно" },
};

function groupByDecade(byYear) {
  const groups = {
    "до 1990": 0,
    "1990–2000": 0,
    "2001–2010": 0,
    "2011–2020": 0,
    "2021+": 0,
    "Н/Д": 0,
  };

  Object.entries(byYear || {}).forEach(([year, value]) => {
    const parsed = parseInt(year, 10);
    if (Number.isNaN(parsed)) {
      groups["Н/Д"] += value;
    } else if (parsed < 1990) {
      groups["до 1990"] += value;
    } else if (parsed <= 2000) {
      groups["1990–2000"] += value;
    } else if (parsed <= 2010) {
      groups["2001–2010"] += value;
    } else if (parsed <= 2020) {
      groups["2011–2020"] += value;
    } else {
      groups["2021+"] += value;
    }
  });

  return groups;
}

function fmt(value) {
  return new Intl.NumberFormat("ru").format(Math.round(value || 0));
}

function normalizeFuel(fuelType) {
  if (!fuelType) return null;
  const normalized = fuelType.toLowerCase();
  if (normalized === "petrol" || normalized === "бензин" || normalized === "газ/бензин") return "Бензин";
  if (normalized === "diesel" || normalized === "дизель") return "Дизель";
  if (normalized === "electric" || normalized === "электро") return "Электро";
  if (normalized === "gas" || normalized === "газ") return "Газ";
  if (normalized === "methane" || normalized === "метан") return "Метан";
  if (normalized === "petrol_methane") return "Бензин/метан";
  if (normalized === "other" || normalized === "другое" || normalized === "unknown" || normalized === "неизвестно") return "Другое";
  return fuelType;
}

function StatusBadge({ status }) {
  const data = STATUS_BADGE[status] || STATUS_BADGE.unknown;
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.dot }} />
      {data.label}
    </span>
  );
}

function HalfGauge({ online, offline, unknown, total }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = 240;
    const height = 130;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height - 12;
    const radius = 72;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.strokeStyle = isDark ? "#334155" : "#E2E8F0";
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
    ctx.stroke();

    const segments = [
      { value: online, color: "#10B981" },
      { value: offline, color: "#EF4444" },
      { value: unknown, color: "#F59E0B" },
    ].filter((segment) => segment.value > 0);

    const totalValue = segments.reduce((sum, item) => sum + item.value, 0);
    const angleSpan = Math.PI;
    let startAngle = Math.PI;

    segments.forEach((segment) => {
      const segmentAngle = (segment.value / Math.max(totalValue, 1)) * angleSpan;
      ctx.beginPath();
      ctx.strokeStyle = segment.color;
      ctx.arc(cx, cy, radius, startAngle, startAngle + segmentAngle);
      ctx.stroke();
      startAngle += segmentAngle;
    });

    const percent = total ? Math.round((online / total) * 100) : 0;
    ctx.fillStyle = isDark ? "#F1F5F9" : "#0F172A";
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${percent}%`, cx, cy - 12);
    ctx.fillStyle = isDark ? "#94A3B8" : "#475569";
    ctx.font = "500 11px Inter, sans-serif";
    ctx.fillText("ОНЛАЙН", cx, cy + 8);
  }, [online, offline, unknown, total, isDark]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: 130 }} />;
}

const TOOLTIP_STYLE = {
  fontSize: 12,
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  borderRadius: 8,
  padding: "8px 12px",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

const API_BASE = "https://app.tpp.uz/gps/api";

export default function GPSDashboardPage({ username }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [summaryData, setSummaryData] = useState(null);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);
  const [errorVehicles, setErrorVehicles] = useState(null);
  const [errorCompanies, setErrorCompanies] = useState(null);
  const [errorAuth, setErrorAuth] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFuel, setFilterFuel] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setLoadingAuth(true);
    setErrorAuth(null);
    setLoadingSummary(true);
    setLoadingVehicles(true);
    setLoadingCompanies(true);
    setErrorSummary(null);
    setErrorVehicles(null);
    setErrorCompanies(null);

    const authHeaders = () => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    const fetchSummary = () => {
      setLoadingSummary(true);
      setErrorSummary(null);
      return fetch(`${API_BASE}/dashboard/summary`, { headers: authHeaders() })
        .then((response) => {
          if (!response.ok) throw new Error(`Ошибка ${response.status}`);
          return response.json();
        })
        .then((data) => setSummaryData(data))
        .catch((error) => setErrorSummary(error.message || "Не удалось загрузить сводку"))
        .finally(() => setLoadingSummary(false));
    };

    const fetchVehicles = () => {
      setLoadingVehicles(true);
      setErrorVehicles(null);
      return fetch(`${API_BASE}/dashboard/vehicles`, { headers: authHeaders() })
        .then((response) => {
          if (!response.ok) throw new Error(`Ошибка ${response.status}`);
          return response.json();
        })
        .then((data) => setVehiclesData(Array.isArray(data) ? data : []))
        .catch((error) => setErrorVehicles(error.message || "Не удалось загрузить список транспортных средств"))
        .finally(() => setLoadingVehicles(false));
    };

    const fetchCompanies = () => {
      setLoadingCompanies(true);
      setErrorCompanies(null);
      return fetch(`${API_BASE}/dashboard/companies`, { headers: authHeaders() })
        .then((response) => {
          if (!response.ok) throw new Error(`Ошибка ${response.status}`);
          return response.json();
        })
        .then((data) => setCompaniesData(Array.isArray(data) ? data : []))
        .catch((error) => setErrorCompanies(error.message || "Не удалось загрузить компании"))
        .finally(() => setLoadingCompanies(false));
    };

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username: "admin", password: "OvJ#f*$sGYnWtrM" }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Авторизация не удалась (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (!data.token) throw new Error("Токен не получен");
        localStorage.setItem("token", data.token);
        setLoadingAuth(false);
        setErrorAuth(null);
        fetchSummary();
        fetchVehicles();
        fetchCompanies();
      })
      .catch((error) => {
        setErrorAuth(error.message || "Ошибка подключения к серверу");
        setLoadingAuth(false);
        setLoadingSummary(false);
        setLoadingVehicles(false);
        setLoadingCompanies(false);
      });
  }, [retryKey]);

  useEffect(() => {
    const interval = setInterval(() => setRetryKey((key) => key + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehiclesData.filter((vehicle) => {
      if (filterCompany && vehicle.company !== filterCompany) return false;
      if (filterCategory && vehicle.category !== filterCategory) return false;
      if (filterStatus && vehicle.status !== filterStatus) return false;
      if (filterFuel) {
        const fuel = normalizeFuel(vehicle.fuelType);
        if (!fuel) return false;
        if (filterFuel === "petrol" && fuel !== "Бензин") return false;
        if (filterFuel === "diesel" && fuel !== "Дизель") return false;
        if (filterFuel === "electric" && fuel !== "Электро") return false;
        if (filterFuel === "gas" && fuel !== "Газ" && fuel !== "Метан") return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          (vehicle.company || "").toLowerCase().includes(q) ||
          (vehicle.model || "").toLowerCase().includes(q) ||
          (vehicle.plateNumber || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vehiclesData, filterCompany, filterCategory, filterStatus, filterFuel, search]);

  const filteredSummary = useMemo(() => {
    const byYear = {};
    const byCategory = {};
    const byFuel = {};
    let online = 0;
    let offline = 0;
    let unknown = 0;
    let moving = 0;
    let stopped = 0;

    filteredVehicles.forEach((vehicle) => {
      const year = String(vehicle.yearProduced || "Н/Д");
      byYear[year] = (byYear[year] || 0) + 1;
      const category = vehicle.category || "Другое";
      byCategory[category] = (byCategory[category] || 0) + 1;
      const fuel = normalizeFuel(vehicle.fuelType);
      if (fuel) byFuel[fuel] = (byFuel[fuel] || 0) + 1;
      if (vehicle.status === "online") online += 1;
      else if (vehicle.status === "offline") offline += 1;
      else unknown += 1;
      if (vehicle.moving === true) moving += 1;
      else if (vehicle.moving === false) stopped += 1;
    });

    return {
      total: filteredVehicles.length,
      online,
      offline,
      unknown,
      moving,
      stopped,
      byYear,
      byCategory,
      byFuel,
    };
  }, [filteredVehicles]);

  const displaySummary = useMemo(() => {
    const base = summaryData || {};
    const useRemote = !search && !filterCompany && !filterCategory && !filterStatus && !filterFuel;
    if (useRemote) {
      return {
        total: base.total ?? 0,
        online: base.online ?? 0,
        offline: base.offline ?? 0,
        unknown: base.unknown ?? 0,
        moving: base.moving ?? 0,
        stopped: base.stopped ?? 0,
        byYear: base.byYear || {},
        byCategory: base.byCategory || {},
        byFuel: base.byFuel || {},
      };
    }
    return filteredSummary;
  }, [summaryData, filteredSummary, search, filterCompany, filterCategory, filterStatus, filterFuel]);

  const decadeData = useMemo(() => {
    const groups = groupByDecade(displaySummary.byYear);
    return Object.entries(groups)
      .filter(([, count]) => count > 0)
      .map(([name, value], index) => ({
        name,
        value,
        color: ["#1E40AF", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"][index] || "#94A3B8",
      }));
  }, [displaySummary.byYear]);

  const categoryData = useMemo(() => {
    const grouped = {};
    Object.entries(displaySummary.byCategory || {}).forEach(([rawName, value]) => {
      const meta = CATEGORY_MAP[rawName];
      const name = meta?.label || rawName;
      if (!grouped[name]) grouped[name] = { name, value: 0, color: meta?.color || "#94A3B8" };
      grouped[name].value += value;
    });
    return Object.values(grouped);
  }, [displaySummary.byCategory]);

  const fuelData = useMemo(() => {
    const grouped = {};
    Object.entries(displaySummary.byFuel || {}).forEach(([rawName, value]) => {
      const name = normalizeFuel(rawName) || rawName;
      if (!grouped[name]) grouped[name] = { name, value: 0, color: FUEL_COLORS[name] || "#94A3B8" };
      grouped[name].value += value;
    });
    return Object.values(grouped);
  }, [displaySummary.byFuel]);

  const companies = useMemo(() => {
    if (companiesData.length > 0) {
      return companiesData
        .map((company) => (company && typeof company === "object" ? company.name : company))
        .filter(Boolean);
    }
    return [...new Set(vehiclesData.map((item) => item.company).filter(Boolean))];
  }, [companiesData, vehiclesData]);
  const categories = useMemo(() => [...new Set(vehiclesData.map((item) => item.category).filter(Boolean))], [vehiclesData]);
  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredVehicles.slice(start, start + pageSize);
  }, [filteredVehicles, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, filterCompany, filterCategory, filterStatus, filterFuel, pageSize]);

  const isLoading = loadingAuth || loadingSummary || loadingVehicles || loadingCompanies;
  const hasError = !!(errorAuth || errorSummary || errorVehicles || errorCompanies);

  const getFuelText = (fuelType) => {
    const fuel = normalizeFuel(fuelType);
    return fuel || "—";
  };

  return (
    <MainLayout username={username}>
      <div className="space-y-6 min-w-0 overflow-x-hidden">
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-950 p-6 shadow-sm text-white">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">УАТ дашборд</p>
                  <h1 className="text-2xl font-semibold text-white">GPS-панель</h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm text-slate-300">
                Сводка по транспорту, статусам и GPS-соединению в одном окне.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Всего ТС</p>
                <p className="mt-3 text-3xl font-semibold text-white">{fmt(displaySummary.total)}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Онлайн</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-400">{fmt(displaySummary.online)}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Офлайн</p>
                <p className="mt-3 text-3xl font-semibold text-rose-400">{fmt(displaySummary.offline)}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">На стоянке</p>
                <p className="mt-3 text-3xl font-semibold text-slate-400 dark:text-slate-500">{fmt(displaySummary.stopped)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Поиск</label>
              <div className="mt-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Марка, номер, компания"
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <CustomSelect
                label="Компания"
                value={filterCompany}
                onChange={(value) => setFilterCompany(value)}
                placeholder="Все"
                options={[{ value: "", label: "Все" }, ...companies.map((company) => ({ value: company, label: company }))]}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <CustomSelect
                label="Категория"
                value={filterCategory}
                onChange={(value) => setFilterCategory(value)}
                placeholder="Все"
                options={[{ value: "", label: "Все" }, ...categories.map((category) => ({ value: category, label: category }))]}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <CustomSelect
                label="Статус"
                value={filterStatus}
                onChange={(value) => setFilterStatus(value)}
                placeholder="Все"
                options={[
                  { value: "", label: "Все" },
                  { value: "online", label: "Онлайн" },
                  { value: "offline", label: "Офлайн" },
                  { value: "unknown", label: "Неизвестно" },
                ]}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <CustomSelect
                label="Топливо"
                value={filterFuel}
                onChange={(value) => setFilterFuel(value)}
                placeholder="Все"
                options={[
                  { value: "", label: "Все" },
                  { value: "petrol", label: "Бензин" },
                  { value: "diesel", label: "Дизель" },
                  { value: "electric", label: "Электро" },
                  { value: "gas", label: "Газ / Метан" },
                  { value: "other", label: "Другое" },
                ]}
              />
            </div>
          </div>
        </section>

        {isLoading && (
          <Loader
            label="Загрузка данных GPS-панели..."
            hint="Получаем информацию о транспортных средствах и статусах"
          />
        )}

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_280px]">
          <aside className="space-y-6 min-w-0">
            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">По годам выпуска</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Распределение автопарка</p>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{fmt(displaySummary.total)} ТС</span>
              </div>
              <div className="mt-5 h-56">
                {!isLoading && !hasError ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={decadeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                        {decadeData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Загрузка...</div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {decadeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">По категориям</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Топовые типы ТС</p>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{categoryData.length} категорий</span>
              </div>
              <div className="mt-5 h-56">
                {!isLoading && !hasError ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12, top: 10, bottom: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={88}
                        interval={0}
                        tick={{ fontSize: 12, fill: isDark ? "#CBD5E1" : "#0f172a", fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name]} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18} barCategoryGap="20%">
                        {categoryData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Загрузка...</div>
                )}
              </div>
            </section>
          </aside>

          <main className="space-y-6 min-w-0">
            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Транспортные средства</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Фильтруйте, ищите и просматривайте список.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Показано {paginatedVehicles.length} из {filteredVehicles.length}
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Строк на страницу:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="min-w-[72px] bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none"
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="max-h-[520px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Компания</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Категория</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Модель</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Номер</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Год</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Топливо</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Одометр</th>
                      <th className="sticky top-0 bg-slate-950 whitespace-nowrap px-4 py-3 text-left font-semibold">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white dark:bg-gray-800">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Нет транспортных средств по текущим фильтрам.
                        </td>
                      </tr>
                    ) : (
                      paginatedVehicles.map((vehicle, index) => (
                        <tr key={`${vehicle.id || vehicle.plateNumber || index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="whitespace-nowrap px-4 py-3">{vehicle.company || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3">{vehicle.category || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3">{vehicle.model || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3">{vehicle.plateNumber || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3">{vehicle.yearProduced || "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3">{getFuelText(vehicle.fuelType)}</td>
                          <td className="whitespace-nowrap px-4 py-3">{vehicle.odometer ?? "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={vehicle.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Страница {page} из {pageCount}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Назад
                  </button>
                  <button
                    type="button"
                    disabled={page >= pageCount}
                    onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Вперед
                  </button>
                </div>
              </div>
            </div>
            </section>
          </main>

          <aside className="space-y-6 min-w-0">
            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">GPS / связь</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Статус трекеров</p>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{fmt(displaySummary.online)} онлайн</span>
              </div>
              <div className="mt-6 flex justify-center">
                <HalfGauge online={displaySummary.online} offline={displaySummary.offline} unknown={displaySummary.unknown} total={displaySummary.total} />
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">В движении</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{fmt(displaySummary.moving)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">На стоянке</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{fmt(displaySummary.stopped)}</div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">По топливу</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Состав парка по типам</p>
                </div>
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{fuelData.length} типа</span>
              </div>
              <div className="mt-4 h-56">
                {!isLoading && !hasError ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={fuelData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                        {fuelData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name]} />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ color: isDark ? "#CBD5E1" : "#475569", fontSize: 12 }}>{value}</span>}
                        wrapperStyle={{ paddingTop: 12, display: "flex", justifyContent: "center", flexWrap: "wrap" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Загрузка...</div>
                )}
              </div>
            </section>
          </aside>
        </section>
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
