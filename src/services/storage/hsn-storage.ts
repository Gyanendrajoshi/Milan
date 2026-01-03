import { HSNMaster } from "@/types/hsn-master";

const STORAGE_KEY = "MILAN_HSN";

export const hsnStorage = {
    getAll: (): HSNMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse HSN codes", e);
            return [];
        }
    },

    getById: (id: string): HSNMaster | undefined => {
        const list = hsnStorage.getAll();
        return list.find(item => item.id === id);
    },

    getByCode: (code: string): HSNMaster | undefined => {
        const list = hsnStorage.getAll();
        return list.find(item => item.hsnCode === code);
    },

    save: (data: Omit<HSNMaster, "id" | "createdAt" | "updatedAt"> & { id?: string }): HSNMaster => {
        const list = hsnStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: HSNMaster = {
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
        const newItem: HSNMaster = {
            ...data,
            id: `HSN${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as HSNMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = hsnStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
