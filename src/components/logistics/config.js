export const ENTITIES = {
  pr: {
    label: "ЗМЗ",
    labelFull: "Заявки на закупку (PR)",
    columns: [
      { key: "PurchaseRequisition", label: "№ ЗМЗ" },
      { key: "PurchaseRequisitionItem", label: "Позиция" },
      { key: "Material", label: "Материал" },
      { key: "Purchaserequisitionitemtext", label: "Описание" },
      { key: "RequestedQuantity", label: "Кол-во" },
      { key: "BaseUnit", label: "Ед." },
      { key: "RequisitionerName", label: "Заявитель" },
      { key: "CreationDate", label: "Дата создания" },
    ],
    filter: { type: "dateRange", field: "CreationDate" },
  },
  contract: {
    label: "Контракты",
    labelFull: "Контракты / Рамочные соглашения",
    columns: [
      { key: "Contract", label: "№ Контракта" },
      { key: "ContractItem", label: "Позиция" },
      { key: "PriceAmount", label: "Сумма" },
      { key: "DocumentCurrency", label: "Валюта" },
      { key: "PurchaseRequisition", label: "№ ЗМЗ" },
      { key: "PurchaseRequisitionItem", label: "Поз. ЗМЗ" },
    ],
    filter: { type: "text", field: "PurchaseRequisition", placeholder: "Номер ЗМЗ" },
  },
  po: {
    label: "Заказы",
    labelFull: "Заказы на закупку (PO)",
    columns: [
      { key: "PurchaseOrder", label: "№ ЗнЗ" },
      { key: "PurchaseOrderItem", label: "Позиция" },
      { key: "PositionType", label: "Тип позиции" },
      { key: "OrderVolume", label: "Объём" },
      { key: "OrderVolumeUnit", label: "Ед." },
      { key: "AmountWihtoutTax", label: "Сумма (без НДС)" },
      { key: "DocumentCurrency", label: "Валюта" },
    ],
    filter: { type: "text", field: "PositionType", placeholder: "Тип позиции (напр. NORM)" },
  },
  gr: {
    label: "Поступления",
    labelFull: "Поступление товаров (GR)",
    columns: [
      { key: "OrderNumber", label: "№ Документа" },
      { key: "PurchaseOrder", label: "№ ЗнЗ" },
      { key: "PurchaseOrderItem", label: "Позиция" },
      { key: "DeliveryDocumentBySupplier", label: "Накладная" },
      { key: "ActualQuantity", label: "Факт. кол-во" },
      { key: "PurchaseOrderQuantityUnit", label: "Ед." },
      { key: "PostingDate", label: "Дата проводки" },
      { key: "PurchasingHistoryDocumentType", label: "Тип" },
    ],
    filter: { type: "dateRange", field: "PostingDate" },
  },
  invoice: {
    label: "Счета",
    labelFull: "Счета-фактуры",
    columns: [
      { key: "PurchasingHistoryDocument", label: "№ Счёта" },
      { key: "PurchasingHistoryDocumentYear", label: "Год" },
      { key: "ReferenceDocumentNumber", label: "Реф. документ" },
      { key: "PurchaseOrdQty", label: "Кол-во" },
      { key: "PurchaseOrdQtyUnit", label: "Ед." },
      { key: "NetValueWithoutTax", label: "Сумма (без НДС)" },
      { key: "DocumentCurrency", label: "Валюта" },
    ],
    filter: { type: "year", field: "PurchasingHistoryDocumentYear" },
  },
};

export const ENTITY_KEYS = Object.keys(ENTITIES);

export const TOP_OPTIONS = [
  { value: "20", label: "20 записей" },
  { value: "50", label: "50 записей" },
  { value: "100", label: "100 записей" },
  { value: "200", label: "200 записей" },
];

export function buildODataFilter(entityKey, filter) {
  const config = ENTITIES[entityKey]?.filter;
  if (!config) return null;

  if (config.type === "dateRange") {
    const parts = [];
    if (filter.from) parts.push(`${config.field} ge ${filter.from}`);
    if (filter.to) parts.push(`${config.field} le ${filter.to}`);
    return parts.length ? parts.join(" and ") : null;
  }

  if (config.type === "text" && filter.value?.trim()) {
    return `${config.field} eq '${filter.value.trim()}'`;
  }

  if (config.type === "year" && filter.year) {
    return `${config.field} eq '${filter.year}'`;
  }

  return null;
}
