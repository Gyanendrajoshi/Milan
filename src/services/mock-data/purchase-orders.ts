export interface PurchaseOrderItem {
    id: string;
    itemId?: string; // Master Item ID (Roll/Material ID)
    itemCode: string; // e.g., P00018
    itemName: string; // e.g., Art Paper 90 GSM...
    group: string; // Paper, Ink, etc.
    uom: string; // Sheets, Kg
    orderedQty: number;
    receivedQty: number; // For partial tracking
    pendingQty: number; // Derived or stored

    // Financials (Optional to support legacy data, though mostly filled now)
    rate?: number;
    rateType?: string;
    basicAmount?: number;
    taxAmount?: number;
    totalAmount?: number;
    hsnCode?: string;
    gstPercent?: number;
    cgstAmt?: number;
    sgstAmt?: number;
    igstAmt?: number;
    rollWidthMM?: number;
    rollTotalGSM?: number;
    purchaseUnit?: string;
    purchaseRate?: number;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    poDate: string; // ISO Date string
    supplierId: string; // Foreign Key to Supplier
    supplierName: string;
    grandTotal: number;
    status: "Pending" | "Partial" | "Closed" | "Cancelled";
    items: PurchaseOrderItem[];
}

export const mockPurchaseOrders: PurchaseOrder[] = [
    {
        id: "1",
        poNumber: "PO00008/25-26",
        poDate: "2025-12-25",
        supplierId: "3", // MK Enterprises (Local)
        supplierName: "MK Enterprises (Local)",
        grandTotal: 1100.00,
        status: "Pending",
        items: [
            {
                id: "pi-1",
                itemCode: "RF12345",
                itemName: "BOPP Gloss Film 12mic",
                group: "Roll",
                uom: "Kg",
                orderedQty: 100,
                receivedQty: 0,
                pendingQty: 100,
                // Financials
                rate: 180,
                rateType: "KG",
                basicAmount: 18000,
                taxAmount: 3240, // 18%
                totalAmount: 21240,
                hsnCode: "3920",
                gstPercent: 18
            },
            {
                id: "pi-2",
                itemCode: "M00004",
                itemName: "Black Ink",
                group: "Ink",
                uom: "Kg",
                orderedQty: 50,
                receivedQty: 0,
                pendingQty: 50,
                // Financials
                rate: 220,
                rateType: "KG",
                basicAmount: 11000,
                taxAmount: 1980, // 18%
                totalAmount: 12980,
                hsnCode: "3215",
                gstPercent: 18
            }
        ]
    },
    {
        id: "2",
        poNumber: "PO00007/25-26",
        poDate: "2025-12-25",
        supplierId: "3",
        supplierName: "MK Enterprises (Local)",
        grandTotal: 15120.00,
        status: "Partial",
        items: [
            {
                id: "pi-3",
                itemCode: "RF67890",
                itemName: "Met Pet Silver 12mic 800mm",
                group: "Roll",
                uom: "Kg",
                orderedQty: 1000,
                receivedQty: 510,
                pendingQty: 490,
                // Financials
                rate: 245,
                rateType: "KG",
                basicAmount: 245000,
                taxAmount: 44100, // 18%
                totalAmount: 289100,
                hsnCode: "3920",
                gstPercent: 18
            }
        ]
    },
    {
        id: "3",
        poNumber: "PO00005/25-26",
        poDate: "2025-12-25",
        supplierId: "3",
        supplierName: "MK Enterprises (Local)",
        grandTotal: 4101.30,
        status: "Pending",
        items: [
            {
                id: "pi-4",
                itemCode: "RF54321",
                itemName: "Met Pet Gold 12mic 525mm",
                group: "Roll",
                uom: "Kg",
                orderedQty: 1000,
                receivedQty: 0,
                pendingQty: 1000,
                // Financials
                rate: 260,
                rateType: "KG",
                basicAmount: 260000,
                taxAmount: 46800,
                totalAmount: 306800,
                hsnCode: "3920",
                gstPercent: 18
            }
        ]
    },
    {
        id: "4",
        poNumber: "PO00004/25-26",
        poDate: "2025-12-25",
        supplierId: "3",
        supplierName: "MK Enterprises (Local)",
        grandTotal: 4101.30,
        status: "Partial",
        items: [
            {
                id: "pi-5",
                itemCode: "RF54321",
                itemName: "Met Pet Gold 12mic 525mm",
                group: "Roll",
                uom: "Kg",
                orderedQty: 1000,
                receivedQty: 600,
                pendingQty: 400,
                // Financials
                rate: 260,
                rateType: "KG",
                basicAmount: 260000,
                taxAmount: 46800,
                totalAmount: 306800,
                hsnCode: "3920",
                gstPercent: 18
            }
        ]
    },
    {
        id: "5",
        poNumber: "PO00003/25-26",
        poDate: "2025-12-24",
        supplierId: "3",
        supplierName: "MK Enterprises (Local)",
        grandTotal: 69003.50,
        status: "Partial",
        items: [
            {
                id: "pi-6",
                itemCode: "RF99887",
                itemName: "BOPP Matte 12mic",
                group: "Roll",
                uom: "Kg",
                orderedQty: 2000,
                receivedQty: 1000,
                pendingQty: 1000,
                // Financials
                rate: 190,
                rateType: "KG",
                basicAmount: 380000,
                taxAmount: 68400,
                totalAmount: 448400,
                hsnCode: "3920",
                gstPercent: 18
            }
        ]
    },
    {
        id: "6",
        poNumber: "PO00002/25-26",
        poDate: "2025-12-23",
        supplierId: "3",
        supplierName: "MK Enterprises (Local)",
        grandTotal: 17700.00,
        status: "Closed",
        items: [
            {
                id: "pi-7",
                itemCode: "M00008",
                itemName: "Red Ink",
                group: "Ink",
                uom: "Kg",
                orderedQty: 50,
                receivedQty: 50,
                pendingQty: 0,
                // Financials
                rate: 300,
                rateType: "KG",
                basicAmount: 15000,
                taxAmount: 2700,
                totalAmount: 17700,
                hsnCode: "3215",
                gstPercent: 18
            }
        ]
    },
    {
        id: "7",
        poNumber: "PO00001/25-26",
        poDate: "2025-12-23",
        supplierId: "3",
        supplierName: "MK Enterprises (Local)",
        grandTotal: 11930.17,
        status: "Closed",
        items: [
            {
                id: "pi-8",
                itemCode: "M99999",
                itemName: "Solvent Ethyl",
                group: "Solvent",
                uom: "Kg",
                orderedQty: 100,
                receivedQty: 100,
                pendingQty: 0,
                // Financials
                rate: 85,
                rateType: "KG",
                basicAmount: 8500,
                taxAmount: 1020, // 12%
                totalAmount: 9520,
                hsnCode: "2901",
                gstPercent: 12
            }
        ]
    },
];
