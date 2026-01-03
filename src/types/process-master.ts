export interface ProcessMaster {
    id: string;
    code: string; // Auto-generated e.g. PM00001
    name: string;
    chargeType: string; // Dynamic but stored as string
    isUnitConversion: boolean;
    rate: number;
    setupCharges?: number; // Fixed cost added to calculation
}

export type ChargeType = {
    id: string;
    label: string;
    value: string;
}

// Full List of Formulas from README
export const MOCK_CHARGE_TYPES: ChargeType[] = [
    { id: "1", label: "Rate/Color", value: "rate_per_color" },
    { id: "2", label: "Rate/Sq.Inch/Color", value: "rate_per_sq_inch_color" },
    { id: "3", label: "Rate/Sq.Inch/Unit", value: "rate_per_sq_inch_unit" },
    { id: "4", label: "Rate/Sq.Inch", value: "rate_per_sq_inch" },
    { id: "5", label: "Rate/Unit", value: "rate_per_unit" },
    { id: "6", label: "Rate/1000 Units", value: "rate_per_1000_units" },
    { id: "7", label: "Rate/Job", value: "rate_per_job" },
    { id: "8", label: "Rate/Order Quantity", value: "rate_per_order_qty" },
    { id: "9", label: "Rate/Inch/Unit", value: "rate_per_inch_unit" },
    { id: "10", label: "Rate/Kg", value: "rate_per_kg" },
    { id: "11", label: "Rate/Sq.Meter", value: "rate_per_sq_meter" },
    { id: "12", label: "Rate/Sq.CM", value: "rate_per_sq_cm" },
    { id: "13", label: "Rate/Meter", value: "rate_per_meter" },
];
