import { GRN } from "@/types/grn-master";
import { addStockItems } from "./stock-service";
import { StockItem } from "@/types/stock-master";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockGRNs: GRN[] = [
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
                receivedRM: 1000, // Mock calc: 500kg / (0.8m * 0.02kg/sqm... wait just mock numbers)
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

export async function getGRNs(): Promise<GRN[]> {
    await delay(300);
    return [...mockGRNs];
}

export async function getGRNById(id: string): Promise<GRN | undefined> {
    await delay(200);
    return mockGRNs.find((g) => g.id === id);
}

export async function createGRN(data: Omit<GRN, "id" | "createdAt" | "updatedAt">): Promise<GRN> {
    await delay(500);

    // Auto-generate GRN Number: GRN{SEQ}/{YY}-{YY+1} (Financial Year)
    // Example: GRN00008/25-26
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    let fy = "";
    if (month >= 3) { // April onwards
        fy = `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
    } else { // Jan-March
        fy = `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
    }
    const seq = (mockGRNs.length + 1).toString().padStart(5, '0');
    const grnNumber = data.grnNumber || `GRN${seq}/${fy}`;

    const newGRN: GRN = {
        id: crypto.randomUUID(),
        ...data,
        grnNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    // --- STOCK UPDATE LOGIC ---
    const stockItemsTBE: StockItem[] = [];

    newGRN.items.forEach((item, index) => {
        const count = item.noOfRolls || 1;

        // If >1 Rolls, we split the TOTAL Weight/RM into individual rolls
        // Assuming the `receivedKg` in GRN Item is TOTAL received.
        const weightPerRoll = (item.receivedKg || item.receivedQty || 0) / count;
        const rmPerRoll = (item.receivedRM || 0) / count;
        const sqMtrPerRoll = (item.receivedSqMtr || 0) / count;

        for (let i = 1; i <= count; i++) {
            // Traceability Batch No: GRNNo-ItemCode-RowNo-RollIdx
            // Example: GRN0008-P00018-1-01
            const batchNo = `${newGRN.grnNumber}-${item.itemCode}-${index + 1}-${i.toString().padStart(2, '0')}`;

            stockItemsTBE.push({
                id: crypto.randomUUID(),
                grnId: newGRN.id,
                poId: item.poId,
                itemCode: item.itemCode,
                itemName: item.itemName,
                category: ((item.receivedRM || 0) > 0) ? "Roll" : "Material", // Simple heuristic

                quantity: parseFloat(weightPerRoll.toFixed(2)),
                uom: item.uom.toLowerCase() === "sheets" ? "Sheets" : "Kg", // Normalize

                runningMtr: parseFloat(rmPerRoll.toFixed(2)) || undefined,
                sqMtr: parseFloat(sqMtrPerRoll.toFixed(2)) || undefined,
                weightKg: parseFloat(weightPerRoll.toFixed(2)) || undefined,

                batchNo: batchNo,

                status: "In-Stock",
                receivedDate: newGRN.grnDate,
                expiryDate: item.expiryDate
            });
        }
    });

    await addStockItems(stockItemsTBE);
    // --------------------------

    mockGRNs.unshift(newGRN); // Add to top
    return newGRN;
}
