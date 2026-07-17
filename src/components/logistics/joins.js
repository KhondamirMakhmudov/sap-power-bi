// PurchaseOrder (SAP OData) exposes no field back to PurchaseRequisition/Contract
// (verified against its full $metadata — only PurchaseOrder, PurchaseOrderItem,
// PurchaseDocType, OrderVolume, OrderVolumeUnit, TotalAmount, DocumentCurrency,
// frget, ReleaseCode). So the procurement chain splits into two joinable halves:
// PR<->Contract (by PurchaseRequisition/Item) and PO<->GR<->Invoice (by
// PurchaseOrder/Item) — there is no data-backed way to join across that gap.

export function joinPrContract(prRows, contractRows) {
  prRows = prRows || [];
  contractRows = contractRows || [];
  const byKey = new Map();
  contractRows.forEach((c) => {
    const key = `${c.PurchaseRequisition}__${c.PurchaseRequisitionItem}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(c);
  });

  return prRows.map((pr) => {
    const key = `${pr.PURCHASEREQUISITION}__${pr.PurchaseRequisitionItem}`;
    const matches = byKey.get(key) || [];
    return { pr, contract: matches[0] || null, contractCount: matches.length };
  });
}

export function joinPoGrInvoice(poRows, grRows, invoiceRows) {
  poRows = poRows || [];
  grRows = grRows || [];
  invoiceRows = invoiceRows || [];
  const grByPo = new Map();
  grRows.forEach((g) => {
    const key = `${g.PurchaseOrder}__${g.PurchaseOrderNumber}`;
    if (!grByPo.has(key)) grByPo.set(key, []);
    grByPo.get(key).push(g);
  });

  const invByPo = new Map();
  invoiceRows.forEach((i) => {
    const key = `${i.PurchaseOrder}__${i.PurchaseOrderNumber}`;
    if (!invByPo.has(key)) invByPo.set(key, []);
    invByPo.get(key).push(i);
  });

  return poRows.map((po) => {
    const key = `${po.PurchaseOrder}__${po.PurchaseOrderItem}`;
    const grs = grByPo.get(key) || [];
    const invs = invByPo.get(key) || [];
    return {
      po,
      grCount: grs.length,
      grQtySum: grs.reduce((s, g) => s + (Number(g.ActualQuantity) || 0), 0),
      grLastPosting: grs.reduce(
        (max, g) => (!max || g.PostingDate > max ? g.PostingDate : max),
        null,
      ),
      invCount: invs.length,
      invAmountSum: invs.reduce((s, i) => s + (Number(i.SupplierInvoiceItemAmount) || 0), 0),
      invCurrency: invs[0]?.DocumentCurrency ?? null,
    };
  });
}
