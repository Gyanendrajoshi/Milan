export interface ProductionEntry {
    id: string; // Unique ID for this production record
    jobId: string; // Link to Estimation/Job
    jobCardNo: string;

    // Header Info (Snapshot from Job)
    jobName: string;
    clientName: string;
    orderQty: number;
    deliveryDate: string;

    // Production Logs
    logs: ProductionLog[];

    status: 'Pending' | 'In Production' | 'Completed';
    totalProduced: number;
    totalWastage: number;

    createdAt: string;
    updatedAt: string;
}

export interface ProductionLog {
    id: string;
    date: string; // ISO Date
    operationName: string; // e.g. "Printing", "Lamination"
    machineId?: string;
    machineName: string; // Snapshot
    operatorName: string;

    qtyProduced: number;
    wastageQty: number;
    unit?: string; // Kg, Sq. Mtr, Run. Mtr

    startTime?: string;
    endTime?: string;

    processId: string; // Link to specific process in Estimation
    contentId?: number; // Link to specific content (if multi-content)

    remarks?: string;
    status: 'Running' | 'Completed';
}
