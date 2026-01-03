import { EstimationFormValues } from "@/types/estimation";
import { Estimation } from "@/app/estimation/estimation-columns";
import { mockClients } from "./mock-data/clients";

const STORAGE_KEY = "MILAN_ESTIMATIONS";

// Helper function to get client name by ID
const getClientName = (clientId: string): string => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || "Unknown Client";
};

// Helper to get raw list safely
const getList = (): Estimation[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to parse estimations", e);
        return [];
    }
};

export const storage = {
    getEstimations: (): Estimation[] => {
        return getList();
    },

    getEstimationById: (id: string): Estimation | undefined => {
        const list = getList();
        return list.find(item => item.id === id);
    },

    saveEstimation: (data: EstimationFormValues & { id?: string }): Estimation => {
        console.log("Storage: saveEstimation called with", data);

        // Check if localStorage is available
        if (typeof window === "undefined") {
            throw new Error("localStorage is not available (SSR context)");
        }

        const list = getList();
        console.log("Storage: Current list size:", list.length);

        // Lookup client name from ID
        const clientName = getClientName(data.clientId);
        console.log("Storage: Client name resolved:", clientName);

        // If ID exists, update; else create new
        const isUpdate = !!data.id;
        let savedItem: Estimation;

        if (isUpdate) {
            console.log("Storage: Updating existing estimation with ID:", data.id);
            const index = list.findIndex(item => item.id === data.id);
            if (index === -1) {
                console.warn("Storage: ID not found in list, creating new instead");
                // Should not happen, but fallback to add
                savedItem = {
                    ...data,
                    id: data.id || `JC${Date.now()}`,
                    jobCardNo: data.jobCardNo || `JC-${Date.now()}`,
                    client: clientName,
                    quantity: data.orderQty,
                    status: "Pending"
                } as Estimation;
                list.push(savedItem);
            } else {
                console.log("Storage: Found existing item at index:", index);
                // Update existing - preserve status
                savedItem = {
                    ...list[index],
                    ...data,
                    client: clientName,
                    quantity: data.orderQty,
                    id: data.id!,
                    status: list[index].status || "Pending"
                } as Estimation;
                list[index] = savedItem;
            }
        } else {
            console.log("Storage: Creating new estimation");
            // Create New
            const newId = `JC${Math.floor(Math.random() * 10000)}-25`;
            savedItem = {
                ...data,
                id: newId,
                jobCardNo: data.jobCardNo || newId,
                client: clientName,
                quantity: data.orderQty,
                status: "Pending",
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString().split('T')[0] : ""
            } as Estimation;
            list.push(savedItem);
            console.log("Storage: New ID generated:", newId);
        }

        try {
            const jsonData = JSON.stringify(list);
            console.log("Storage: Data size to save:", (jsonData.length / 1024).toFixed(2), "KB");
            localStorage.setItem(STORAGE_KEY, jsonData);
            console.log("Storage: ✓ Saved to localStorage successfully");
            console.log("Storage: Total estimations in storage:", list.length);
        } catch (e: any) {
            console.error("Storage: ✗ Failed to save to localStorage", e);
            if (e.name === 'QuotaExceededError') {
                throw new Error("Storage quota exceeded. Please clear some old estimations.");
            }
            throw e;
        }

        return savedItem;
    },

    deleteEstimation: (id: string) => {
        let list = getList();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
