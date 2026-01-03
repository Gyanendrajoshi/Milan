"use client";

const KEY = "MILAN_OPERATORS";

export interface Operator {
    id: string;
    name: string;
}

export const getOperators = (): Operator[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(KEY);
    if (data) {
        return JSON.parse(data);
    }
    // Default initial list
    return [
        { id: "OP-001", name: "Ramesh Kumar" },
        { id: "OP-002", name: "Suresh Singh" },
        { id: "OP-003", name: "Deepak Sharma" }
    ];
};

export const addOperator = (name: string): Operator => {
    const list = getOperators();
    const newOp = { id: `OP-${Date.now()}`, name };
    list.push(newOp);
    localStorage.setItem(KEY, JSON.stringify(list));
    return newOp;
};
