export interface ReturnedItem {
    issueItemId: string;        // Link to original IssuedItem
    grnItemId: string;          // Original GRN Item for stock reversal
    itemCode: string;
    itemName: string;
    batchNo: string;

    issuedQty: number;          // Original issued quantity
    returnedQty: number;        // Quantity being returned now
    previouslyReturnedQty: number; // Sum of all previous returns

    uom: string;

    // Snapshot
    rollWidth?: number;
    gsm?: number;

    returnReason?: string;      // Excess, Damaged, Job Cancelled, etc.
    qualityStatus?: 'OK' | 'DAMAGED' | 'PENDING_INSPECTION';
    remark?: string;
}

export interface MaterialReturn {
    id: string;                 // MR00001/25-26
    returnDate: string;         // ISO String

    // Link to original Issue
    issueId: string;            // MI00001/25-26
    issueDate: string;          // For reference
    jobCardNo?: string;         // For display
    department?: string;

    items: ReturnedItem[];

    returnedBy?: string;
    remarks?: string;

    createdAt: string;
    updatedAt: string;
}
