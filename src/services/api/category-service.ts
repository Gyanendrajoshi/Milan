import { CategoryMaster } from "@/types/category-master";
import { CategoryMasterSchemaType } from "@/lib/validations/category-master";
import { categoryStorage } from "../storage/category-storage";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCategories(): Promise<CategoryMaster[]> {
    await delay(300);
    return categoryStorage.getAll();
}

export async function createCategory(data: CategoryMasterSchemaType): Promise<CategoryMaster> {
    await delay(400);
    const newCategory = categoryStorage.save(data);
    return newCategory;
}

export async function updateCategory(id: string, data: CategoryMasterSchemaType): Promise<CategoryMaster> {
    await delay(400);
    const existing = categoryStorage.getById(id);
    if (!existing) throw new Error("Category not found");

    const updated = categoryStorage.save({ ...existing, ...data, id });
    return updated;
}

export async function deleteCategory(id: string): Promise<void> {
    await delay(300);
    const existing = categoryStorage.getById(id);
    if (existing) categoryStorage.delete(id);
}
