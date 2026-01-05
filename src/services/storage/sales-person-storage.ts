import { SalesPersonMaster } from "@/types/sales-person-master";

const STORAGE_KEY = "MILAN_SALES_PERSONS";

const DEFAULT_SALES_PERSONS: SalesPersonMaster[] = [
    { id: "SP001", name: "Rahul Sharma", status: "Active" },
    { id: "SP002", name: "Amit Patel", status: "Active" },
    { id: "SP003", name: "Priya Singh", status: "Active" }
];

export const salesPersonStorage = {
    getAll: (): SalesPersonMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_SALES_PERSONS;
        } catch (e) {
            console.error("Failed to parse sales persons", e);
            return DEFAULT_SALES_PERSONS;
        }
    },

    getById: (id: string): SalesPersonMaster | undefined => {
        const list = salesPersonStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<SalesPersonMaster, "id" | "createdAt" | "updatedAt"> & { id?: string }): SalesPersonMaster => {
        const list = salesPersonStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: SalesPersonMaster = {
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
        const newItem: SalesPersonMaster = {
            ...data,
            id: `SP${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as SalesPersonMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = salesPersonStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
