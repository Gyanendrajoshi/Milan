import { MaterialIssue } from "@/types/material-issue";
import { grnStorage } from "@/services/grn-storage";

const STORAGE_KEY = "MILAN_ISSUES";

export const issueStorage = {
    getAll: (): MaterialIssue[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse Issues", e);
            return [];
        }
    },

    save: (data: Omit<MaterialIssue, "id" | "createdAt" | "updatedAt">): MaterialIssue => {
        const list = issueStorage.getAll();
        const now = new Date().toISOString();

        // Financial Year Logic
        const dateObj = new Date();
        const month = dateObj.getMonth(); // 0-11 (April is 3)
        const year = dateObj.getFullYear();

        let fyStart = month >= 3 ? year : year - 1;
        let fyEnd = fyStart + 1;
        const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`; // e.g., "25-26"

        // Find Sequence for this FY
        // Format: MI00001/25-26
        const prefix = "MI";
        const suffix = `/${fyString}`;

        const matchingIssues = list.filter(i => i.id.endsWith(suffix) && i.id.startsWith(prefix));
        let nextSeq = 1;

        if (matchingIssues.length > 0) {
            const maxSeq = Math.max(...matchingIssues.map(i => {
                // Extract 5 digits between MI and /
                const str = i.id.replace(prefix, "").replace(suffix, "");
                return parseInt(str) || 0;
            }));
            nextSeq = maxSeq + 1;
        }

        const id = `${prefix}${nextSeq.toString().padStart(5, '0')}${suffix}`;

        const newIssue: MaterialIssue = {
            ...data,
            id,
            createdAt: now,
            updatedAt: now
        };

        list.unshift(newIssue); // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newIssue;
    },

    getByJob: (jobId: string): MaterialIssue[] => {
        const list = issueStorage.getAll();
        return list.filter(i => i.jobId === jobId);
    },

    delete: (id: string): void => {
        const list = issueStorage.getAll();
        // Find the issue to be deleted
        const issueToDelete = list.find(i => i.id === id);

        if (issueToDelete && issueToDelete.items) {
            // Restore stock for each item
            issueToDelete.items.forEach(item => {
                // item.grnItemId is the ID we need. 
                // Note: In `IssueDialog`, we save `grnItemId: item.id`.
                grnStorage.restoreStock(item.grnItemId, item.issuedQty);
            });
        }

        const newList = list.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    },

    getDepartments: (): string[] => {
        const list = issueStorage.getAll();
        const depts = new Set<string>();
        list.forEach(i => {
            if (i.department && i.department.trim()) {
                depts.add(i.department.trim());
            }
        });
        return Array.from(depts).sort();
    }
};
