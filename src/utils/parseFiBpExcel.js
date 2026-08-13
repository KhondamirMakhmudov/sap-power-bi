import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const FI_BP_FILE_RE = /^Д-т К-т (\d{2})\.(\d{2})\.(\d{4})\.xlsx$/i;

// Scans public/files/ for "Д-т К-т DD.MM.YYYY.xlsx" snapshots and returns the
// one with the latest date (parsed from the filename, not file mtime) — so
// fi_bp_excel.js always serves whatever was most recently uploaded via the
// admin upload page, with no manual filename edit needed.
export function findLatestFiBpExcelFile() {
  const dir = path.join(process.cwd(), "public", "files");
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return null;
  }

  let latestName = null;
  let latestTime = -Infinity;
  entries.forEach((name) => {
    const match = FI_BP_FILE_RE.exec(name);
    if (!match) return;
    const [, dd, mm, yyyy] = match;
    const time = new Date(`${yyyy}-${mm}-${dd}`).getTime();
    if (time > latestTime) {
      latestTime = time;
      latestName = name;
    }
  });

  return latestName;
}

// Column offsets of the 15 "шу жумладан" category columns, in CATEGORY_KEYS order,
// relative to each debtor/creditor table's category header row.
const CATEGORY_KEYS = [
  "water",
  "electricity",
  "heatDeferred",
  "uztransgaz",
  "uzgaztrade",
  "podzemgaz",
  "hududgaz",
  "mazutFnpz",
  "techPd",
  "coal",
  "customs",
  "creditPercent",
  "security",
  "others",
  "taxPrepayment",
];
const CATEGORY_START_COL = 6; // column G

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function readRow(row) {
  const categories = {};
  CATEGORY_KEYS.forEach((key, i) => {
    categories[key] = num(row[CATEGORY_START_COL + i]);
  });
  return {
    name: String(row[1] ?? "").trim(),
    data: {
      openingBalance: num(row[2]),
      currentBalance: num(row[3]),
      change: num(row[4]),
      ...categories,
    },
  };
}

// The category header text (e.g. "КУМИР (Узбеккумир Шаргункумир)") lives one row
// above the total/opening row, at the same columns as the category values —
// read it verbatim instead of using our own shortened translations, so the page
// matches the file's own wording exactly.
function readCategoryLabels(headerRow) {
  const labels = {};
  CATEGORY_KEYS.forEach((key, i) => {
    labels[key] = String(headerRow[CATEGORY_START_COL + i] ?? "").trim();
  });
  return labels;
}

function buildSection(rows, { headerRow, totalRow, branchesRow, headOfficeRow, itemRows }, isCreditor) {
  const toTotal = ({ openingBalance, currentBalance, change, ...breakdown }) =>
    isCreditor ? { openingBalance, currentBalance, change, breakdown } : { openingBalance, currentBalance, change, ...breakdown };

  const toItem = (r) => {
    const { name, data } = readRow(rows[r]);
    return { companyCode: name, ...data };
  };

  const items = [totalRow, branchesRow, headOfficeRow, ...itemRows].map(toItem);

  return {
    items,
    categoryLabels: readCategoryLabels(rows[headerRow]),
    totals: {
      total_ies: toTotal(readRow(rows[totalRow]).data),
      total_ies_branches: toTotal(readRow(rows[branchesRow]).data),
    },
  };
}

const DATE_RE = /(\d{2}\.\d{2}\.\d{4})/;

// The header row (e.g. "Дебитор қарздорлик       01.01.2026" / "... (тезкор) 22.07.2026")
// carries the opening/current dates for whichever snapshot file this is — pull them
// out directly instead of hardcoding a date that only matched one specific file.
function extractDate(headerCell, fallback) {
  const match = DATE_RE.exec(String(headerCell ?? ""));
  return match ? match[1] : fallback;
}

// Parses the "Д-т К-т <date>.xlsx" debtor/creditor snapshot into the same
// shape the /api/dashboard/fi_bp SAP endpoint returns.
export function parseFiBpExcel(fileName) {
  const filePath = path.join(process.cwd(), "public", "files", fileName);
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });

  const debtor = buildSection(
    rows,
    { headerRow: 3, totalRow: 4, branchesRow: 5, headOfficeRow: 6, itemRows: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    false
  );
  const creditor = buildSection(
    rows,
    { headerRow: 21, totalRow: 22, branchesRow: 23, headOfficeRow: 24, itemRows: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34] },
    true
  );

  const beginDate = extractDate(rows[2]?.[2], "01.01.2026");
  const currentDate = extractDate(rows[2]?.[3], "01.07.2026");

  return {
    beginDate,
    currentDate,
    currencyUnit: "млн.сўм",
    sections: { debtor, creditor },
  };
}
