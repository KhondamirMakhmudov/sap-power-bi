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

export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const ACCENT_COLORS = {
  blue: {
    badge: "bg-blue-100 text-blue-700",
    border: "border-l-blue-500",
    borderLight: "border-l-blue-300",
  },
  orange: {
    badge: "bg-orange-100 text-orange-700",
    border: "border-l-orange-500",
    borderLight: "border-l-orange-300",
  },
};

export function fmtMln(value) {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("ru", { maximumFractionDigits: 2 }).format(n);
}

export function changeClass(value) {
  const n = Number(value);
  if (isNaN(n) || n === 0) return "text-gray-500";
  return n > 0 ? "text-green-600" : "text-red-600";
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
