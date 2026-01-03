import { GRN, GRNItem } from "@/types/grn-master";

const STORAGE_KEY = "MILAN_GRNS";

export const grnStorage = {
    getAll: (): GRN[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse GRNs", e);
            return [];
        }
    },

    getById: (id: string): GRN | undefined => {
        const list = grnStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<GRN, "id" | "createdAt" | "updatedAt"> & { id?: string }): GRN => {
        const list = grnStorage.getAll();
        const isUpdate = !!data.id;
        const now = new Date().toISOString();
        let savedItem: GRN;

        if (isUpdate && data.id) {
            const index = list.findIndex(item => item.id === data.id);
            if (index !== -1) {
                savedItem = {
                    ...list[index],
                    ...data,
                    updatedAt: now
                } as GRN;
                list[index] = savedItem;
            } else {
                // Fallback create
                savedItem = {
                    ...data,
                    id: data.id,
                    createdAt: now,
                    updatedAt: now,
                    status: "Submitted"
                } as GRN;
                list.push(savedItem);
            }
        } else {
            // Create New
            const newId = `GRN-${Date.now()}`;
            // Generate GRN Number if not provided
            // Generate GRN Number: Format GRN00001-25
            const seq = (list.length + 1).toString().padStart(5, '0');
            const yy = new Date().getFullYear().toString().slice(-2);
            const grnNum = data.grnNumber || `GRN${seq}-${yy}`;

            savedItem = {
                ...data,
                id: newId,
                grnNumber: grnNum,
                status: "Submitted",
                createdAt: now,
                updatedAt: now,
                // Fix Batch Numbers: Replace placeholder with actual GRN Number
                items: data.items.map(item => ({
                    ...item,
                    batchNo: item.batchNo ? item.batchNo.replace("GRNXXXXX", grnNum) : item.batchNo,
                    remainingQty: item.receivedQty, // Init Stock
                    status: 'Available'
                }))
            } as GRN;
            list.push(savedItem);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return savedItem;
    },

    delete: (id: string) => {
        let list = grnStorage.getAll();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    // Stock Helper: Get all items across all GRNs
    getAllItems: (): (GRNItem & { grnDate: string, supplierName: string })[] => {
        const grns = grnStorage.getAll();
        const allItems: (GRNItem & { grnDate: string, supplierName: string })[] = [];

        grns.forEach(grn => {
            grn.items.forEach(item => {
                allItems.push({
                    ...item,
                    grnDate: grn.grnDate,
                    supplierName: grn.supplierName
                });
            });
        });

        return allItems;
    },

    // Get Item by Batch (For QR Scan)
    getItemByBatch: (batchNo: string): (GRNItem & { grnId: string }) | undefined => {
        const grns = grnStorage.getAll();
        for (const grn of grns) {
            const item = grn.items.find(i => i.batchNo === batchNo);
            if (item) {
                return { ...item, grnId: grn.id };
            }
        }
        return undefined;
    },

    // Update Stock (Deduct Qty)
    updateStock: (grnId: string, itemId: string, qtyDeducted: number) => {
        const list = grnStorage.getAll();
        const grnIndex = list.findIndex(g => g.id === grnId);
        if (grnIndex === -1) return;

        const grn = list[grnIndex];
        const itemIndex = grn.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = grn.items[itemIndex];
        // Initialize remainingQty if missing (migration)
        const currentStock = item.remainingQty ?? item.receivedQty;
        const newStock = currentStock - qtyDeducted;

        // Update Item
        grn.items[itemIndex] = {
            ...item,
            remainingQty: newStock < 0 ? 0 : newStock,
            status: newStock <= 0 ? 'Consumed' : 'Partially Issued'
        };

        list[grnIndex] = grn;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    // Restore Stock (Add Qty back on Delete Issue)
    restoreStock: (itemId: string, qtyRestored: number) => {
        // Note: We need to find the GRN first. We can search by ItemID across all.
        const list = grnStorage.getAll();

        // Find GRN containing this item
        const grnIndex = list.findIndex(g => g.items.some(i => i.id === itemId));
        if (grnIndex === -1) return;

        const grn = list[grnIndex];
        const itemIndex = grn.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = grn.items[itemIndex];
        const currentStock = item.remainingQty ?? 0;
        const newStock = currentStock + qtyRestored;
        const maxStock = item.receivedQty;

        // Update Item
        grn.items[itemIndex] = {
            ...item,
            remainingQty: newStock > maxStock ? maxStock : newStock,
            status: (newStock >= maxStock) ? 'Available' : 'Partially Issued'
        };

        list[grnIndex] = grn;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
