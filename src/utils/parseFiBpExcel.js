import path from "path";
import XLSX from "xlsx";

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

function buildSection(rows, { totalRow, branchesRow, headOfficeRow, itemRows }, isCreditor) {
  const toTotal = ({ openingBalance, currentBalance, change, ...breakdown }) =>
    isCreditor ? { openingBalance, currentBalance, change, breakdown } : { openingBalance, currentBalance, change, ...breakdown };

  const toItem = (r) => {
    const { name, data } = readRow(rows[r]);
    return { companyCode: name, ...data };
  };

  const items = [headOfficeRow, ...itemRows].map(toItem);

  return {
    items,
    totals: {
      total_ies: toTotal(readRow(rows[totalRow]).data),
      total_ies_branches: toTotal(readRow(rows[branchesRow]).data),
    },
  };
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
    { totalRow: 4, branchesRow: 5, headOfficeRow: 6, itemRows: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    false
  );
  const creditor = buildSection(
    rows,
    { totalRow: 22, branchesRow: 23, headOfficeRow: 24, itemRows: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34] },
    true
  );

  return {
    beginDate: "01.01.2026",
    currentDate: "01.07.2026",
    currencyUnit: "млн.сўм",
    sections: { debtor, creditor },
  };
}
