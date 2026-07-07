import {
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  ACCENT_COLORS,
  fmtMln,
  changeClass,
  signedFmt,
  getCats,
} from "./utils";

const TOTAL_ROWS = [
  { key: "total_ies", label: "IES АЖ — Итого" },
  { key: "total_ies_branches", label: "IES АЖ Филиалы — Итого" },
];

export default function TotalsCards({ activeSection, activeTab }) {
  const isCreditor = activeTab === "creditor";
  const accent = isCreditor ? "orange" : "blue";
  const badgeClass = ACCENT_COLORS[accent].badge;
  const roleLabel = isCreditor ? "Кредитор" : "Дебитор";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TOTAL_ROWS.map(({ key, label }) => {
        const total = activeSection.totals?.[key];
        const cats = getCats(total, isCreditor);
        const nonZeroCats = CATEGORY_KEYS.filter(
          (k) => cats[k] !== undefined && Number(cats[k]) !== 0
        );

        return (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{label}</h3>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${badgeClass}`}>
                {roleLabel}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Нач. баланс", val: total?.openingBalance, signed: false },
                { label: "Тек. баланс", val: total?.currentBalance, signed: false },
                { label: "Изменение", val: total?.change, signed: true },
              ].map(({ label: l, val, signed }) => (
                <div key={l}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{l}</p>
                  <p
                    className={`font-bold mt-0.5 ${
                      signed ? changeClass(val) : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {signed ? signedFmt(val) : fmtMln(val)}
                  </p>
                </div>
              ))}
            </div>

            {nonZeroCats.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700/60 pt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                {nonZeroCats.map((k) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{CATEGORY_LABELS[k]}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {fmtMln(cats[k])}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
