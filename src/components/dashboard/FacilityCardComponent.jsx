// Same compact "трлн/млрд/млн" convention used by KPICardComponent/finances.jsx,
// generalized to any unit (сум, кВтч, Гкал, ...).
function formatQty(value, unit = "сум") {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)} трлн ${unit}`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)} млрд ${unit}`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)} млн ${unit}`;
  return `${sign}${new Intl.NumberFormat("ru").format(abs)} ${unit}`;
}

const METRIC_TILES = [
  {
    key: "revenue",
    planKey: "revenuePlan",
    label: "Выручка",
    unit: "сум",
    description: "Доход от основной деятельности.",
  },
  {
    key: "ebit",
    planKey: "ebitPlan",
    label: "EBIT",
    unit: "сум",
    description: "Прибыль до процентов и налогов.",
  },
  {
    key: "ebitda",
    planKey: "ebitdaPlan",
    label: "EBITDA",
    unit: "сум",
    description: "Прибыль до процентов, налогов и амортизации.",
  },
  {
    key: "netProfit",
    planKey: "netProfitPlan",
    label: "Чистая прибыль",
    unit: "сум",
    description: "Финансовый результат после всех расходов.",
  },
  {
    key: "electricOutput",
    planKey: "electricOutputPlan",
    label: "Реализация электроэнергии",
    unit: "кВтч",
    description: "Количество реализованной электроэнергии.",
  },
  {
    key: "heatOutput",
    planKey: "heatOutputPlan",
    label: "Реализация теплоэнергии",
    unit: "Гкал",
    description: "Количество реализованной теплоэнергии.",
  },
];

export default function FacilityCardComponent({
  name,
  status,
  statusDot = "orange",
  metrics,
  risk,
}) {
  const borderClass =
    statusDot === "green"
      ? "border-l-green-600"
      : statusDot === "red"
        ? "border-l-red-600"
        : "border-l-orange-500";
  const dotClass =
    statusDot === "green"
      ? "bg-green-600"
      : statusDot === "red"
        ? "bg-red-600"
        : "bg-orange-500";

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 ${borderClass} flex flex-col h-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-3">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
            {name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{status}</p>
        </div>
        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${dotClass}`} />
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-gray-700 flex-1">
        {METRIC_TILES.map((tile) => (
          <div key={tile.key}>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{tile.label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
              {formatQty(metrics?.[tile.key], tile.unit)}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              План: {formatQty(metrics?.[tile.planKey], tile.unit)}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
              {tile.description}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">{risk}</p>
    </div>
  );
}
