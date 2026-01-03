import type { PurchaseOrder, PurchaseOrderItem } from "@/services/mock-data/purchase-orders";

export type { PurchaseOrder, PurchaseOrderItem };

const STORAGE_KEY = "MILAN_PURCHASE_ORDERS";

export const poStorage = {
    getAll: (): PurchaseOrder[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse Purchase Orders", e);
            return [];
        }
    },

    getById: (id: string): PurchaseOrder | undefined => {
        const list = poStorage.getAll();
        return list.find((item: PurchaseOrder) => item.id === id);
    },

    save: (data: Omit<PurchaseOrder, "id"> & { id?: string }): PurchaseOrder => {
        const list = poStorage.getAll();
        const isUpdate = !!data.id;
        let savedItem: PurchaseOrder;

        if (isUpdate && data.id) {
            const index = list.findIndex((item: PurchaseOrder) => item.id === data.id);
            if (index !== -1) {
                savedItem = {
                    ...list[index],
                    ...data
                } as PurchaseOrder;
                list[index] = savedItem;
            } else {
                // Fallback create
                savedItem = {
                    ...data,
                    id: data.id
                } as PurchaseOrder;
                list.push(savedItem);
            }
        } else {
            // Create New
            const newId = `PO-${Date.now()}`;
            // Generate PO Number if not provided
            const year = new Date().getFullYear().toString().slice(-2);
            const seq = (list.length + 1).toString().padStart(5, '0');
            const poNum = data.poNumber || `PO${seq}/${year}-${(parseInt(year) + 1).toString().slice(-2)}`;

            savedItem = {
                ...data,
                id: newId,
                poNumber: poNum
            } as PurchaseOrder;
            list.push(savedItem);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return savedItem;
    },

    delete: (id: string) => {
        let list = poStorage.getAll();
        list = list.filter((item: PurchaseOrder) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    // Update PO status when GRN is created
    updateStatus: (poId: string, receivedItems: { itemId: string, receivedQty: number }[]) => {
        const po = poStorage.getById(poId);
        if (!po) return;

        // Update received quantities
        receivedItems.forEach((received: { itemId: string, receivedQty: number }) => {
            const item = po.items.find((i: PurchaseOrderItem) => i.id === received.itemId);
            if (item) {
                item.receivedQty = (item.receivedQty || 0) + received.receivedQty;
                item.pendingQty = item.orderedQty - item.receivedQty;
            }
        });

        // Determine new status
        const allClosed = po.items.every((item: PurchaseOrderItem) => item.pendingQty === 0);
        const anyReceived = po.items.some((item: PurchaseOrderItem) => item.receivedQty > 0);

        if (allClosed) {
            po.status = "Closed";
        } else if (anyReceived) {
            po.status = "Partial";
        }

        poStorage.save(po);
    },

    // Get pending POs for GRN
    getPending: (): PurchaseOrder[] => {
        return poStorage.getAll().filter((po: PurchaseOrder) =>
            po.status === "Pending" || po.status === "Partial"
        );
    }
};
