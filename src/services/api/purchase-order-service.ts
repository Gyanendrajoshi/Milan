const API_BASE_URL = "http://localhost:5005/api/PurchaseOrders";

export interface PurchaseOrder {
    id: string; // Map from POId
    poNumber: string;
    poDate: string;
    supplierId: string;
    supplierName?: string;
    status: string;
    remarks: string;
    otherCharges: number;
    otherChargeDescription: string;
    grandBasic: number;
    grandTax: number;
    grandTotal: number;
    items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: string; // Map from POItemId
    poId: string;
    itemType: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    rollWidthMM: number;
    rollTotalGSM: number;
    qtyKg: number;
    qtySqMtr: number;
    qtyRunMtr: number;
    qtyUnit: number;
    reqDate: string;
    rate: number;
    rateType: string;
    basicAmount: number;
    taxAmount: number;
    cgstAmt: number;
    sgstAmt: number;
    igstAmt: number;
    totalAmount: number;
    hsnCode: string;
    gstPercent: number;
    remark: string;

    // UI Helpers
    purchaseUnit?: string;
    purchaseRate?: number;
    group?: string;
    uom?: string;
    orderedQty?: number;
}

export interface CreatePurchaseOrderDto {
    poNumber: string;
    poDate: string;
    supplierId: number;
    remarks: string;
    otherCharges: number;
    otherChargeDescription: string;
    grandBasic: number;
    grandTax: number;
    grandTotal: number;
    items: any[];
}

// Helper to map Backend DTO -> Frontend Model
function mapToPO(dto: any): PurchaseOrder {
    return {
        ...dto,
        id: dto.poId?.toString(),
        // Map Items if present
        items: dto.items?.map((i: any) => ({
            ...i,
            id: i.poItemId?.toString(),
            poId: i.poId?.toString(),
            itemId: i.itemId?.toString(),
            // Alias for UI compat
            group: i.itemType,
            uom: i.rateType,
            orderedQty: i.itemType === 'Roll' ? i.qtyKg : i.qtyUnit,
            purchaseUnit: i.rateType,
            purchaseRate: i.rate,
            cgstAmt: i.cgst, // backend uppercase, frontend camel? check DTO
            sgstAmt: i.sgst,
            igstAmt: i.igst
        })) || []
    };
}

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch POs");
    const data = await res.json();
    return data.map(mapToPO);
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch PO");
    const data = await res.json();
    return mapToPO(data);
}

export async function getNextPONumber(): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/next-number`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.number;
}

export async function createPurchaseOrder(data: any): Promise<PurchaseOrder> {
    // Transform Frontend Form Data -> Backend DTO
    const dto: CreatePurchaseOrderDto = {
        poNumber: data.poNumber,
        poDate: data.poDate,
        supplierId: parseInt(data.supplierId),
        remarks: data.remarks,
        otherCharges: data.otherCharges,
        otherChargeDescription: data.otherChargeDescription,
        grandBasic: data.grandBasic,
        grandTax: data.grandTax,
        grandTotal: data.grandTotal,
        items: data.items.map((i: any) => ({
            itemType: i.itemType || i.group,
            itemId: parseInt(i.itemId),
            itemCode: i.itemCode,
            itemName: i.itemName,
            rollWidthMM: i.rollWidthMM,
            rollTotalGSM: i.rollTotalGSM,
            qtyKg: i.qtyKg,
            qtySqMtr: i.qtySqMtr,
            qtyRunMtr: i.qtyRunMtr,
            qtyUnit: i.qtyUnit,
            reqDate: i.reqDate,
            rate: i.rate,
            rateType: i.rateType || i.uom,
            basicAmount: i.basicAmount,
            taxAmount: i.taxAmount,
            cgst: i.cgstAmt,
            sgst: i.sgstAmt,
            igst: i.igstAmt,
            totalAmount: i.totalAmount,
            hsnCode: i.hsnCode,
            gstPercent: i.gstPercent,
            remark: i.remark
        }))
    };

    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to create PO: ${err}`);
    }

    const created = await res.json();
    return mapToPO(created);
}

export async function deletePurchaseOrder(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) {
        throw new Error("Failed to delete PO");
    }
}
