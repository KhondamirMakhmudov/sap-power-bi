import { ENTITIES } from "./config";

export default function EntityTable({ entityKey, data }) {
  const { columns, labelFull } = ENTITIES[entityKey];
  const items = data?.value ?? [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100">{labelFull}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">OData V4 — SAP MM</p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {items.length} записей
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                  >
                    {row[col.key] !== null && row[col.key] !== undefined
                      ? String(row[col.key])
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  Нет данных — нажмите «Применить» для загрузки
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
