import { HSNMaster, HSNMasterFormData } from "@/types/hsn-master";
import { hsnStorage } from "../storage/hsn-storage";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all HSN codes
 * In production: Replace with actual API call to GET /api/hsn
 */
export async function getHSNCodes(): Promise<HSNMaster[]> {
  await delay(300);
  return hsnStorage.getAll();
}

/**
 * Get an HSN code by ID
 * In production: Replace with actual API call to GET /api/hsn/{id}
 */
export async function getHSNById(id: string): Promise<HSNMaster | null> {
  await delay(200);
  return hsnStorage.getById(id) || null;
}

/**
 * Create a new HSN code
 * In production: Replace with actual API call to POST /api/hsn
 */
export async function createHSN(
  data: HSNMasterFormData
): Promise<HSNMaster> {
  await delay(400);
  const newHSN = hsnStorage.save(data);
  return newHSN;
}

/**
 * Update an existing HSN code
 * In production: Replace with actual API call to PUT /api/hsn/{id}
 */
export async function updateHSN(
  id: string,
  data: Partial<HSNMasterFormData>
): Promise<HSNMaster> {
  await delay(400);

  const existing = hsnStorage.getById(id);
  if (!existing) {
    throw new Error("HSN not found");
  }

  const updatedHSN = hsnStorage.save({ ...existing, ...data, id });
  return updatedHSN;
}

/**
 * Delete an HSN code
 * In production: Replace with actual API call to DELETE /api/hsn/{id}
 */
export async function deleteHSN(id: string): Promise<void> {
  await delay(300);

  const existing = hsnStorage.getById(id);
  if (!existing) {
    throw new Error("HSN not found");
  }

  hsnStorage.delete(id);
}
