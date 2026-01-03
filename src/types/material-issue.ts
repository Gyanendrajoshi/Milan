export interface IssuedItem {
    grnItemId: string;
    itemCode: string;
    itemName: string;
    batchNo: string;

    issuedQty: number;
    uom: string;

    // Snapshot of specs
    rollWidth?: number;
    gsm?: number;

    remark?: string;
}

export interface MaterialIssue {
    id: string; // ISSUE-0001
    issueDate: string; // ISO String

    issueType: 'JOB' | 'DEPT';

    // If Type == JOB
    jobId?: string; // Link to Estimation
    jobCardNo?: string; // Display e.g. JC00001/25-26 [1/2]

    // If Type == DEPT
    department?: string;

    items: IssuedItem[];

    issuedBy?: string;
    remarks?: string;

    createdAt: string;
    updatedAt: string;
}
