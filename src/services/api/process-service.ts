import { ProcessMaster } from "@/types/process-master";
import { ProcessMasterFormValues } from "@/lib/validations/process-master";

const API_BASE_URL = "http://localhost:5005/api/Processes";

export const getProcessMasterList = async (): Promise<ProcessMaster[]> => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch processes");
    return await res.json();
};

export const getProcessById = async (id: string): Promise<ProcessMaster | null> => {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch process");
    return await res.json();
};

export const createProcess = async (data: any): Promise<ProcessMaster> => {
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create process");
    return await res.json();
};

export const updateProcess = async (id: string, data: any): Promise<ProcessMaster> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update process");
    return await res.json();
};

export const deleteProcess = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete process");
};
