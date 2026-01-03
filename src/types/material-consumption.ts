export interface ConsumedItem {
    issueItemId: string; // Ref to IssuedItem (we might need to add IDs to IssuedItem or use index)
    // Or link by batch/item
    itemCode: string;
    batchNo: string;

    consumedQty: number; // The new consumption
    uom: string;

    remarks?: string;
}

export interface MaterialConsumption {
    id: string; // CONS-0001
    date: string; // ISO

    jobId?: string; // If Job context
    jobCardNo?: string;
    department?: string; // If Dept context

    items: ConsumedItem[];

    createdAt: string;
}
