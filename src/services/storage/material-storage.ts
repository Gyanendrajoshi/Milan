import { Material } from "@/types/material-master";
import { grnStorage } from "../grn-storage";
import { issueStorage } from "../issue-storage";
import { GRNItem } from "@/types/grn-master";
import { MaterialIssue, IssuedItem } from "@/types/material-issue";

const STORAGE_KEY = "MILAN_MATERIALS";

export const materialStorage = {
    getAll: (): Material[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse materials", e);
            return [];
        }
    },

    getById: (id: string): Material | undefined => {
        const list = materialStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<Material, "id" | "createdAt" | "updatedAt"> & { id?: string }): Material => {
        const list = materialStorage.getAll();

        // 1. Duplicate Check (Name or Item Code)
        const duplicate = list.find(item =>
            (item.itemName.toLowerCase() === data.itemName.toLowerCase() ||
                item.itemCode.toLowerCase() === data.itemCode.toLowerCase()) &&
            item.id !== data.id
        );

        if (duplicate) {
            throw new Error(`Duplicate Material: Item Name '${data.itemName}' or Code '${data.itemCode}' already exists.`);
        }

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: Material = {
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
        const newItem: Material = {
            ...data,
            id: `MAT${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Material;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        // 2. Referential Integrity Check
        // Check GRNs
        const grns = grnStorage.getAllItems(); // Returns flat list of items
        const usedInGrn = grns.some((item: GRNItem) => item.itemCode === id || item.itemCode === materialStorage.getById(id)?.itemCode);

        const material = materialStorage.getById(id);
        if (!material) return;

        if (usedInGrn || grns.some((g: GRNItem) => g.itemCode === material.itemCode)) {
            throw new Error("Cannot delete: Material is used in existing GRN records.");
        }

        // Check Issues
        const issues = issueStorage.getAll();
        const usedInIssue = issues.some((issue: MaterialIssue) => issue.items.some((i: IssuedItem) => i.itemCode === material.itemCode || i.itemName === material.itemName));
        if (usedInIssue) {
            throw new Error("Cannot delete: Material is used in existing Issue records.");
        }

        let list = materialStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
