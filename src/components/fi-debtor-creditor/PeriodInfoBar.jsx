export default function PeriodInfoBar({ beginDate, currentDate, currencyUnit }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-5 py-3">
      <span>
        Начальная дата:{" "}
        <strong className="text-gray-900">{beginDate}</strong>
      </span>
      <span className="text-gray-400">→</span>
      <span>
        Отчётная дата:{" "}
        <strong className="text-gray-900">{currentDate}</strong>
      </span>
      <span className="ml-auto text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
        {currencyUnit}
      </span>
    </div>
  );
}
