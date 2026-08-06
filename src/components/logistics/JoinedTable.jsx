"use client";

import { useEffect, useRef } from "react";

// The table can be both very wide and very tall — a single overflow-x-auto
// div puts the horizontal scrollbar at the *bottom* of the table, which for a
// tall table means scrolling all the way down just to pan sideways. This
// adds a slim "shadow" scrollbar pinned above the table that mirrors
// horizontal scroll; the table's own horizontal scrollbar is hidden (via
// .hide-x-scrollbar, WebKit-only — see globals.css) so it isn't duplicated,
// while its vertical scrollbar stays untouched on the right. (Splitting the
// two axes across nested elements was tried and reverted — pairing
// overflow-x: auto with overflow-y: visible on the same element forces the
// "visible" axis to computed 'auto' per the CSS spec, which broke sticky
// header positioning.)
function useSyncedScroll() {
  const topRef = useRef(null);
  const bodyRef = useRef(null);
  const spacerRef = useRef(null);
  const syncing = useRef(false);

  useEffect(() => {
    const table = bodyRef.current?.querySelector("table");
    const spacer = spacerRef.current;
    if (!table || !spacer) return;

    const syncWidth = () => {
      spacer.style.width = `${table.scrollWidth}px`;
    };
    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(table);
    return () => observer.disconnect();
  });

  const handleTopScroll = () => {
    if (syncing.current) {
      syncing.current = false;
      return;
    }
    syncing.current = true;
    bodyRef.current.scrollLeft = topRef.current.scrollLeft;
  };

  const handleBodyScroll = () => {
    if (syncing.current) {
      syncing.current = false;
      return;
    }
    syncing.current = true;
    topRef.current.scrollLeft = bodyRef.current.scrollLeft;
  };

  return { topRef, bodyRef, spacerRef, handleTopScroll, handleBodyScroll };
}

export default function JoinedTable({ title, groups, rows, rowKey }) {
  const flatColumns = groups.flatMap((g) => g.columns);
  const { topRef, bodyRef, spacerRef, handleTopScroll, handleBodyScroll } = useSyncedScroll();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {rows.length} записей
        </span>
      </div>

      <div ref={topRef} onScroll={handleTopScroll} className="overflow-x-auto overflow-y-hidden" style={{ height: 14 }}>
        <div ref={spacerRef} style={{ height: 1 }} />
      </div>

      <div
        ref={bodyRef}
        onScroll={handleBodyScroll}
        className="hide-x-scrollbar overflow-x-auto overflow-y-auto max-h-150"
      >
        <table className="w-full">
          <thead>
            <tr>
              {groups.map((g) => (
                <th
                  key={g.label}
                  colSpan={g.columns.length}
                  className="sticky top-0 z-10 text-center py-2 px-4 text-xs font-bold uppercase tracking-wide text-white bg-slate-700 border-l border-slate-600 first:border-l-0 whitespace-nowrap"
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              {flatColumns.map((c) => (
                <th
                  key={c.key}
                  className="sticky top-7.25 z-10 bg-gray-50 dark:bg-gray-900 text-left py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
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
