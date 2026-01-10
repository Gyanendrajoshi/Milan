import { Client, ClientFormData } from "@/types/client-supplier";

const API_Base_URL = "http://localhost:5005/api/clients";

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
function mapToClient(dto: any): Client {
  return {
    ...dto,
    id: dto.clientId.toString(), // Map clientId -> id
    clientId: undefined // Remove original key if needed, or keep it
  };
}

export async function getClients(): Promise<Client[]> {
  const response = await fetch(API_Base_URL);
  const dtos = await handleResponse<any[]>(response);
  return dtos.map(mapToClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  const response = await fetch(`${API_Base_URL}/${id}`);
  if (response.status === 404) return null;
  const dto = await handleResponse<any>(response);
  return mapToClient(dto);
}

export async function createClient(data: ClientFormData): Promise<Client> {
  const response = await fetch(API_Base_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "X-Tenant-Code": "DEFAULT" // Eventually we need this
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToClient(dto);
}

export async function updateClient(
  id: string,
  data: Partial<ClientFormData>
): Promise<Client> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToClient(dto);
}

export async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete client");
  }
}
