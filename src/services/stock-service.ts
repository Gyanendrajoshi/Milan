import { grnStorage } from "./grn-storage";
import { StockItem } from "@/types/stock";
import { differenceInDays, parseISO } from "date-fns";

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

            return {
                id: item.id,
                itemCode: item.itemCode,
                itemName: item.itemName,
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
