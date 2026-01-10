import { grnStorage } from "./grn-storage";
import { rollStorage } from "./storage/roll-storage";
import { materialStorage } from "./storage/material-storage";
import { StockItem } from "@/types/stock";
import { differenceInDays } from "date-fns";

export const stockService = {
    getAllStock: (): StockItem[] => {
        const rawItems = grnStorage.getAllItems();

        return rawItems.map(item => {
            const receiptDate = new Date(item.grnDate);
            const now = new Date();
            const aging = differenceInDays(now, receiptDate);

            // Format Size (Width)
            let sizeStr = "-";
            if (item.rollWidth) sizeStr = `${item.rollWidth} mm`;

            // Units & Stock Logic
            // Use remainingQty if available (after issues), otherwise fallback to receivedQty
            const qty = item.remainingQty !== undefined ? item.remainingQty : (item.receivedQty || 0);

            // Status Logic
            let status: StockItem['status'] = "In Stock";
            if (qty <= 0) status = "Low Stock"; // Placeholder logic

            // Check Expiry
            if (item.expiryDate) {
                const expiry = new Date(item.expiryDate);
                if (now > expiry) status = "Expired";
            }

            // Fallback for missing Item Name
            let finalItemName = item.itemName;
            // Trim whitespace to avoid empty string checks failing if space exists
            if (!finalItemName || finalItemName.trim() === "" || finalItemName === "Unknown Item") {
                const normalizedItemCode = (item.itemCode || "").trim().toLowerCase();

                // 1. Try Roll Master (Flexible Match)
                const rollMaster = rollStorage.getAll().find(r =>
                    (r.itemCode || "").trim().toLowerCase() === normalizedItemCode
                );

                if (rollMaster) {
                    finalItemName = rollMaster.itemName;
                } else {
                    // 2. Try Material Master (Flexible Match)
                    const materialMaster = materialStorage.getAll().find(m =>
                        (m.itemCode || "").trim().toLowerCase() === normalizedItemCode
                    );
                    if (materialMaster) {
                        finalItemName = materialMaster.itemName;
                    }
                }
            }

            return {
                id: item.id,
                itemCode: item.itemCode,
                itemName: finalItemName,
                size: sizeStr,
                gsm: item.rollGSM || 0,
                uom: item.uom,
                stockQty: qty,
                initialQty: qty, // For now same
                autoBatchNo: item.batchNo,
                supplierBatchNo: item.supplierBatchNo || "-",
                receiptDate: item.grnDate,
                expiryDate: item.expiryDate,
                agingDays: aging,
                status: status
            };
        });
    }
};
