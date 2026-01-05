import { MachineMaster } from "@/types/machine-master";

const STORAGE_KEY = "MILAN_MACHINES";

const DEFAULT_MACHINES: MachineMaster[] = [
    { id: "M001", name: "Rotogravure 8 Color", type: "Rotogravure", status: "Active" },
    { id: "M002", name: "Flexo 4 Color", type: "Flexo", status: "Active" },
    { id: "M003", name: "Offset 6 Color", type: "Offset", status: "Active" }
];

export const machineStorage = {
    getAll: (): MachineMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_MACHINES;
        } catch (e) {
            console.error("Failed to parse machines", e);
            return DEFAULT_MACHINES;
        }
    },

    getById: (id: string): MachineMaster | undefined => {
        const list = machineStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<MachineMaster, "id" | "createdAt" | "updatedAt"> & { id?: string }): MachineMaster => {
        const list = machineStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: MachineMaster = {
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
        const newItem: MachineMaster = {
            ...data,
            id: `MAC${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as MachineMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = machineStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
