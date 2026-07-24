// Stat-tile row summarizing the logistics pipeline: one tile per stage
// (document count, categorical identity color) plus a headline money figure.
// Colors are the validated categorical palette, fixed order, slots 1-6.
// Values are the UZS row's own fields, exactly as returned by SAP — no summing
// or other computation across currencies or fields.

function formatNum(v) {
  return new Intl.NumberFormat("ru").format(Number(v) || 0);
}

// Money value only — compact to млн/млрд for readability, same underlying
// number, no aggregation.
function formatMoney(v) {
  const n = Number(v) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)} млрд`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)} млн`;
  return formatNum(n);
}

const ICONS = {
  document: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 13.172 2H6Zm1 6a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z"
    />
  ),
  contract: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm1.5 5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Zm0 3.5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Zm0 3.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z"
    />
  ),
  cart: (
    <path d="M2.25 3a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.115.362.279l2.767 10.36a2.75 2.75 0 0 0 2.665 2.036h7.462a.75.75 0 0 0 0-1.5H9.43a1.25 1.25 0 0 1-1.212-.927l-.263-.983h9.126a2.75 2.75 0 0 0 2.65-2.02l1.29-4.646A1.75 1.75 0 0 0 19.333 5H6.28l-.32-1.196A1.87 1.87 0 0 0 4.156 3H2.25ZM8 20.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  ),
  factory: (
    <path d="M3 21V9.75l6-3v3.5l6-3V21H3Zm3-9.75h1.5v1.5H6v-1.5Zm0 3.75h1.5v1.5H6V15Zm5.25-3.75h1.5v1.5h-1.5v-1.5Zm0 3.75h1.5v1.5h-1.5V15ZM18 21V6.75l3 1.5V21h-3Z" />
  ),
  receipt: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 2.5a.5.5 0 0 1 .724-.447L7 2.7l1.276-.647a.5.5 0 0 1 .448 0L10 2.7l1.276-.647a.5.5 0 0 1 .448 0L13 2.7l1.276-.647a.5.5 0 0 1 .448 0L16 2.7l1.276-.647A.5.5 0 0 1 18 2.5v18.99a.5.5 0 0 1-.724.447L16 21.29l-1.276.648a.5.5 0 0 1-.448 0L13 21.29l-1.276.648a.5.5 0 0 1-.448 0L10 21.29l-1.276.648a.5.5 0 0 1-.448 0L7 21.29l-1.276.648A.5.5 0 0 1 5 21.49V2.5ZM8 8a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8Z"
    />
  ),
  money: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2c1.5 1.8 2 3 2 4.2 0 1-.6 1.8-1.5 1.8S11 7.2 11 6.2c0-.6.2-1.2.5-1.8A7 7 0 1 0 19 11c0-1.6-.5-3-1.3-4.3.8.2 1.6.6 2.3 1.1A9 9 0 1 1 9.6 3.4c.8-.6 1.7-1 2.4-1.4Zm0 6.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm-.75 2h1.5v.62c.64.16 1.13.58 1.36 1.16l-1.2.5c-.13-.32-.42-.53-.91-.53-.5 0-.83.22-.83.55 0 .3.28.44.98.62.98.25 1.86.63 1.86 1.7 0 .8-.55 1.36-1.26 1.55v.63h-1.5v-.6c-.7-.15-1.24-.6-1.46-1.24l1.2-.47c.15.36.5.6.99.6.5 0 .78-.2.78-.5 0-.28-.24-.4-1.03-.62-.99-.27-1.8-.66-1.8-1.72 0-.8.55-1.35 1.32-1.53v-.66Z"
    />
  ),
};

const TILES = [
  { key: "PurchaseRequisition", icon: "document", label: "Потребностей", colorClass: "text-[#2a78d6] dark:text-[#3987e5]", borderClass: "border-b-[#2a78d6] dark:border-b-[#3987e5]" },
  { key: "Contracts", icon: "contract", label: "Контрактов", colorClass: "text-[#eb6834] dark:text-[#d95926]", borderClass: "border-b-[#eb6834] dark:border-b-[#d95926]" },
  { key: "PurchaseOrder", icon: "cart", label: "Заказов на поставку", colorClass: "text-[#1baf7a] dark:text-[#199e70]", borderClass: "border-b-[#1baf7a] dark:border-b-[#199e70]" },
  { key: "InboundDelivery", icon: "factory", label: "Поступлений ТМЦ", colorClass: "text-[#eda100] dark:text-[#c98500]", borderClass: "border-b-[#eda100] dark:border-b-[#c98500]" },
  { key: "Invoice", icon: "receipt", label: "Счёт-фактур", colorClass: "text-[#e87ba4] dark:text-[#d55181]", borderClass: "border-b-[#e87ba4] dark:border-b-[#d55181]" },
];

const MONEY_TILE = {
  key: "TotalInvoiceAmount",
  icon: "money",
  label: "Сумма (UZS)",
  colorClass: "text-[#008300]",
  borderClass: "border-b-[#008300]",
};

function Icon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function Tile({ icon, value, label, colorClass, borderClass }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 border-b-4 ${borderClass}`}
    >
      <Icon name={icon} className={`w-6 h-6 mb-3 ${colorClass}`} />
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
        {label}
      </p>
    </div>
  );
}

export default function TotalsAnalytics({ rows, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        Загрузка аналитики...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!rows || rows.length === 0) return null;

  const uzsRow = rows.find((r) => r.Currency === "UZS") ?? {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {TILES.map(({ key, icon, label, colorClass, borderClass }) => (
        <Tile key={key} icon={icon} value={formatNum(uzsRow[key])} label={label} colorClass={colorClass} borderClass={borderClass} />
      ))}
      <Tile
        icon={MONEY_TILE.icon}
        value={formatMoney(uzsRow[MONEY_TILE.key])}
        label={MONEY_TILE.label}
        colorClass={MONEY_TILE.colorClass}
        borderClass={MONEY_TILE.borderClass}
      />
    </div>
  );
}
