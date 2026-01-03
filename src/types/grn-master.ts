export interface GRNItem {
    id: string;
    poId: string; // Link to PO
    poItemId: string; // Link to specific PO Item
    itemCode: string;
    itemName: string;

    // Optional denormalized fields for easy display
    poNumber?: string;
    poDate?: string;

    // Original PO Details
    orderedQty: number;
    uom: string; // PO Unit

    // Receipt Details
    receivedQty: number; // In PO Unit (e.g., Sheets/Kg)

    // Roll Specifics (The 3-Unit Logic + Extra)
    receivedRM?: number; // Running Meter
    receivedSqMtr?: number; // Square Meter
    receivedKg?: number; // Weight

    rollWidth?: number;
    rollGSM?: number;

    batchNo: string;
    supplierBatchNo?: string;
    expiryDate?: string;

    noOfRolls?: number; // For split logic

    // Additional
    rejectedQty?: number;
    acceptedQty?: number;

    remarks?: string;

    // Stock Tracking
    remainingQty?: number; // Current stock available
    status?: 'Available' | 'Issued' | 'Consumed' | 'Partially Issued';
}

export interface GRN {
    id: string;
    grnNumber: string; // GRN-{YY}-{SEQ}
    grnDate: string;

    supplierId: string;
    supplierName: string;

    // Challan Details
    supplierChallanNo: string;
    challanDate: string;
    vehicleNo?: string;

    // QC
    qcReferenceNo?: string;
    receivedBy?: string;
    remarks?: string;

    status: 'Draft' | 'Submitted';

    items: GRNItem[];

    createdAt: string;
    updatedAt: string;
}
