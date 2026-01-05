import { MachineMaster } from "@/types/machine-master";
import { machineStorage } from "../storage/machine-storage";

export async function getMachines(): Promise<MachineMaster[]> {
    // No artificial delay to prevent empty states
    return machineStorage.getAll();
}

export async function getMachineById(id: string): Promise<MachineMaster | undefined> {
    return machineStorage.getById(id);
}
