export interface StockItem {
    id: string; // Unique ID (GRN Item ID)
    itemCode: string;
    itemName: string;

    // Variant Specs
    size: string; // e.g. "900 mm" or "-"
    gsm: number; // e.g. 12 or 0

    // Units
    uom: string; // Base Unit

    // Quantities
    stockQty: number; // Current Stock
    initialQty: number; // Received Qty

    // Tracking
    autoBatchNo: string;
    supplierBatchNo?: string;

    // Dates
    receiptDate: string; // ISO String
    expiryDate?: string; // ISO String
    agingDays: number; // Calculated

    // Status
    status: 'In Stock' | 'Low Stock' | 'Expired';
}
