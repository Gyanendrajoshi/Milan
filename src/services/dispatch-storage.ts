import { Estimation } from "@/app/estimation/estimation-columns";
import { storage } from "@/services/storage";

export interface DispatchItem {
    jobId: string;
    jobCardNo: string;
    jobName: string;
    clientName: string; // Snapshot
    orderQty: number; // Snapshot
    dispatchQty: number; // Qty in this specific challan
}

export interface DispatchEntry {
    id: string; // e.g. DCH-2526-001
    challanNo: string;
    date: string; // ISO Date String
    vehicleNo?: string;
    driverName?: string;
    remarks?: string;
    items: DispatchItem[];
    status: "Draft" | "Dispatched";
    createdAt: number;
}

const STORAGE_KEY = "MILAN_DISPATCHES";

export const dispatchStorage = {
    getDispatches: (): DispatchEntry[] => {
        if (typeof window === "undefined") return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Failed to load dispatches", error);
            return [];
        }
    },

    saveDispatch: (entry: DispatchEntry): DispatchEntry => {
        const list = dispatchStorage.getDispatches();
        // Check if exists
        const index = list.findIndex(d => d.id === entry.id);
        if (index > -1) {
            list[index] = entry;
        } else {
            list.push(entry);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return entry;
    },

    deleteDispatch: (id: string) => {
        let list = dispatchStorage.getDispatches();
        list = list.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    // Calculate Total Dispatched Qty for a specific Job
    getJobDispatchSummary: (jobId: string) => {
        const allDispatches = dispatchStorage.getDispatches();
        let totalDispatched = 0;

        allDispatches.forEach(d => {
            d.items.forEach(item => {
                if (item.jobId === jobId) {
                    totalDispatched += (item.dispatchQty || 0);
                }
            });
        });

        return { totalDispatched };
    },

    // Generate Next Challan No
    generateChallanNo: () => {
        const list = dispatchStorage.getDispatches();
        const count = list.length + 1;
        // Logic for Financial Year can be added here
        return `DCH-${count.toString().padStart(4, '0')}`;
    }
};
