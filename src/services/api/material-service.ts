import { Material, MaterialFormData } from "@/types/material-master";
import { materialStorage } from "../storage/material-storage";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getMaterials(): Promise<Material[]> {
  await delay(300);
  return materialStorage.getAll();
}

export async function getMaterialById(id: string): Promise<Material | null> {
  await delay(200);
  return materialStorage.getById(id) || null;
}

export async function createMaterial(data: MaterialFormData): Promise<Material> {
  await delay(400);
  const newMaterial = materialStorage.save(data);
  return newMaterial;
}

export async function updateMaterial(
  id: string,
  data: Partial<MaterialFormData>
): Promise<Material> {
  await delay(400);

  const existing = materialStorage.getById(id);
  if (!existing) {
    throw new Error("Material not found");
  }

  const updatedMaterial = materialStorage.save({ ...existing, ...data, id });
  return updatedMaterial;
}

export async function deleteMaterial(id: string): Promise<void> {
  await delay(300);

  const existing = materialStorage.getById(id);
  if (!existing) {
    throw new Error("Material not found");
  }

  materialStorage.delete(id);
}
