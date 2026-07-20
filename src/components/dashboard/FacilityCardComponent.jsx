// Same compact "трлн/млрд/млн" convention used by KPICardComponent/finances.jsx,
// generalized to any unit (сум, кВтч, Гкал, ...).
function formatQty(value, unit = "сум") {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(3)} трлн ${unit}`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(3)} млрд ${unit}`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(3)} млн ${unit}`;
  return `${sign}${new Intl.NumberFormat("ru").format(abs)} ${unit}`;
}

// Percent-deviation-from-plan (SAP's "PF_" fields) rounded to 1 decimal, or
// null when there's nothing to show (missing/non-numeric).
function formatPF(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

const METRIC_TILES = [
  { key: "revenue", planKey: "revenuePlan", pfKey: "revenuePF", label: "Выручка", unit: "сум" },
  { key: "ebit", planKey: "ebitPlan", pfKey: "ebitPF", label: "EBIT", unit: "сум" },
  { key: "ebitda", planKey: "ebitdaPlan", pfKey: "ebitdaPF", label: "EBITDA", unit: "сум" },
  {
    key: "netProfit",
    planKey: "netProfitPlan",
    pfKey: "netProfitPF",
    label: "Чистая прибыль",
    unit: "сум",
  },
  {
    key: "electricOutput",
    planKey: "electricOutputPlan",
    pfKey: "electricOutputPF",
    label: "Реализация электроэнергии",
    unit: "кВтч",
  },
  {
    key: "heatOutput",
    planKey: "heatOutputPlan",
    pfKey: "heatOutputPF",
    label: "Реализация теплоэнергии",
    unit: "Гкал",
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
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {status}
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${dotClass}`} />
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-gray-700 flex-1">
        {METRIC_TILES.map((tile) => {
          const pf = formatPF(metrics?.[tile.pfKey]);
          return (
            <div key={tile.key}>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {tile.label}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatQty(metrics?.[tile.key], tile.unit)}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                План: {formatQty(metrics?.[tile.planKey], tile.unit)}
              </p>
              {pf !== null && (
                <p
                  className={`text-[11px] font-semibold mt-0.5 ${
                    pf < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {pf >= 0 ? "+" : ""}
                  {pf.toFixed(1)}% к плану
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">{risk}</p>
    </div>
  );
}
