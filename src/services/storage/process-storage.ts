import { ProcessMaster } from "@/types/process-master";

const STORAGE_KEY = "MILAN_PROCESSES";

const DEFAULT_PROCESSES: ProcessMaster[] = [
    { id: "P001", name: "Printing", type: "PRINTING", rateType: "Rate/Color", rate: 500, status: "Active" },
    { id: "P002", name: "Lamination", type: "LAMINATION", rateType: "Rate/Sq.Meter", rate: 5, status: "Active" },
    { id: "P003", name: "Die Cutting", type: "DIE CUTTING", rateType: "Rate/1000 Units", rate: 150, status: "Active" },
    { id: "P004", name: "Slitting", type: "SLITTING", rateType: "Rate/Kg", rate: 10, status: "Active" },
    { id: "P005", name: "Pasting", type: "PASTING", rateType: "Rate/1000 Units", rate: 200, status: "Active" }
] as any;

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
