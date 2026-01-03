export interface Client {
  id: string;
  clientName: string;
  address: string;
  mobileNumber: string;
  email: string;
  gstNumber?: string;
  state: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  supplierName: string;
  address: string;
  mobileNumber: string;
  email: string;
  gstNumber?: string;
  excessQuantityTolerance?: number;
  state: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientFormData = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type SupplierFormData = Omit<Supplier, "id" | "createdAt" | "updatedAt">;
