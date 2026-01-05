import { GRN } from "@/types/grn-master";

const STORAGE_KEY = "MILAN_GRNS";

// Initial Seed Data (Migrated from grn-service.ts)
const DEFAULT_GRNS: GRN[] = [
    {
        id: "grn-001",
        grnNumber: "GRN00001/25-26",
        grnDate: "2025-12-26T10:00:00Z",
        supplierId: "sup-001",
        supplierName: "MK Enterprises",
        supplierChallanNo: "1111111",
        challanDate: "2025-12-25T00:00:00Z",
        receivedBy: "admin",
        status: "Submitted",
        createdAt: "2025-12-26T10:00:00Z", // Fixed static date for consistency
        updatedAt: "2025-12-26T10:00:00Z",
        items: [
            {
                id: "item-001",
                poId: "po-001",
                poItemId: "pi-003",
                itemCode: "FLM002",
                itemName: "Met Pet Silver 12mic 800mm",
                poNumber: "PO00007/25-26",
                poDate: "2025-12-25T00:00:00Z",
                orderedQty: 1000,
                uom: "Kg",
                receivedQty: 500,
                receivedKg: 500,
                receivedRM: 1000,
                batchNo: "GRN26-P00010-1",
                expiryDate: "2026-12-25T00:00:00Z",
                noOfRolls: 5
            }
        ]
    },
    {
        id: "grn-002",
        grnNumber: "GRN00002/25-26",
        grnDate: "2025-12-26T11:00:00Z",
        supplierId: "sup-001",
        supplierName: "MK Enterprises",
        supplierChallanNo: "11111",
        challanDate: "2025-12-26T00:00:00Z",
        receivedBy: "admin",
        status: "Submitted",
        createdAt: "2025-12-26T11:00:00Z",
        updatedAt: "2025-12-26T11:00:00Z",
        items: [
            {
                id: "item-002",
                poId: "po-002",
                poItemId: "pi-004",
                itemCode: "FLM003",
                itemName: "Met Pet Gold 12mic 525mm",
                poNumber: "PO00005/25-26",
                poDate: "2025-12-25T00:00:00Z",
                orderedQty: 1000,
                uom: "Kg",
                receivedQty: 950,
                receivedKg: 950,
                batchNo: "GRN26-P00007-1",
                expiryDate: "2026-12-25T00:00:00Z",
                noOfRolls: 10
            }
        ]
    },
];

export const grnStorage = {
    getAll: (): GRN[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_GRNS;
        } catch (e) {
            console.error("Failed to parse GRNs", e);
            return DEFAULT_GRNS;
        }
    },

    getById: (id: string): GRN | undefined => {
        const list = grnStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: GRN): GRN => {
        const list = grnStorage.getAll();
        const index = list.findIndex(item => item.id === data.id);

        if (index !== -1) {
            list[index] = data;
        } else {
            list.unshift(data); // Add new to top
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return data;
    }
};
