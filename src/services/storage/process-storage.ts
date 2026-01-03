import { ProcessMaster } from "@/types/process-master";

const STORAGE_KEY = "MILAN_PROCESSES";

const DEFAULT_PROCESSES: ProcessMaster[] = [
    { id: "P001", code: "PM00001", name: "Printing - Flexo", chargeType: "rate_per_kg", isUnitConversion: false, rate: 45, setupCharges: 0 },
    { id: "P002", code: "PM00002", name: "Printing - Rotogravure", chargeType: "rate_per_kg", isUnitConversion: false, rate: 55, setupCharges: 0 },
    { id: "P003", code: "PM00003", name: "Lamination - Solvent Based", chargeType: "rate_per_kg", isUnitConversion: false, rate: 35, setupCharges: 0 },
    { id: "P004", code: "PM00004", name: "Lamination - Solventless", chargeType: "rate_per_kg", isUnitConversion: false, rate: 40, setupCharges: 0 },
    { id: "P005", code: "PM00005", name: "Slitting", chargeType: "rate_per_kg", isUnitConversion: false, rate: 800, setupCharges: 0 },
    { id: "P006", code: "PM00006", name: "Pouching", chargeType: "rate_per_1000_units", isUnitConversion: false, rate: 150, setupCharges: 0 },
    { id: "P007", code: "PM00007", name: "Die Cutting", chargeType: "rate_per_1000_units", isUnitConversion: false, rate: 200, setupCharges: 0 },
    { id: "P008", code: "PM00008", name: "Pasting", chargeType: "rate_per_1000_units", isUnitConversion: false, rate: 100, setupCharges: 0 }
];

export const processStorage = {
    getAll: (): ProcessMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_PROCESSES;
        } catch (e) {
            console.error("Failed to parse processes", e);
            return DEFAULT_PROCESSES;
        }
    },

    getById: (id: string): ProcessMaster | undefined => {
        const list = processStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<ProcessMaster, "id"> & { id?: string }): ProcessMaster => {
        const list = processStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: ProcessMaster = {
                    ...list[index],
                    ...data,
                    id: data.id,
                };
                list[index] = updated;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                return updated;
            }
        }

        // Create new
        const newItem: ProcessMaster = {
            ...data,
            id: `PROC${Date.now()}`,
        } as ProcessMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = processStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
