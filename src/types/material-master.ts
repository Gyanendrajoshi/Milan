export interface Material {
    id: string;
    itemCode: string; // e.g., M00001
    itemName: string;
    shelfLifeDays?: number;
    itemGroup: string;
    purchaseUnit: string;
    purchaseRate: number;
    hsnCode: string;
    // Roll Specifics
    gsm?: number;
    widthMm?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type MaterialFormData = Omit<Material, "id" | "createdAt" | "updatedAt">;
