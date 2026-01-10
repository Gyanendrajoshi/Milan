import { SlittingJob } from "@/types/jumbo-slitting";
import { StockItem } from "@/types/stock-master";
import { grnStorage } from "../grn-storage";
import { stockStorage } from "./stock-storage";

const STORAGE_KEY = "MILAN_SLITTING";

export const slittingStorage = {
    getAll: (): SlittingJob[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse Slitting Jobs", e);
            return [];
        }
    },

    getById: (id: string): SlittingJob | undefined => {
        const list = slittingStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: Omit<SlittingJob, "id" | "createdAt" | "updatedAt">): SlittingJob => {
        const list = slittingStorage.getAll();
        const now = new Date().toISOString();

        // Financial Year Logic (April to March)
        const dateObj = new Date();
        const month = dateObj.getMonth(); // 0-11 (April is 3)
        const year = dateObj.getFullYear();

        let fyStart = month >= 3 ? year : year - 1;
        let fyEnd = fyStart + 1;
        const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`; // e.g., "25-26"

        // ID Format: SL00001/25-26
        const prefix = "SL";
        const suffix = `/${fyString}`;

        const matchingJobs = list.filter(j => j.id.endsWith(suffix) && j.id.startsWith(prefix));
        let nextSeq = 1;

        if (matchingJobs.length > 0) {
            const maxSeq = Math.max(...matchingJobs.map(j => {
                const str = j.id.replace(prefix, "").replace(suffix, "");
                return parseInt(str) || 0;
            }));
            nextSeq = maxSeq + 1;
        }

        const id = `${prefix}${nextSeq.toString().padStart(5, '0')}${suffix}`;

        // Update Output Roll Batch Numbers with actual job ID
        const outputRolls = data.outputRolls.map((roll, idx) => ({
            ...roll,
            slittingJobId: id,
            batchNo: `${data.inputRoll.batchNo}-SL${(idx + 1).toString().padStart(2, '0')}`
        }));

        const newJob: SlittingJob = {
            ...data,
            id,
            outputRolls,
            createdAt: now,
            updatedAt: now
        };

        list.unshift(newJob); // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        // Stock Updates
        slittingStorage.executeStockUpdates(newJob);

        return newJob;
    },

    delete: (id: string): void => {
        const list = slittingStorage.getAll();
        const jobToDelete = list.find(j => j.id === id);

        if (jobToDelete) {
            // Reverse stock operations
            slittingStorage.reverseStockUpdates(jobToDelete);
        }

        const newList = list.filter(j => j.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    },

    // Stock Update Logic
    executeStockUpdates: (job: SlittingJob): void => {
        // Calculate actual consumed quantity = Total Output + Wastage
        const totalOutputKg = job.outputRolls.reduce((sum, roll) => sum + roll.outputKg, 0);
        const consumedKg = totalOutputKg + (job.wastageKg || 0);

        // 1. Reduce Input Roll Stock
        // Check if input is from GRN or Stock
        if (job.inputRoll.grnId && job.inputRoll.grnId !== "STOCK") {
            // Input is from GRN - reduce GRN stock
            // We need a way to reduce ONLY length/weight without affecting width? 
            // GRN storage logic might be simple "quantity" reduction.
            grnStorage.updateStock(
                job.inputRoll.grnId,
                job.inputRoll.grnItemId,
                consumedKg // This just reduces "ReceivedQty". For Rolls, we assume Qty = Kg.
            );
        } else {
            // Input is from Stock (slitting output) - reduce stock item
            const stockItem = stockStorage.getById(job.inputRoll.grnItemId);
            if (stockItem) {
                // Determine consumption
                const processRM = job.inputRoll.inputProcessRM || 0;

                // Calculate percentage of length used if we want to be exact? 
                // Or simply calculate the Remaining RM and derive new Weight.
                // Assuming we stored 'runningMtr' in stockItem.

                let remainingRM = (stockItem.runningMtr || 0) - processRM;
                if (remainingRM < 0) remainingRM = 0; // Guard

                // Calculate new Weight based on Remaining RM (fixing the Width)
                // NewWeight = (RemainingRM * Width * GSM) / ...
                // OR simpler: OriginalWeight - ConsumedWeight
                // Note: ConsumedWeight is based on Full Width * Process Length (calculated as inputKgProcessed in calculateWastage)
                // We should ensure we reuse that logic or replicate it.

                // Let's rely on Kg for now as primary if RM is missing, but for Rolls RM is king.
                // If remainingRM is very small (~0), treat as depleted.

                if (remainingRM < 1) { // < 1 meter usually effectively 0
                    // Fully consumed - delete stock item
                    stockStorage.delete(stockItem.id);
                } else {
                    // Update Item
                    // We need to re-calculate weight for the remaining length
                    // We can estimate it proportionally: (RemainingRM / OldRM) * OldWeight
                    const oldRM = stockItem.runningMtr || 1;
                    const ratio = remainingRM / oldRM;
                    const newWeight = (stockItem.weightKg || 0) * ratio;

                    const updatedItem: StockItem = {
                        ...stockItem,
                        quantity: newWeight, // Stock usually tracks Qty as primary weight for rolls?
                        weightKg: newWeight,
                        runningMtr: remainingRM,
                        sqMtr: (remainingRM * (stockItem.widthMM || 0)) / 1000
                    };
                    stockStorage.save(updatedItem);
                }
            }
        }

        // 2. Create Output Roll Stock Entries
        const outputStockItems: StockItem[] = job.outputRolls.map((roll, idx) => ({
            id: `${job.id}-OUT-${idx + 1}`,
            itemCode: roll.itemCode,
            itemName: roll.itemName,
            category: "Roll" as const,
            quantity: roll.outputKg,
            uom: "Kg",
            runningMtr: roll.outputRM,
            sqMtr: roll.outputSqMtr,
            weightKg: roll.outputKg,
            widthMM: roll.outputWidth,
            gsm: roll.outputGSM,
            batchNo: roll.batchNo,
            status: "In-Stock" as const,
            receivedDate: job.slittingDate,
            // Link to slitting job
            location: `Slitting: ${job.id}`,
            // Store QR code data
            qrCodeData: roll.qrCodeData
        }));

        stockStorage.addItems(outputStockItems);
    },

    // Reverse Stock Updates (for delete)
    reverseStockUpdates: (job: SlittingJob): void => {
        // Calculate actual consumed quantity = Total Output + Wastage
        const totalOutputKg = job.outputRolls.reduce((sum, roll) => sum + roll.outputKg, 0);
        const consumedKg = totalOutputKg + (job.wastageKg || 0);

        // 1. Restore Input Roll Stock
        // Check if input was from GRN or Stock
        if (job.inputRoll.grnId && job.inputRoll.grnId !== "STOCK") {
            // Input was from GRN - restore GRN stock
            grnStorage.restoreStock(job.inputRoll.grnItemId, consumedKg);
        } else {
            // Input was from Stock - restore stock item
            const existingStockItem = stockStorage.getById(job.inputRoll.grnItemId);

            if (existingStockItem) {
                // Stock item still exists - add back consumed quantity
                const restoredItem: StockItem = {
                    ...existingStockItem,
                    quantity: (existingStockItem.quantity || 0) + consumedKg,
                    weightKg: (existingStockItem.weightKg || 0) + consumedKg,
                    // Proportionally restore RM and SqMtr
                    runningMtr: existingStockItem.runningMtr && job.inputRoll.inputRM
                        ? existingStockItem.runningMtr + ((consumedKg * job.inputRoll.inputRM) / job.inputRoll.inputKg)
                        : undefined,
                    sqMtr: existingStockItem.sqMtr && job.inputRoll.inputSqMtr
                        ? existingStockItem.sqMtr + ((consumedKg * job.inputRoll.inputSqMtr) / job.inputRoll.inputKg)
                        : undefined,
                };
                stockStorage.save(restoredItem);
            } else {
                // Stock item was fully consumed - recreate it
                const recreatedItem: StockItem = {
                    id: job.inputRoll.grnItemId,
                    itemCode: job.inputRoll.itemCode,
                    itemName: job.inputRoll.itemName,
                    category: "Roll" as const,
                    quantity: consumedKg,
                    uom: job.inputRoll.uom,
                    runningMtr: (consumedKg * job.inputRoll.inputRM) / job.inputRoll.inputKg,
                    sqMtr: (consumedKg * job.inputRoll.inputSqMtr) / job.inputRoll.inputKg,
                    weightKg: consumedKg,
                    widthMM: job.inputRoll.inputWidth,
                    gsm: job.inputRoll.inputGSM,
                    batchNo: job.inputRoll.batchNo,
                    status: "In-Stock" as const,
                    receivedDate: job.slittingDate,
                };
                stockStorage.save(recreatedItem);
            }
        }

        // 2. Remove Output Roll Stock Entries
        job.outputRolls.forEach((_, idx) => {
            const stockId = `${job.id}-OUT-${idx + 1}`;
            stockStorage.delete(stockId);
        });
    }
};
