import { Supplier, SupplierFormData } from "@/types/client-supplier";
import { supplierStorage } from "../storage/supplier-storage";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getSuppliers(): Promise<Supplier[]> {
  await delay(300);
  return supplierStorage.getAll();
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  await delay(200);
  return supplierStorage.getById(id) || null;
}

export async function createSupplier(data: SupplierFormData): Promise<Supplier> {
  await delay(400);
  const newSupplier = supplierStorage.save(data);
  return newSupplier;
}

export async function updateSupplier(
  id: string,
  data: Partial<SupplierFormData>
): Promise<Supplier> {
  await delay(400);

  const existing = supplierStorage.getById(id);
  if (!existing) {
    throw new Error("Supplier not found");
  }

  const updatedSupplier = supplierStorage.save({ ...existing, ...data, id });
  return updatedSupplier;
}

export async function deleteSupplier(id: string): Promise<void> {
  await delay(300);

  const existing = supplierStorage.getById(id);
  if (!existing) {
    throw new Error("Supplier not found");
  }

  supplierStorage.delete(id);
}
