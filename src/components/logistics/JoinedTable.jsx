export default function JoinedTable({ title, groups, rows, rowKey }) {
  const flatColumns = groups.flatMap((g) => g.columns);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {rows.length} записей
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {groups.map((g) => (
                <th
                  key={g.label}
                  colSpan={g.columns.length}
                  className="text-center py-2 px-4 text-xs font-bold uppercase tracking-wide text-white bg-slate-700 border-l border-slate-600 first:border-l-0 whitespace-nowrap"
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              {flatColumns.map((c) => (
                <th
                  key={c.key}
                  className="text-left py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row) : idx}
                className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
              >
                {flatColumns.map((c) => {
                  const value = c.render(row);
                  return (
                    <td
                      key={c.key}
                      className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                    >
                      {value === null || value === undefined || value === "" ? "—" : value}
                    </td>
                  );
                })}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={flatColumns.length}
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
