import { MaterialConsumption, ConsumedItem } from "@/types/material-consumption";
import { MaterialIssue } from "@/types/material-issue";

const STORAGE_KEY = "milan_material_consumptions";

export const consumptionStorage = {
    getAll: (): MaterialConsumption[] => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    },

    save: (consumption: MaterialConsumption) => {
        const list = consumptionStorage.getAll();
        list.push(consumption);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    // Get total consumed qty for a specific issue item (identified by IssueID + Batch + ItemCode)
    // Note: ideally IssuedItem should have a unique ID. For now we use ItemCode + Batch + IssueID combination.
    getConsumedQtyForIssue: (issueId: string, itemCode: string, batchNo: string): number => {
        const all = consumptionStorage.getAll();
        let total = 0;

        // Check all consumption entries
        all.forEach(c => {
            // Find items in this consumption entry that match
            c.items.forEach(ci => {
                // We need to link back to the specific Issue.
                // If the Consumption Entry is linked to the same Job, it effectively consumes from the pool of issued items for that job.
                // But specific Issue tracking requires linking.
                // Simplified Logic: 
                // We look for consumption items that explicitly claim to be from this issue/batch.
                // Our ConsumedItem interface currently relies on 'itemCode' and 'batchNo'.
                // If multiple issues provided the same batch to the same job, it's fungible.
                if (ci.itemCode === itemCode && ci.batchNo === batchNo) {
                    total += ci.consumedQty;
                }
            });
        });
        return total;
    },

    // Get all consumption for a Job to calculate balances
    getConsumptionForJob: (jobCardNo: string): ConsumedItem[] => {
        const all = consumptionStorage.getAll();
        const relevant = all.filter(c => c.jobCardNo === jobCardNo);
        return relevant.flatMap(r => r.items);
    }
};
