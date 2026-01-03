import { Client } from "@/types/client-supplier";
import { storage } from "../storage"; // Main storage for Estimations

const STORAGE_KEY = "MILAN_CLIENTS";

export const clientStorage = {
    getAll: (): Client[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse clients", e);
            return [];
        }
    },

    getById: (id: string): Client | undefined => {
        const list = clientStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<Client, "id" | "createdAt" | "updatedAt"> & { id?: string }): Client => {
        const list = clientStorage.getAll();

        // 1. Duplicate Check
        const duplicate = list.find(item =>
            item.clientName.toLowerCase() === data.clientName.toLowerCase() &&
            item.id !== data.id
        );

        if (duplicate) {
            throw new Error(`Duplicate Client: '${data.clientName}' already exists.`);
        }

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: Client = {
                    ...list[index],
                    ...data,
                    id: data.id,
                    updatedAt: new Date(),
                };
                list[index] = updated;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                return updated;
            }
        }

        // Create new
        const newItem: Client = {
            ...data,
            id: `CLI${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Client;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        // 2. Referential Integrity Check
        const estimations = storage.getEstimations();
        const used = estimations.some((est: any) => est.clientId === id);

        if (used) {
            throw new Error("Cannot delete: Client is used in existing Estimations/Job Cards.");
        }

        let list = clientStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
