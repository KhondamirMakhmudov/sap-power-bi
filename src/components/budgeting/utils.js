export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

// Fixed categorical order — never cycled/reused per-slot.
export const CHART_COLORS = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

export const COSTS_LABELS = {
  TOTAL: "Всего затраты",
  AMORT: "Амортизационные отчисления",
  FUEL: "Расход топлива",
  REPAIR: "Ремонтный фонд",
  SALARY: "Заработная плата с ЕСП",
  FINEXP: "Расходы по фин. деятельности",
  OTHER: "Прочие затраты",
};
export const COSTS_BREAKDOWN_KEYS = ["AMORT", "FUEL", "REPAIR", "SALARY", "FINEXP", "OTHER"];

export const REVENUE_LABELS = {
  ELECTRO: "Выручка от реализации электроэнергии",
  HEAT: "Выручка от реализации теплоэнергии",
  OTHER_MAIN: "Прочие доходы от осн. деятельности",
  OTHER: "Прочие доходы",
  FININC: "Доходы от финансовой деятельности",
};
export const REVENUE_BREAKDOWN_KEYS = ["ELECTRO", "HEAT", "OTHER_MAIN", "OTHER", "FININC"];

export const BUSPLAN_LABELS = {
  REVENUE: "Выручка от реализации (с НДС)",
  PROD_COSTS: "Затраты на производство",
  PERIOD_COSTS: "Расходы периода",
  FIN_COSTS: "Расходы по фин. деятельности",
  NET_PROFIT: "Чистая прибыль",
};
export const BUSPLAN_KEYS = ["REVENUE", "PROD_COSTS", "PERIOD_COSTS", "FIN_COSTS", "NET_PROFIT"];

export const FINKPI_LABELS = {
  EBIT: "EBIT",
  EBIT_MARGIN: "Рентабельность EBIT, %",
  EBITDA: "EBITDA",
  EBITDA_MARGIN: "Рентабельность EBITDA, %",
  COST_ELECTRO: "Себестоимость электроэнергии",
  COST_HEAT: "Себестоимость теплоэнергии",
  ROI: "ROI, %",
  ROA: "ROA, %",
};
export const FINKPI_KEYS = [
  "EBIT", "EBIT_MARGIN", "EBITDA", "EBITDA_MARGIN",
  "COST_ELECTRO", "COST_HEAT", "ROI", "ROA",
];
export const FINKPI_PERCENT_KEYS = new Set(["EBIT_MARGIN", "EBITDA_MARGIN", "ROI", "ROA"]);

export const BS_LABELS = {
  BS_ASSETS: "Баланс. Итого Активы",
  BS_LIAB: "Баланс. Итого Пассивы",
};

export function fmtSum(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  const n = Number(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)} трлн сум`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)} млрд сум`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)} млн сум`;
  return `${sign}${new Intl.NumberFormat("ru").format(abs)} сум`;
}

export function fmtPercent(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function changeClass(value) {
  const n = Number(value);
  if (isNaN(n) || n === 0) return "text-gray-500 dark:text-gray-400";
  return n > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
}

// Composite indicators arrive as multiple rows sharing the same `key`
// (different `browid`/`bsitem`) — sum amount per key on the client, as the docs specify.
export function sumByKey(rows) {
  const map = new Map();
  (rows || []).forEach((r) => {
    const existing = map.get(r.key);
    if (existing) {
      existing.amount += Number(r.amount) || 0;
    } else {
      map.set(r.key, {
        key: r.key,
        name: r.name,
        amount: Number(r.amount) || 0,
        currency: r.currency,
      });
    }
  });
  return map;
}

// Same, but split plan (vtype 10) vs fact (vtype 20) per key.
export function sumByKeyVtype(rows) {
  const map = new Map();
  (rows || []).forEach((r) => {
    let entry = map.get(r.key);
    if (!entry) {
      entry = { key: r.key, name: r.name, plan: 0, fact: 0 };
      map.set(r.key, entry);
    }
    const amt = Number(r.amount) || 0;
    if (Number(r.vtype) === 10) entry.plan += amt;
    else if (Number(r.vtype) === 20) entry.fact += amt;
  });
  return map;
}

export function executionPct(plan, fact) {
  if (!plan) return null;
  return (fact / plan) * 100;
}
