import { EstimationFormValues } from "@/types/estimation";
import { Estimation } from "@/app/estimation/estimation-columns";
import { mockClients } from "./mock-data/clients";

const STORAGE_KEY = "MILAN_ESTIMATIONS";

// Helper function to get client name by ID
const getClientName = (clientId: string): string => {
    const client = mockClients.find(c => c.id === clientId);
    return client?.clientName || "Unknown Client";
};

export const storage = {
    getEstimations: (): Estimation[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse estimations", e);
            return [];
        }
    },

    getEstimationById: (id: string): Estimation | undefined => {
        const list = storage.getEstimations();
        return list.find(item => item.id === id);
    },

    saveEstimation: (data: EstimationFormValues & { id?: string }): Estimation => {
        const list = storage.getEstimations();

        // Lookup client name from ID
        const clientName = getClientName(data.clientId);

        // If ID exists, update; else create new
        const isUpdate = !!data.id;
        let savedItem: Estimation;

        if (isUpdate) {
            const index = list.findIndex(item => item.id === data.id);
            if (index === -1) {
                // Should not happen, but fallback to add
                savedItem = {
                    ...data,
                    id: data.id || `JC${Date.now()}`,
                    jobCardNo: data.jobCardNo || `JC-${Date.now()}`,
                    client: clientName,
                    quantity: data.orderQty,
                    status: "Pending"
                } as any;
                list.push(savedItem);
            } else {
                // Update existing
                savedItem = {
                    ...list[index],
                    ...data,
                    client: clientName,
                    quantity: data.orderQty,
                    id: data.id!,
                } as any;
                list[index] = savedItem;
            }
        } else {
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
            } as any;
            list.push(savedItem);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return savedItem;
    },

    deleteEstimation: (id: string) => {
        let list = storage.getEstimations();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
