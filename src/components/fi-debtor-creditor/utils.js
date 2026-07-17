export const CATEGORY_LABELS = {
  water: "Вода",
  electricity: "Электроэнергия",
  heatDeferred: "Теплоэн. (отсрочка)",
  uztransgaz: "Узтрансгаз",
  uzgaztrade: "Узгазтрейд",
  podzemgaz: "Подземгаз",
  hududgaz: "Худудгаз",
  mazutFnpz: "Мазут ФНПЗ",
  techPd: "Техн. ПД",
  coal: "Уголь",
  customs: "Таможня",
  creditPercent: "Кредит %",
  security: "Охрана",
  others: "Прочие",
  taxPrepayment: "Авансы (налог)",
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

export const COMPANY_NAMES = {
  "1010": "1010 — ТЭС ЦА (Ташкент)",
  "1020": "1020 — Филиал Сырдарьинская ТЭС (Ширин)",
  "1030": "1030 — АО «Ташкентская ТЭС» (Ташкент)",
  "1040": "1040 — АО «Навоийская ТЭС» (Навои)",
  "1050": "1050 — АО «Тахиаташская ТЭС» (Тахиаташ)",
  "1060": "1060 — АО «Талимарджанская ТЭС» (Талимарджан)",
  "1070": "1070 — Филиал Туракурганская ТЭС (Туракурган)",
  "1080": "1080 — Филиал Мубарекская ТЭЦ (Мубарек)",
  "1090": "1090 — Филиал Ферганская ТЭЦ (Фергана)",
  "1100": "1100 — Филиал Ташкентская ТЭЦ (Ташкент)",
  "1110": "1110 — ООО «Узэнергосозлаш»",
  "1120": "1120 — АО «Узбекэнерготаъмир»",
  "1130": "1130 — АО «Узэнерготаъминлаш» (Ташкент)",
  "1140": "1140 — АО «Ангренская ТЭС»",
  "1150": "1150 — ООО «Ташкентская тепловая» (Ташкент)",
};

// Groups flat per-counterparty items into one summed row per company (companyCode).
// By default rows are sorted alphabetically by companyCode; pass preserveOrder to
// keep the original item order instead (e.g. a static source like an Excel snapshot).
export function groupItemsByCompany(items, { preserveOrder = false } = {}) {
  const map = new Map();

  (items || []).forEach((item) => {
    const code = item.companyCode ?? "—";
    let row = map.get(code);
    if (!row) {
      row = {
        companyCode: code,
        openingBalance: 0,
        currentBalance: 0,
        change: 0,
      };
      CATEGORY_KEYS.forEach((k) => {
        row[k] = 0;
      });
      map.set(code, row);
    }

    row.openingBalance += Number(item.openingBalance) || 0;
    row.currentBalance += Number(item.currentBalance) || 0;
    row.change += Number(item.change) || 0;
    CATEGORY_KEYS.forEach((k) => {
      row[k] += Number(item[k]) || 0;
    });
  });

  const rows = Array.from(map.values());
  return preserveOrder
    ? rows
    : rows.sort((a, b) => String(a.companyCode).localeCompare(String(b.companyCode)));
}

export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const ACCENT_COLORS = {
  blue: {
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    border: "border-l-blue-500",
    borderLight: "border-l-blue-300",
  },
  orange: {
    badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
    border: "border-l-orange-500",
    borderLight: "border-l-orange-300",
  },
};

export function fmtMln(value) {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("ru", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
}

export function changeClass(value) {
  const n = Number(value);
  if (isNaN(n) || n === 0) return "text-gray-500 dark:text-gray-400";
  return n > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
}

export function signedFmt(value) {
  const n = Number(value);
  if (isNaN(n) || n === 0) return fmtMln(value);
  return (n > 0 ? "+" : "") + fmtMln(value);
}

// HTML date input (YYYY-MM-DD) → API format (DD.MM.YYYY)
export function toApiDate(htmlDate) {
  if (!htmlDate) return "";
  const [y, m, d] = htmlDate.split("-");
  return `${d}.${m}.${y}`;
}

// Creditor totals nest categories inside .breakdown; debtor has them directly
export function getCats(obj, isCreditor) {
  if (!obj) return {};
  return isCreditor && obj.breakdown ? obj.breakdown : obj;
}
