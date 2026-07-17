export const ENTITIES = {
  pr: {
    label: "ЗМЗ",
    labelFull: "Заявки на закупку (PR)",
    columns: [
      { key: "PURCHASEREQUISITION", label: "№ ЗМЗ" },
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
      { key: "Currency", label: "Валюта" },
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
      { key: "PurchaseDocType", label: "Тип документа" },
      { key: "OrderVolume", label: "Объём" },
      { key: "OrderVolumeUnit", label: "Ед." },
      { key: "TotalAmount", label: "Сумма" },
      { key: "DocumentCurrency", label: "Валюта" },
    ],
    filter: { type: "text", field: "PurchaseDocType", placeholder: "Тип документа (напр. ZSRO)" },
  },
  gr: {
    label: "Поступления",
    labelFull: "Поступление товаров (GR)",
    columns: [
      { key: "OrderNumber", label: "№ Документа" },
      { key: "PurchaseOrder", label: "№ ЗнЗ" },
      { key: "PurchaseOrderNumber", label: "Поз. ЗнЗ" },
      { key: "DeliveryDocument", label: "Накладная" },
      { key: "ActualQuantity", label: "Факт. кол-во" },
      { key: "OrderQuantityUnit", label: "Ед." },
      { key: "PostingDate", label: "Дата проводки" },
      { key: "PurchasingHistoryDocumentType", label: "Тип" },
    ],
    filter: { type: "dateRange", field: "PostingDate" },
  },
  invoice: {
    label: "Счета",
    labelFull: "Счета-фактуры",
    columns: [
      { key: "OrderNumber", label: "№ Документа" },
      { key: "PurchaseOrder", label: "№ ЗнЗ" },
      { key: "PurchaseOrderNumber", label: "Поз. ЗнЗ" },
      { key: "PurchasingHistoryDocumentYear", label: "Год" },
      { key: "QuantityInPurchaseOrderUnit", label: "Кол-во" },
      { key: "QuantityUnit", label: "Ед." },
      { key: "SupplierInvoiceItemAmount", label: "Сумма" },
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
