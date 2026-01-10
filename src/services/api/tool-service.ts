import { ToolMaster, ToolMasterFormData } from "@/types/tool-master";

const API_Base_URL = "http://localhost:5005/api/tools";

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
function mapToTool(dto: any): ToolMaster {
  return {
    ...dto,
    id: dto.toolId.toString(), // Map toolId -> id
    toolId: undefined // Remove original key if needed
  };
}

export async function getTools(): Promise<ToolMaster[]> {
  const response = await fetch(API_Base_URL);
  // Handle empty or error responses gracefully if needed
  const dtos = await handleResponse<any[]>(response);
  return dtos.map(mapToTool);
}

export async function getToolById(id: string): Promise<ToolMaster | null> {
  const response = await fetch(`${API_Base_URL}/${id}`);
  if (response.status === 404) return null;
  const dto = await handleResponse<any>(response);
  return mapToTool(dto);
}

export async function createTool(data: ToolMasterFormData): Promise<ToolMaster> {
  // Ensure typed values are correctly formatted (numeric vs string)
  const response = await fetch(API_Base_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToTool(dto);
}

export async function updateTool(
  id: string,
  data: Partial<ToolMasterFormData>
): Promise<ToolMaster> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToTool(dto);
}

export async function deleteTool(id: string): Promise<void> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete tool");
  }
}
