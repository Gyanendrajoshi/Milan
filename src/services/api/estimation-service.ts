export const API_BASE_URL = "http://localhost:5005/api";

export interface EstimationDto {
    jobCardNo: string;
    date: string;
    clientId: number;
    jobName: string;
    jobPriority: string;
    jobType: string;
    status: string;
    orderQty: number;
    categoryId: number;
    poNumber?: string;
    deliveryDate?: string;
    salesPersonName?: string;

    totalJobCost: number;
    finalPriceWithGST: number;
    unitCost: number;
    finalSalesPrice: number;
    totalOrderValue: number;

    content: EstimationDetailDto[];
}

export interface EstimationDetailDto {
    contentName: string;
    machineName?: string;

    jobWidthMM: number;
    jobHeightMM: number;
    colorsFront: number;
    colorsBack: number;
    upsAcross: number;
    upsAround: number;
    totalUps: number;

    toolId?: number;
    dieId?: number;
    rollId?: number;

    baseRunningMtr: number;
    baseSqMtr: number;
    baseKg: number;

    wastagePercent: number;
    wastageRM: number;

    totalRunningMtr: number;
    totalSqMtr: number;
    totalKg: number;

    materialRate: number;
    materialCostAmount: number;

    additionalCostPercent: number;
    additionalCostAmount: number;

    processCosts: EstimationProcessCostDto[];
}

export interface EstimationProcessCostDto {
    processId: number;
    processName?: string;
    rateType: string;
    quantity: number;
    rate: number;
    amount: number;
    isManualQuantity: boolean;
    isManualRate: boolean;

    baseRate?: number;
    extraColorRate?: number;
    backPrintingRate?: number;
    debugInfo?: string;
}

export interface ChargeTypeDto {
    id: number;
    name: string;
    logicCode: string;
    isActive: boolean;
}

export async function createEstimation(data: EstimationDto): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/estimations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create estimation");
    return await response.json();
}

export async function updateEstimation(id: number, data: EstimationDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/estimations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update estimation");
}

export async function getEstimations(): Promise<EstimationDto[]> {
    const response = await fetch(`${API_BASE_URL}/estimations`);
    if (!response.ok) throw new Error("Failed to fetch estimations");
    return await response.json();
}

export async function getEstimationById(id: number): Promise<EstimationDto> {
    const response = await fetch(`${API_BASE_URL}/estimations/${id}`);
    if (!response.ok) throw new Error("Failed to fetch estimation");
    return await response.json();
}

export async function deleteEstimation(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/estimations/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete estimation");
}

export async function getChargeTypes(): Promise<ChargeTypeDto[]> {
    const response = await fetch(`${API_BASE_URL}/chargetypes`);
    if (!response.ok) throw new Error("Failed to fetch charge types");
    return await response.json();
}
