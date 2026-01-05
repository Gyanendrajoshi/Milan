import { UserMaster, UserMasterFormValues } from "@/types/user-master";
import { userStorage } from "../storage/user-storage";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUserMasterList(): Promise<UserMaster[]> {
    await delay(300);
    return userStorage.getAll();
}

export async function getUserById(id: string): Promise<UserMaster | null> {
    await delay(200);
    return userStorage.getById(id) || null;
}

export async function saveUserMaster(data: UserMasterFormValues & { id?: string }): Promise<UserMaster> {
    await delay(400);
    return userStorage.save(data);
}

export async function deleteUserMaster(id: string): Promise<void> {
    await delay(300);
    userStorage.delete(id);
}
