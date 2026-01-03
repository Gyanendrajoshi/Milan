import { MaterialReturn } from "@/types/material-return";
import { grnStorage } from "@/services/grn-storage";

const STORAGE_KEY = "MILAN_RETURNS";

export const returnStorage = {
    getAll: (): MaterialReturn[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse Returns", e);
            return [];
        }
    },

    save: (data: Omit<MaterialReturn, "id" | "createdAt" | "updatedAt">): MaterialReturn => {
        const list = returnStorage.getAll();
        const now = new Date().toISOString();

        // Financial Year Logic
        const dateObj = new Date();
        const month = dateObj.getMonth(); // 0-11 (April is 3)
        const year = dateObj.getFullYear();

        let fyStart = month >= 3 ? year : year - 1;
        let fyEnd = fyStart + 1;
        const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`; // e.g., "25-26"

        // Find Sequence for this FY
        // Format: MR00001/25-26
        const prefix = "MR";
        const suffix = `/${fyString}`;

        const matchingReturns = list.filter(r => r.id.endsWith(suffix) && r.id.startsWith(prefix));
        let nextSeq = 1;

        if (matchingReturns.length > 0) {
            const maxSeq = Math.max(...matchingReturns.map(r => {
                // Extract 5 digits between MR and /
                const str = r.id.replace(prefix, "").replace(suffix, "");
                return parseInt(str) || 0;
            }));
            nextSeq = maxSeq + 1;
        }

        const id = `${prefix}${nextSeq.toString().padStart(5, '0')}${suffix}`;

        const newReturn: MaterialReturn = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now
        };

        list.unshift(newReturn); // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        // Update stock: Add back returned quantities
        newReturn.items.forEach(item => {
            grnStorage.restoreStock(item.grnItemId, item.returnedQty);
        });

        return newReturn;
    },

    getByIssue: (issueId: string): MaterialReturn[] => {
        const list = returnStorage.getAll();
        return list.filter(r => r.issueId === issueId);
    },

    getTotalReturnedQty: (issueId: string, grnItemId: string): number => {
        const returns = returnStorage.getByIssue(issueId);
        let total = 0;
        returns.forEach(ret => {
            ret.items.forEach(item => {
                if (item.grnItemId === grnItemId) {
                    total += item.returnedQty;
                }
            });
        });
        return total;
    },

    delete: (id: string): void => {
        const list = returnStorage.getAll();
        const returnToDelete = list.find(r => r.id === id);

        if (returnToDelete && returnToDelete.items) {
            // Reverse stock changes: Subtract returned quantities
            returnToDelete.items.forEach(item => {
                // Find the GRN item and reduce stock
                const stockItem = grnStorage.getItemByBatch(item.batchNo);
                if (stockItem) {
                    grnStorage.updateStock(stockItem.grnId, stockItem.id, item.returnedQty);
                }
            });
        }

        const newList = list.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
};
