import { StockItem } from "@/types/stock-master";

const STORAGE_KEY = "MILAN_STOCK";

// Initial Seed Data (Migrated from stock-service.ts)
const DEFAULT_STOCK: StockItem[] = [
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

export const stockStorage = {
    getAll: (): StockItem[] => {
        if (typeof window === "undefined") return [];
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : DEFAULT_STOCK;
        } catch (e) {
            console.error("Failed to parse Stock Items", e);
            return DEFAULT_STOCK;
        }
    },

    getById: (id: string): StockItem | undefined => {
        const list = stockStorage.getAll();
        return list.find(item => item.id === id);
    },

    save: (data: StockItem): StockItem => {
        const list = stockStorage.getAll();
        const index = list.findIndex(item => item.id === data.id);

        if (index !== -1) {
            list[index] = data;
        } else {
            list.push(data);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return data;
    },

    addItems: (items: StockItem[]): void => {
        const list = stockStorage.getAll();
        list.unshift(...items); // Add new items to the top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    delete: (id: string) => {
        const list = stockStorage.getAll();
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};
