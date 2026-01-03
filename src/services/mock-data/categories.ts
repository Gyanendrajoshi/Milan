import { CategoryMaster } from "@/types/category-master";

export const mockCategories: CategoryMaster[] = [
    {
        id: "cat_1",
        name: "Laminated Pouches",
        description: "Standard laminated pouch production",
        processIds: ["1", "2"], // Printing, Laminating
        createdAt: new Date().toISOString(),
    }
];
