export interface MachineMaster {
    id: string;
    name: string;
    type?: string;
    status: "Active" | "Inactive";
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export type MachineFormData = Omit<MachineMaster, "id" | "createdAt" | "updatedAt">;
