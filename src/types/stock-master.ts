export interface StockItem {
    id: string;

    // Linkages
    grnId?: string;
    poId?: string;

    // Item Data
    itemCode: string; // Can be Roll ID or Material ID
    itemName: string;
    category: "Roll" | "Material" | "Ink" | "Consumable";

    // Quantities (Current Stock)
    quantity: number;
    uom: string; // Primary Unit

    // Roll Specifics
    runningMtr?: number;
    sqMtr?: number;
    weightKg?: number;
    widthMM?: number;
    gsm?: number;

    // Batch & Traceability
    batchNo: string;
    location?: string;
    status: "In-Stock" | "Reserved" | "Consumed" | "Expired";

    receivedDate: string;
    expiryDate?: string;

    // QR Code (for slitting outputs)
    qrCodeData?: string;
}
