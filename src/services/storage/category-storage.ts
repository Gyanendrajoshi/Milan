import { CategoryMaster } from "@/types/category-master";

const STORAGE_KEY = "MILAN_CATEGORIES";

export const categoryStorage = {
    getAll: (): CategoryMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse categories", e);
            return [];
        }
    },

    getById: (id: string): CategoryMaster | undefined => {
        const list = categoryStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<CategoryMaster, "id" | "createdAt" | "updatedAt"> & { id?: string }): CategoryMaster => {
        const list = categoryStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: CategoryMaster = {
                    ...list[index],
                    ...data,
                    id: data.id,
                    updatedAt: new Date().toISOString(),
                };
                list[index] = updated;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                return updated;
            }
        }

        // Create new
        const newItem: CategoryMaster = {
            ...data,
            id: `CAT${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as CategoryMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = categoryStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
