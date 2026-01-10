import { Material, MaterialFormData } from "@/types/material-master";

const API_Base_URL = "http://localhost:5005/api/materials";

// Helper to handle API response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
  }
  // For 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}

// Helper to map Backend DTO to Frontend Model
function mapToMaterial(dto: any): Material {
  return {
    ...dto,
    id: dto.materialId.toString(), // Map materialId -> id
    materialId: undefined // Remove original key if needed
  };
}

export async function getMaterials(): Promise<Material[]> {
  const response = await fetch(API_Base_URL);
  const dtos = await handleResponse<any[]>(response);
  return dtos.map(mapToMaterial);
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const response = await fetch(`${API_Base_URL}/${id}`);
  if (response.status === 404) return null;
  const dto = await handleResponse<any>(response);
  return mapToMaterial(dto);
}

export async function createMaterial(data: MaterialFormData): Promise<Material> {
  // Ensure typed values are numbers where appropriate
  const payload = {
    ...data,
    shelfLifeDays: data.shelfLifeDays ? Number(data.shelfLifeDays) : null,
    purchaseRate: data.purchaseRate ? Number(data.purchaseRate) : null,
    gsm: data.gsm ? Number(data.gsm) : null,
    widthMm: data.widthMm ? Number(data.widthMm) : null,
  };

  const response = await fetch(API_Base_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const dto = await handleResponse<any>(response);
  return mapToMaterial(dto);
}

export async function updateMaterial(
  id: string,
  data: Partial<MaterialFormData>
): Promise<Material> {
  const payload = {
    ...data,
    ...(data.shelfLifeDays !== undefined && { shelfLifeDays: data.shelfLifeDays ? Number(data.shelfLifeDays) : null }),
    ...(data.purchaseRate !== undefined && { purchaseRate: data.purchaseRate ? Number(data.purchaseRate) : null }),
    ...(data.gsm !== undefined && { gsm: data.gsm ? Number(data.gsm) : null }),
    ...(data.widthMm !== undefined && { widthMm: data.widthMm ? Number(data.widthMm) : null }),
  };

  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const dto = await handleResponse<any>(response);
  return mapToMaterial(dto);
}

export async function deleteMaterial(id: string): Promise<void> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete material");
  }
}
