import { SalesPersonMaster } from "@/types/sales-person-master";
import { salesPersonStorage } from "../storage/sales-person-storage";

export async function getSalesPersons(): Promise<SalesPersonMaster[]> {
    // No artificial delay to prevent empty states
    return salesPersonStorage.getAll();
}

export async function getSalesPersonById(id: string): Promise<SalesPersonMaster | undefined> {
    return salesPersonStorage.getById(id);
}
