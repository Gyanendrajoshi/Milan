import { Client, ClientFormData } from "@/types/client-supplier";
import { clientStorage } from "../storage/client-storage";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getClients(): Promise<Client[]> {
  await delay(300);
  // Load from localStorage instead of mock data
  return clientStorage.getAll();
}

export async function getClientById(id: string): Promise<Client | null> {
  await delay(200);
  return clientStorage.getById(id) || null;
}

export async function createClient(data: ClientFormData): Promise<Client> {
  await delay(400);

  // Save to localStorage
  const newClient = clientStorage.save(data);
  return newClient;
}

export async function updateClient(
  id: string,
  data: Partial<ClientFormData>
): Promise<Client> {
  await delay(400);

  const existing = clientStorage.getById(id);
  if (!existing) {
    throw new Error("Client not found");
  }

  // Update in localStorage
  const updatedClient = clientStorage.save({ ...existing, ...data, id });
  return updatedClient;
}

export async function deleteClient(id: string): Promise<void> {
  await delay(300);

  const existing = clientStorage.getById(id);
  if (!existing) {
    throw new Error("Client not found");
  }

  clientStorage.delete(id);
}
