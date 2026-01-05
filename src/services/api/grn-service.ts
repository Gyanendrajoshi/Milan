import { GRN } from "@/types/grn-master";
import { StockItem } from "@/types/stock-master";
import { grnStorage } from "@/services/storage/grn-storage";
import { stockStorage } from "@/services/storage/stock-storage";

export async function getGRNs(): Promise<GRN[]> {
    return grnStorage.getAll();
}

export async function getGRNById(id: string): Promise<GRN | undefined> {
    return grnStorage.getById(id);
}

export async function createGRN(data: Omit<GRN, "id" | "createdAt" | "updatedAt">): Promise<GRN> {

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

    const allGRNs = grnStorage.getAll();
    const seq = (allGRNs.length + 1).toString().padStart(5, '0');
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

    stockStorage.addItems(stockItemsTBE);
    // --------------------------

    grnStorage.save(newGRN);
    return newGRN;
}
