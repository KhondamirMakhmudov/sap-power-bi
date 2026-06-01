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
  const outputValue = metrics?.output;
  const outputPlan =
    metrics?.outputPlan ?? metrics?.outputPLan ?? metrics?.outputSecondary;
  const displayOutput =
    outputValue !== undefined && outputValue !== null && outputValue !== ""
      ? outputPlan !== undefined && outputPlan !== null && outputPlan !== ""
        ? `${outputValue} / ${outputPlan}`
        : outputValue
      : "-";
  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${borderClass} flex flex-col h-full`}
    >
      <div className="flex items-start justify-between mb-4 flex-1">
        <div className="flex-1 pr-3">
          <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">
            {name}
          </h3>
          <p className="text-xs text-gray-600 mt-1">{status}</p>
        </div>
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${dotClass}`}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
        <div>
          <p className="text-xs text-gray-600 font-medium">Выработка</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {displayOutput}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Мощность</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {metrics?.power}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">УРУГ</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {metrics?.urug}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-4">{risk}</p>
    </div>
  );
}
