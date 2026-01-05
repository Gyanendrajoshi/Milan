import { StockItem } from "@/types/stock-master";
import { stockStorage } from "@/services/storage/stock-storage";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getStock(): Promise<StockItem[]> {
    // await delay(300); // Artificial delay removed for better UX
    return stockStorage.getAll();
}

export async function addStockItems(items: StockItem[]): Promise<void> {
    // await delay(400); // Artificial delay removed
    stockStorage.addItems(items);
}
