export interface CategoryMaster {
    id: string;
    name: string;
    description?: string;
    processIds?: string[]; // New: Multiple processes
    processId?: string; // Deprecated: keeping for compatibility during migration
    processName?: string; // For display
    categoryName?: string; // Legacy support
    createdAt?: string;
    updatedAt?: string;
}
