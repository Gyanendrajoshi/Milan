import { RollMaster, RollMasterFormData } from "@/types/roll-master";
import { rollStorage } from "../storage/roll-storage";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all rolls
 * In production: Replace with actual API call to GET /api/rolls
 */
export async function getRolls(): Promise<RollMaster[]> {
  // await delay(300); // Removed delay
  return rollStorage.getAll();
}

/**
 * Get a roll by ID
 * In production: Replace with actual API call to GET /api/rolls/{id}
 */
export async function getRollById(id: string): Promise<RollMaster | null> {
  await delay(200);
  return rollStorage.getById(id) || null;
}

/**
 * Create a new roll
 * In production: Replace with actual API call to POST /api/rolls
 */
export async function createRoll(
  data: RollMasterFormData
): Promise<RollMaster> {
  await delay(400);
  const newRoll = rollStorage.save(data);
  return newRoll;
}

/**
 * Update an existing roll
 * In production: Replace with actual API call to PUT /api/rolls/{id}
 */
export async function updateRoll(
  id: string,
  data: Partial<RollMasterFormData>
): Promise<RollMaster> {
  await delay(400);

  const existing = rollStorage.getById(id);
  if (!existing) {
    throw new Error("Roll not found");
  }

  const updatedRoll = rollStorage.save({ ...existing, ...data, id });
  return updatedRoll;
}

/**
 * Delete a roll
 * In production: Replace with actual API call to DELETE /api/rolls/{id}
 */
export async function deleteRoll(id: string): Promise<void> {
  await delay(300);

  const existing = rollStorage.getById(id);
  if (!existing) {
    throw new Error("Roll not found");
  }

  rollStorage.delete(id);
}
