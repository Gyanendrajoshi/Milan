import { Supplier } from "@/types/client-supplier";
import { grnStorage } from "../grn-storage";
import { poStorage } from "../po-storage";
import { GRN } from "@/types/grn-master";
import { PurchaseOrder } from "@/services/mock-data/purchase-orders";

const STORAGE_KEY = "MILAN_SUPPLIERS";

export const supplierStorage = {
    getAll: (): Supplier[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse suppliers", e);
            return [];
        }
    },

    getById: (id: string): Supplier | undefined => {
        const list = supplierStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<Supplier, "id" | "createdAt" | "updatedAt"> & { id?: string }): Supplier => {
        const list = supplierStorage.getAll();

        // 1. Duplicate Check
        const duplicate = list.find(item =>
            item.supplierName.toLowerCase() === data.supplierName.toLowerCase() &&
            item.id !== data.id
        );

        if (duplicate) {
            throw new Error(`Duplicate Supplier: '${data.supplierName}' already exists.`);
        }

        if (data.id) {
            // Update existing
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                const updated: Supplier = {
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
        const newItem: Supplier = {
            ...data,
            id: `SUP${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Supplier;

        list.push(newItem);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newItem;
    },

    delete: (id: string) => {
        // 2. Referential Integrity Check
        const supplier = supplierStorage.getById(id);
        if (!supplier) return;

        // Check GRNs
        const grns = grnStorage.getAll();
        const usedInGrn = grns.some((g: GRN) => g.supplierName === supplier.supplierName || (g as any).supplierId === id);
        if (usedInGrn) {
            throw new Error("Cannot delete: Supplier is used in existing GRN records.");
        }

        // Check POs
        const pos = poStorage.getAll();
        const usedInPo = pos.some((po: PurchaseOrder) => po.supplierName === supplier.supplierName || po.supplierId === id);
        if (usedInPo) {
            throw new Error("Cannot delete: Supplier is used in existing Purchase Orders.");
        }

        let list = supplierStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
