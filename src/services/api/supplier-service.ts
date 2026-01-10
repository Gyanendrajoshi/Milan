import { Supplier, SupplierFormData } from "@/types/client-supplier";

const API_Base_URL = "http://localhost:5005/api/suppliers";

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
function mapToSupplier(dto: any): Supplier {
  return {
    ...dto,
    id: dto.supplierId.toString(), // Map supplierId -> id
    supplierId: undefined // Remove original key if needed
  };
}

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch(API_Base_URL);
  const dtos = await handleResponse<any[]>(response);
  return dtos.map(mapToSupplier);
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const response = await fetch(`${API_Base_URL}/${id}`);
  if (response.status === 404) return null;
  const dto = await handleResponse<any>(response);
  return mapToSupplier(dto);
}

export async function createSupplier(data: SupplierFormData): Promise<Supplier> {
  const response = await fetch(API_Base_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToSupplier(dto);
}

export async function updateSupplier(
  id: string,
  data: Partial<SupplierFormData>
): Promise<Supplier> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const dto = await handleResponse<any>(response);
  return mapToSupplier(dto);
}

export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`${API_Base_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete supplier");
  }
}
