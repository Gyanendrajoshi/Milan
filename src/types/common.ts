export type UnitType = "KG" | "MT" | "NOS" | "ROLLS";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CommonDropdownData {
  units: SelectOption[];
  mills: SelectOption[];
  qualities: SelectOption[];
  manufacturers: SelectOption[];
  hsnCodes: SelectOption[];
}
