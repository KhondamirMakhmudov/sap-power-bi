// Column groups for the consolidated GeneralBlock entity — one flat row already
// carries PR + Contract + PO + GR + Invoice fields, so no client-side join is
// needed (unlike ALL_GROUPS in logistics.jsx, which reads r.pr / r.po / etc.
// from separately-fetched, manually-joined entities).
//
// Field names below are taken from the one sample row seen in the SAP OData
// response during setup — verify against real data once SAP grants the
// DASHBOARD account access to service group ZSC_GENERAL_BLOCK_O4, and adjust
// any column that doesn't match.
export const GENERAL_BLOCK_GROUPS = [
  {
    label: "Заявка на закупку (ЗМЗ)",
    columns: [
      { key: "prNum", label: "№ ЗМЗ", render: (r) => r.PURCHASEREQUISITION },
      { key: "prItem", label: "Позиция", render: (r) => r.PurchaseRequisitionItem },
      { key: "material", label: "Материал", render: (r) => r.Material },
      { key: "text", label: "Описание", render: (r) => r.Purchaserequisitionitemtext },
      { key: "qty", label: "Кол-во", render: (r) => r.RequestedQuantity },
      { key: "unit", label: "Ед.", render: (r) => r.BaseUnit },
      { key: "plant", label: "Завод", render: (r) => r.Plant },
      { key: "deliveryDate", label: "Дата поставки", render: (r) => r.DeliveryDate },
      { key: "status", label: "Статус", render: (r) => r.PurchaseRequisitionStatus },
      { key: "releaseStrategy", label: "Стратегия согласования", render: (r) => r.ReleaseStrategyDescription },
      { key: "releaseIndicator", label: "Индикатор согласования", render: (r) => r.ReleaseIndicatorDescription },
    ],
  },
  {
    label: "Контракт",
    columns: [
      { key: "contractNum", label: "№ Контракта", render: (r) => r.Contract },
      { key: "contractItem", label: "Позиция", render: (r) => r.ContractItem },
      { key: "price", label: "Сумма", render: (r) => r.PriceAmount },
      { key: "currency", label: "Валюта", render: (r) => r.Currency },
    ],
  },
  {
    label: "Заказ на поставку (PO)",
    columns: [
      { key: "purchasingDocument", label: "№ Документа закупки", render: (r) => r.PurchasingDocument },
      { key: "purchasingDocumentItem", label: "Позиция", render: (r) => r.PurchasingDocumentItem },
      { key: "poNum", label: "№ ЗнЗ", render: (r) => r.PurchaseOrder },
      { key: "poItem", label: "Позиция ЗнЗ", render: (r) => r.PurchaseOrderItem },
      { key: "volume", label: "Объём", render: (r) => r.OrderVolume },
      { key: "volumeUnit", label: "Ед.", render: (r) => r.OrderVolumeUnit },
      { key: "amount", label: "Сумма", render: (r) => r.TotalAmount },
      { key: "poCurrency", label: "Валюта", render: (r) => r.PO_Currency },
      { key: "releaseCode", label: "Код согласования", render: (r) => r.ReleaseCode },
    ],
  },
  {
    label: "Поступления (GR)",
    columns: [
      { key: "inboundPo", label: "№ Вх. заказа", render: (r) => r.InboundPurchaseOrder },
      { key: "inboundPoItem", label: "Позиция", render: (r) => r.InboundPurchaseOrderItem },
      { key: "inboundOrderNumber", label: "№ Документа", render: (r) => r.InboundOrderNumber },
      { key: "deliveryDocument", label: "Накладная", render: (r) => r.DeliveryDocument },
      { key: "deliveryDocumentItem", label: "Позиция", render: (r) => r.DeliveryDocumentItem },
      { key: "actualQty", label: "Факт. кол-во (поставка)", render: (r) => r.ActualDeliveryQuantity },
      { key: "deliveryQtyUnit", label: "Ед.", render: (r) => r.DeliveryQuantityUnit },
      { key: "actualQuantity", label: "Факт. кол-во", render: (r) => r.ActualQuantity },
      { key: "orderQtyUnit", label: "Ед.", render: (r) => r.OrderQuantityUnit },
      { key: "postingDate", label: "Дата проводки", render: (r) => r.PostingDate },
    ],
  },
  {
    label: "Счета-фактуры",
    columns: [
      { key: "invoiceOrderNumber", label: "№ Документа", render: (r) => r.InvoiceOrderNumber },
      { key: "invoiceYear", label: "Год", render: (r) => r.InvoicePurchHistoryDocYear },
      { key: "invoiceQty", label: "Кол-во", render: (r) => r.QuantityInPurchaseOrderUnit },
      { key: "invoiceQtyUnit", label: "Ед.", render: (r) => r.QuantityUnit },
      { key: "invoiceAmount", label: "Сумма", render: (r) => r.SupplierInvoiceItemAmount },
      { key: "invoiceCurrency", label: "Валюта", render: (r) => r.InvoiceDocumentCurrency },
    ],
  },
];

export function buildGeneralBlockFilter({ deliveryRange, postingRange, plant } = {}) {
  const parts = [];
  if (deliveryRange?.from) parts.push(`DeliveryDate ge ${deliveryRange.from}`);
  if (deliveryRange?.to) parts.push(`DeliveryDate le ${deliveryRange.to}`);
  if (postingRange?.from) parts.push(`PostingDate ge ${postingRange.from}`);
  if (postingRange?.to) parts.push(`PostingDate le ${postingRange.to}`);
  if (plant) parts.push(`Plant eq '${plant}'`);
  return parts.length ? parts.join(" and ") : null;
}

export function generalBlockRowKey(row, idx) {
  return [
    row.PURCHASEREQUISITION,
    row.PurchaseRequisitionItem,
    row.PurchaseOrder,
    row.PurchaseOrderItem,
    row.DeliveryDocument,
    row.InvoiceOrderNumber,
    idx,
  ]
    .filter((v) => v !== undefined && v !== null && v !== "")
    .join("-");
}
