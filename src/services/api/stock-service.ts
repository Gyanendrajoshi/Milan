import { StockItem } from "@/types/stock-master";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initial Mock Stock
export const mockStock: StockItem[] = [
    {
        id: "STK-001",
        itemCode: "R001",
        itemName: "Polyester Film 12 Mic",
        category: "Roll",
        quantity: 500,
        uom: "Kg",
        weightKg: 500,
        runningMtr: 12000,
        sqMtr: 9500,
        widthMM: 800,
        gsm: 12,
        batchNo: "BATCH-241201-1",
        status: "In-Stock",
        receivedDate: "2024-12-01",
    },
    {
        id: "STK-002",
        itemCode: "M001",
        itemName: "Red Ink",
        category: "Ink",
        quantity: 50,
        uom: "Kg",
        batchNo: "BATCH-INK-01",
        status: "In-Stock",
        receivedDate: "2024-12-10",
    }
];

export async function getStock(): Promise<StockItem[]> {
    await delay(300);
    return [...mockStock];
}

export async function addStockItems(items: StockItem[]): Promise<void> {
    await delay(400);
    mockStock.unshift(...items);
}
