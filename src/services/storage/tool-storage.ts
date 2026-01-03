import { ToolMaster } from "@/types/tool-master";

const STORAGE_KEY = "MILAN_TOOLS";

const DEFAULT_TOOLS: ToolMaster[] = [
    { id: "T001", toolName: "Plate 1", toolPrefix: "PLATES", toolNo: "PL101", toolRefCode: "REF01", location: "A1", status: "Active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
    { id: "T002", toolName: "Cylinder 400mm", toolPrefix: "PRINTING CYLINDER", toolNo: "PC202", noOfTeeth: 126, circumferenceMM: 400.05, status: "Active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
    { id: "T003", toolName: "Die 4x4", toolPrefix: "FLEXO DIE", toolNo: "FD303", acrossUps: 4, aroundUps: 4, jobSize: "100x100", status: "Active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" }
] as any;

export const toolStorage = {
    getAll: (): ToolMaster[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_TOOLS;
        } catch (e) {
            console.error("Failed to parse tools", e);
            return DEFAULT_TOOLS;
        }
    },

    getById: (id: string): ToolMaster | undefined => {
        const list = toolStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<ToolMaster, "id" | "createdAt" | "updatedAt"> & { id?: string }): ToolMaster => {
        const list = toolStorage.getAll();

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: ToolMaster = {
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
        const newItem: ToolMaster = {
            ...data,
            id: `TOOL${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as ToolMaster;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        let list = toolStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
