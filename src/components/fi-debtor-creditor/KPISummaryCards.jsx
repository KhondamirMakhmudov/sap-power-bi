import { ACCENT_COLORS, fmtMln, changeClass, signedFmt } from "./utils";

const CARDS = [
  { label: "Дебиторы — IES", section: "debtor", totalKey: "total_ies", accent: "blue", light: false },
  { label: "Дебиторы — Филиалы", section: "debtor", totalKey: "total_ies_branches", accent: "blue", light: true },
  { label: "Кредиторы — IES", section: "creditor", totalKey: "total_ies", accent: "orange", light: false },
  { label: "Кредиторы — Филиалы", section: "creditor", totalKey: "total_ies_branches", accent: "orange", light: true },
];

export default function KPISummaryCards({ debtorSection, creditorSection }) {
  const sections = { debtor: debtorSection, creditor: creditorSection };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map(({ label, section, totalKey, accent, light }) => {
        const obj = sections[section]?.totals?.[totalKey];
        const current = obj?.currentBalance ?? 0;
        const opening = obj?.openingBalance ?? 0;
        const change = obj?.change ?? 0;
        const borderColor = light
          ? ACCENT_COLORS[accent].borderLight
          : ACCENT_COLORS[accent].border;

        return (
          <div
            key={label}
            className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor}`}
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {fmtMln(current)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Нач.: {fmtMln(opening)} млн
            </p>
            <p className={`text-sm font-semibold mt-1 ${changeClass(change)}`}>
              {signedFmt(change)} млн
            </p>
          </div>
        );
      })}
    </div>
  );
}
