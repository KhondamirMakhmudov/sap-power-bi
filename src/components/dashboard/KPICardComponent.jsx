export default function KPICard({
  label,
  value,
  plan,
  change,
  showPlanAndChange = true,
  borderColor = "border-l-4 border-gray-200",
  displayUnit = "сум",
  unit,
  decimals = 2,
}) {
  const resolvedUnit = displayUnit || unit || "сум";
  const isNegativeChange = String(change || "").includes("-");
  const parsedNumericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" &&
          value.trim() !== "" &&
          !Number.isNaN(Number(value))
        ? Number(value)
        : null;

  const formatCompactValue = (rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return "-";
    }

    if (typeof rawValue === "string") {
      return rawValue;
    }

    if (typeof rawValue !== "number" || Number.isNaN(rawValue)) {
      return String(rawValue);
    }

    const absValue = Math.abs(rawValue);
    const sign = rawValue < 0 ? "-" : "";

    if (absValue >= 1e12) {
      return `${sign}${(absValue / 1e12).toFixed(decimals)} трлн ${resolvedUnit}`;
    }

    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(decimals)} млрд ${resolvedUnit}`;
    }

    if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(decimals)} млн ${resolvedUnit}`;
    }

    return `${sign}${absValue.toLocaleString("ru-RU")} ${resolvedUnit}`;
  };

  const displayValue = formatCompactValue(value);
  const displayPlan = formatCompactValue(plan);
  const resolvedBorderColor =
    parsedNumericValue === null
      ? borderColor
      : parsedNumericValue < 0
        ? "border-l-4 border-red-600"
        : parsedNumericValue > 0
          ? "border-l-4 border-green-600"
          : "border-l-4 border-gray-400";

  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${resolvedBorderColor}`}
    >
      <p className="text-sm font-medium text-gray-600 min-h-[2.5rem] leading-5">
        {label}
      </p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">{displayValue}</h3>
      {showPlanAndChange && (
        <>
          <p className="text-xs text-gray-500 mt-2">План: {displayPlan}</p>
          <p
            className={`text-xs font-medium mt-2 ${
              isNegativeChange ? "text-red-600" : "text-green-600"
            }`}
          >
            {change}% к плану
          </p>
        </>
      )}
    </div>
  );
}
