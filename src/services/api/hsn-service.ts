import { HSNMaster, HSNMasterFormData } from "@/types/hsn-master";

const API_Base_URL = "http://localhost:5005/api/hsn";

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
function mapToHSN(dto: any): HSNMaster {
  return {
    ...dto,
    id: dto.hsnId.toString(), // Map hsnId -> id
    hsnId: undefined // Remove original key if needed
  };
}

export async function getHSNCodes(): Promise<HSNMaster[]> {
  const response = await fetch(API_Base_URL);
  const dtos = await handleResponse<any[]>(response);
  return dtos.map(mapToHSN);
}

export async function getHSNById(id: string): Promise<HSNMaster | null> {
  const response = await fetch(`${API_Base_URL}/${id}`);
  if (response.status === 404) return null;
  const dto = await handleResponse<any>(response);
  return mapToHSN(dto);
}

export async function createHSN(data: HSNMasterFormData): Promise<HSNMaster> {
  // Ensure gstPercentage is a number
  const payload = {
    ...data,
    gstPercentage: Number(data.gstPercentage)
  };

  const response = await fetch(API_Base_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const dto = await handleResponse<any>(response);
  return mapToHSN(dto);
}

export async function updateHSN(
  id: string,
  data: Partial<HSNMasterFormData>
): Promise<HSNMaster> {
  // Ensure gstPercentage is a number if present
  const payload = {
    ...data,
    ...(data.gstPercentage !== undefined && { gstPercentage: Number(data.gstPercentage) })
  };

  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const dto = await handleResponse<any>(response);
  return mapToHSN(dto);
}

export async function deleteHSN(id: string): Promise<void> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete HSN");
  }
}
