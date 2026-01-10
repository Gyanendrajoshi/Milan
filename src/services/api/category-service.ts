import { CategoryMaster } from "@/types/category-master";

const API_BASE_URL = "http://localhost:5005/api/Categories";

export const getCategories = async (): Promise<CategoryMaster[]> => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
};

export const createCategory = async (category: any): Promise<CategoryMaster> => {
    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return await res.json();
};

export const updateCategory = async (id: string, category: any): Promise<CategoryMaster> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return await res.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete category");
};
