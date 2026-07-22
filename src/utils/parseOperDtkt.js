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

// operdtkt "Gruppa" labels -> our CATEGORY_KEYS. This endpoint doesn't break out
// uztransgaz / techPd / customs / creditPercent separately, so those stay 0.
const GRUPPA_TO_KEY = {
  Сув: "water",
  "Электр энергия": "electricity",
  "Иссиқлик энергияси": "heatDeferred",
  Узгазтрэйд: "uzgaztrade",
  Подземгаз: "podzemgaz",
  Худудгазтаъминот: "hududgaz",
  "Мазут ФНПЗ": "mazutFnpz",
  "Мазут БНПЗ": "mazutFnpz",
  Кумир: "coal",
  "Қўриқлаш хизмати": "security",
  Бошқалар: "others",
  Солиқ: "taxPrepayment",
};

const HEAD_OFFICE_BE = "1010";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Splits the flat operdtkt rows into contiguous runs sharing the same (BE, DK) —
// each run is one company's Дебитор or Кредитор block (totals + category rows).
function groupBlocks(rows) {
  const blocks = [];
  let current = null;
  rows.forEach((r) => {
    if (!current || current.be !== r.BE || current.dk !== r.DK) {
      current = { be: r.BE, dk: r.DK, rows: [] };
      blocks.push(current);
    }
    current.rows.push(r);
  });
  return blocks;
}

// Pairs each Дебитор block with the Кредитор block that follows it into one entity.
function pairEntities(blocks) {
  const entities = [];
  let pendingDebtor = null;
  blocks.forEach((block) => {
    if (block.dk === "Дебитор") {
      if (pendingDebtor) entities.push({ be: pendingDebtor.be, debtorRows: pendingDebtor.rows, creditorRows: null });
      pendingDebtor = block;
    } else if (block.dk === "Кредитор") {
      entities.push({ be: block.be, debtorRows: pendingDebtor?.rows ?? null, creditorRows: block.rows });
      pendingDebtor = null;
    }
  });
  if (pendingDebtor) entities.push({ be: pendingDebtor.be, debtorRows: pendingDebtor.rows, creditorRows: null });
  return entities;
}

function buildBalance(rows, totalGruppa) {
  const obj = { openingBalance: 0, currentBalance: 0 };
  CATEGORY_KEYS.forEach((k) => { obj[k] = 0; });
  (rows || []).forEach(({ Gruppa, Summa }) => {
    if (Gruppa === totalGruppa) obj.currentBalance = num(Summa);
    else if (Gruppa === "НаНачалоГода") obj.openingBalance = num(Summa);
    else {
      const key = GRUPPA_TO_KEY[Gruppa];
      if (key) obj[key] = num(Summa);
    }
  });
  obj.change = obj.currentBalance - obj.openingBalance;
  return obj;
}

function sumItems(items) {
  const total = { openingBalance: 0, currentBalance: 0, change: 0 };
  CATEGORY_KEYS.forEach((k) => { total[k] = 0; });
  items.forEach((item) => {
    total.openingBalance += item.openingBalance;
    total.currentBalance += item.currentBalance;
    total.change += item.change;
    CATEGORY_KEYS.forEach((k) => { total[k] += item[k] || 0; });
  });
  return total;
}

function toTotalShape(total, isCreditor) {
  if (!isCreditor) return total;
  const { openingBalance, currentBalance, change, ...breakdown } = total;
  return { openingBalance, currentBalance, change, breakdown };
}

function buildTotals(items, isCreditor) {
  const total_ies = sumItems(items);
  const branchItems = items.filter((i) => i.rawCompanyCode !== HEAD_OFFICE_BE);
  const total_ies_branches = sumItems(branchItems);
  return {
    total_ies: toTotalShape(total_ies, isCreditor),
    total_ies_branches: toTotalShape(total_ies_branches, isCreditor),
  };
}

function toDisplayDate(isoDate) {
  const [y, m, d] = String(isoDate).split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}.${m}.${y}`;
}

// Parses the operdtkt {data: [{BE, DK, Gruppa, Summa}, ...]} response into the same
// shape used elsewhere on the page (sections.debtor/creditor -> items + totals).
export function parseOperDtkt(json, dateTo) {
  const rows = json?.data || [];
  const blocks = groupBlocks(rows);
  const entities = pairEntities(blocks);

  const seenCodes = new Map();
  const uniqueCode = (be) => {
    const key = be || "—";
    const count = (seenCodes.get(key) || 0) + 1;
    seenCodes.set(key, count);
    return count === 1 ? key : `${key} #${count}`;
  };

  const debtorItems = [];
  const creditorItems = [];
  entities.forEach(({ be, debtorRows, creditorRows }) => {
    const displayCode = uniqueCode(be);
    debtorItems.push({ companyCode: displayCode, rawCompanyCode: be, ...buildBalance(debtorRows, "ИтогоДебитор") });
    creditorItems.push({ companyCode: displayCode, rawCompanyCode: be, ...buildBalance(creditorRows, "ИтогоКебитор") });
  });

  const year = String(dateTo).split("-")[0];

  return {
    beginDate: year ? `01.01.${year}` : null,
    currentDate: toDisplayDate(dateTo),
    currencyUnit: "млн.сўм",
    sections: {
      debtor: { items: debtorItems, totals: buildTotals(debtorItems, false) },
      creditor: { items: creditorItems, totals: buildTotals(creditorItems, true) },
    },
  };
}
