import { ProductionEntry, ProductionLog } from "@/types/production";

const STORAGE_KEY = "MILAN_PRODUCTION";

export const productionStorage = {
    getAll: (): ProductionEntry[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse Production Data", e);
            return [];
        }
    },

    getById: (id: string): ProductionEntry | undefined => {
        const list = productionStorage.getAll();
        return list.find(item => item.id === id || item.jobId === id);
    },

    save: (data: ProductionEntry): ProductionEntry => {
        const list = productionStorage.getAll();
        const index = list.findIndex(item => item.id === data.id);

        if (index !== -1) {
            list[index] = data;
        } else {
            list.push(data);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return data;
    },

    // Initialize a Production Record for a Job if it doesn't exist
    initForJob: (job: any): ProductionEntry => {
        const list = productionStorage.getAll();
        const existing = list.find(p => p.jobId === job.id);

        if (existing) return existing;

        const newEntry: ProductionEntry = {
            id: `PROD-${job.id}`,
            jobId: job.id,
            jobCardNo: job.jobCardNo,
            jobName: job.jobName || "Unknown Job",
            clientName: job.client || "Unknown Client",
            orderQty: Number(job.orderQty) || 0,
            deliveryDate: job.deliveryDate || "",
            logs: [],
            status: 'In Production',
            totalProduced: 0,
            totalWastage: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        list.push(newEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newEntry;
    },

    addLog: (prodId: string, log: ProductionLog): ProductionEntry | null => {
        const list = productionStorage.getAll();
        const index = list.findIndex(p => p.id === prodId || p.jobId === prodId);

        if (index === -1) return null;

        const entry = list[index];
        entry.logs.push(log);

        // Update Totals (Accumulate all - refinements can be added later)
        if (log.qtyProduced) entry.totalProduced += log.qtyProduced;
        if (log.wastageQty) entry.totalWastage += log.wastageQty;

        // Update Timestamp
        entry.updatedAt = new Date().toISOString();
        if (entry.status === 'Pending') entry.status = 'In Production';

        list[index] = entry;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        return entry;
    },

    deleteLog: (prodId: string, logId: string): ProductionEntry | null => {
        const list = productionStorage.getAll();
        const index = list.findIndex(p => p.id === prodId || p.jobId === prodId);

        if (index === -1) return null;

        const entry = list[index];
        const logIndex = entry.logs.findIndex(l => l.id === logId);

        if (logIndex === -1) return null;

        const log = entry.logs[logIndex];

        // Deduct Totals
        if (log.qtyProduced) entry.totalProduced = Math.max(0, entry.totalProduced - log.qtyProduced);
        if (log.wastageQty) entry.totalWastage = Math.max(0, entry.totalWastage - log.wastageQty);

        // Remove Log
        entry.logs.splice(logIndex, 1);

        // Update Timestamp
        entry.updatedAt = new Date().toISOString();

        // Re-evaluate Status if needed
        if (entry.totalProduced === 0 && entry.logs.length === 0) {
            entry.status = 'Pending';
        }

        list[index] = entry;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        return entry;
    },

    updateLog: (prodId: string, logId: string, updates: Partial<ProductionLog>): ProductionEntry | null => {
        const list = productionStorage.getAll();
        const index = list.findIndex(p => p.id === prodId || p.jobId === prodId);

        if (index === -1) return null;

        const entry = list[index];
        const logIndex = entry.logs.findIndex(l => l.id === logId);

        if (logIndex === -1) return null;

        // Apply Updates
        entry.logs[logIndex] = { ...entry.logs[logIndex], ...updates };

        // Recalculate Totals (Safer than differential)
        entry.totalProduced = entry.logs.reduce((sum, l) => sum + (l.qtyProduced || 0), 0);
        entry.totalWastage = entry.logs.reduce((sum, l) => sum + (l.wastageQty || 0), 0);

        entry.updatedAt = new Date().toISOString();

        list[index] = entry;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        return entry;
    }
};
