export interface SalesPersonMaster {
    id: string;
    name: string;
    code?: string;
    status: "Active" | "Inactive";
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export type SalesPersonFormData = Omit<SalesPersonMaster, "id" | "createdAt" | "updatedAt">;
