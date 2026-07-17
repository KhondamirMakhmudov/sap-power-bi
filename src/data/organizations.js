// Active org codes minus 1060 (Талимарджанская ТЭС) and 1140 (Ангренская ТЭС).
export const TES_BRANCHES_GROUP = ["1010", "1020", "1070", "1080", "1090", "1100"];

export const ORG_OPTIONS = [
  { value: "", label: "Все организации" },
  { value: "TES_BRANCHES", label: "АО ТЭС и филиалы" },
  { value: "1010", label: "1010 — ТЭС ЦА (Ташкент)" },
  { value: "1020", label: "1020 — Филиал Сырдарьинская ТЭС (Ширин)" },
  // { value: "1030", label: "1030 — АО «Ташкентская ТЭС» (Ташкент)" },
  // { value: "1040", label: "1040 — АО «Навоийская ТЭС» (Навои)" },
  // { value: "1050", label: "1050 — АО «Тахиаташская ТЭС» (Тахиаташ)" },
  { value: "1060", label: "1060 — АО «Талимарджанская ТЭС» (Талимарджан)" },
  { value: "1070", label: "1070 — Филиал Туракурганская ТЭС (Туракурган)" },
  { value: "1080", label: "1080 — Филиал Мубарекская ТЭЦ (Мубарек)" },
  { value: "1090", label: "1090 — Филиал Ферганская ТЭЦ (Фергана)" },
  { value: "1100", label: "1100 — Филиал Ташкентская ТЭЦ (Ташкент)" },
  // { value: "1110", label: "1110 — ООО «Узэнергосозлаш»" },
  // { value: "1120", label: "1120 — АО «Узбекэнерготаъмир»" },
  // { value: "1130", label: "1130 — АО «Узэнерготаъминлаш» (Ташкент)" },
  { value: "1140", label: "1140 — АО «Ангренская ТЭС»" },
  // { value: "1150", label: "1150 — ООО «Ташкентская тепловая» (Ташкент)" },
];

export const ALL_ORG_CODES = ORG_OPTIONS.filter((o) => o.value !== "").map((o) => o.value);

// `selected` is an array of ORG_OPTIONS values (may include the "TES_BRANCHES"
// group shortcut alongside individual codes) — expand + dedupe into plain codes.
export function resolveCompCodes(selected) {
  if (!selected || selected.length === 0) return null;
  const codes = new Set();
  selected.forEach((v) => {
    if (v === "TES_BRANCHES") TES_BRANCHES_GROUP.forEach((c) => codes.add(c));
    else if (v) codes.add(v);
  });
  return codes.size > 0 ? Array.from(codes) : null;
}

// Plain plant codes only — for filters (like SAP `Plant`) that don't
// understand the "Все организации"/"TES_BRANCHES" shortcuts.
export const PLANT_OPTIONS = [
  { value: "", label: "Все заводы" },
  ...ORG_OPTIONS.filter((o) => o.value !== "" && o.value !== "TES_BRANCHES"),
];
