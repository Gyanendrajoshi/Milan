import { processStorage } from "../storage/process-storage";
import { ProcessMaster } from "@/types/process-master";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProcessMasterList = async (): Promise<ProcessMaster[]> => {
    await delay(500);
    return processStorage.getAll();
};

export const getProcessById = async (id: string): Promise<ProcessMaster | null> => {
    await delay(200);
    return processStorage.getById(id) || null;
};

export const createProcess = async (data: Omit<ProcessMaster, "id">): Promise<ProcessMaster> => {
    await delay(400);
    const newProcess = processStorage.save(data);
    return newProcess;
};

export const updateProcess = async (id: string, data: Partial<Omit<ProcessMaster, "id">>): Promise<ProcessMaster> => {
    await delay(400);
    const existing = processStorage.getById(id);
    if (!existing) {
        throw new Error("Process not found");
    }
    const updated = processStorage.save({ ...existing, ...data, id });
    return updated;
};

export const deleteProcess = async (id: string): Promise<void> => {
    await delay(300);
    const existing = processStorage.getById(id);
    if (!existing) {
        throw new Error("Process not found");
    }
    processStorage.delete(id);
};
