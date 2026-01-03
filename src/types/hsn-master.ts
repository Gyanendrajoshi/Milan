export interface HSNMaster {
  id: string;
  name: string;
  hsnCode: string;
  gstPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export type HSNMasterFormData = Omit<HSNMaster, "id" | "createdAt" | "updatedAt">;
