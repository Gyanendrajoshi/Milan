import { RollMaster } from "@/types/roll-master";

const STORAGE_KEY = "MILAN_ROLLS";

const DEFAULT_ROLLS: RollMaster[] = [
    { id: "R001", itemCode: "RF001", itemType: "Film", quality: "BOPP", rollWidthMM: 330, totalGSM: 40, purchaseRate: 150, purchaseUnit: "Kg", status: "Active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
    { id: "R002", itemCode: "RP002", itemType: "Paper", quality: "Chromo", rollWidthMM: 500, totalGSM: 80, purchaseRate: 90, purchaseUnit: "Kg", status: "Active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }
] as any;

export const rollStorage = {
    getAll: (): RollMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_ROLLS;
        } catch (e) {
            console.error("Failed to parse rolls", e);
            return DEFAULT_ROLLS;
        }
    },

    getById: (id: string): RollMaster | undefined => {
        const list = rollStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<RollMaster, "id" | "createdAt" | "updatedAt"> & { id?: string }): RollMaster => {
        const list = rollStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: RollMaster = {
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
        const newItem: RollMaster = {
            ...data,
            id: `ROLL${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as RollMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = rollStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
