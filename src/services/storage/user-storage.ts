import { UserMaster, UserMasterFormValues } from "@/types/user-master";

const STORAGE_KEY = "MILAN_USER_MASTER";

const getList = (): UserMaster[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEY);
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to parse user master data", e);
        return [];
    }
};

export const userStorage = {
    getAll: (): UserMaster[] => {
        return getList();
    },

    getById: (id: string): UserMaster | undefined => {
        const list = getList();
        return list.find(item => item.id === id);
    },

    save: (data: UserMasterFormValues & { id?: string }): UserMaster => {
        const list = getList();
        const isUpdate = !!data.id;
        let savedItem: UserMaster;

        // Separate password from the main object if needed for real backend, 
        // here we just simulate saving the user details.
        // In a real app, password should never be stored in local storage plain text.
        // We will just store the metadata for this mock.

        const { password, reTypePassword, ...userData } = data;

        if (isUpdate) {
            const index = list.findIndex(item => item.id === data.id);
            if (index === -1) {
                // Change to create if not found (should not happen usually)
                const newId = `USR${Math.floor(Math.random() * 10000)}`;
                savedItem = {
                    ...userData,
                    id: newId,
                } as UserMaster;
                list.push(savedItem);
            } else {
                savedItem = {
                    ...list[index],
                    ...userData,
                    id: data.id!,
                } as UserMaster;
                list[index] = savedItem;
            }
        } else {
            const newId = `USR${Math.floor(Math.random() * 10000)}`;
            savedItem = {
                ...userData,
                id: newId,
            } as UserMaster;
            list.push(savedItem);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return savedItem;
    },

    delete: (id: string) => {
        let list = getList();
        list = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
};
