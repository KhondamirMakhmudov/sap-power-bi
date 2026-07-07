export default function PeriodInfoBar({ beginDate, currentDate, currencyUnit }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-5 py-3">
      <span>
        Начальная дата:{" "}
        <strong className="text-gray-900 dark:text-gray-100">{beginDate}</strong>
      </span>
      <span className="text-gray-400 dark:text-gray-500">→</span>
      <span>
        Отчётная дата:{" "}
        <strong className="text-gray-900 dark:text-gray-100">{currentDate}</strong>
      </span>
      <span className="ml-auto text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
        {currencyUnit}
      </span>
    </div>
  );
}
