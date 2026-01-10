import { RollMaster, RollMasterFormData } from "@/types/roll-master";

const API_Base_URL = "http://localhost:5005/api/rolls";

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
function mapToRoll(dto: any): RollMaster {
  return {
    ...dto,
    id: dto.rollId.toString(), // Map rollId -> id
    rollId: undefined // Remove original key if needed
  };
}

export async function getRolls(): Promise<RollMaster[]> {
  const response = await fetch(API_Base_URL);
  const dtos = await handleResponse<any[]>(response);
  return dtos.map(mapToRoll);
}

export async function getRollById(id: string): Promise<RollMaster | null> {
  const response = await fetch(`${API_Base_URL}/${id}`);
  if (response.status === 404) return null;
  const dto = await handleResponse<any>(response);
  return mapToRoll(dto);
}

export async function createRoll(data: RollMasterFormData): Promise<RollMaster> {
  // Ensure typed values are correctly formatted (numeric vs string)
  // Backend expects numeric types for many fields, frontend ensures this via Zod transformer
  const response = await fetch(API_Base_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToRoll(dto);
}

export async function updateRoll(
  id: string,
  data: Partial<RollMasterFormData>
): Promise<RollMaster> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToRoll(dto);
}

export async function deleteRoll(id: string): Promise<void> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete roll");
  }
}
