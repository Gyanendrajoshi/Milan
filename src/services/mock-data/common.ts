import { CommonDropdownData } from "@/types/common";

export const commonDropdownData: CommonDropdownData = {
  units: [
    { value: "KG", label: "KG" },
    { value: "MT", label: "MT" },
    { value: "NOS", label: "NOS" },
    { value: "ROLLS", label: "ROLLS" },
  ],
  mills: [
    { value: "Mill A", label: "Mill A" },
    { value: "Mill B", label: "Mill B" },
    { value: "Mill C", label: "Mill C" },
    { value: "Reliance Industries", label: "Reliance Industries" },
    { value: "Jindal Poly Films", label: "Jindal Poly Films" },
  ],
  qualities: [
    { value: "Premium", label: "Premium" },
    { value: "Standard", label: "Standard" },
    { value: "Economy", label: "Economy" },
    { value: "Grade A", label: "Grade A" },
    { value: "Grade B", label: "Grade B" },
  ],
  manufacturers: [
    { value: "Manufacturer A", label: "Manufacturer A" },
    { value: "Manufacturer B", label: "Manufacturer B" },
    { value: "Zecher GmbH", label: "Zecher GmbH" },
    { value: "Harper Corporation", label: "Harper Corporation" },
    { value: "Flint Group", label: "Flint Group" },
  ],
  hsnCodes: [
    { value: "3920", label: "3920 - Plastic Sheets" },
    { value: "4811", label: "4811 - Paper & Paperboard" },
    { value: "8442", label: "8442 - Printing Machinery" },
    { value: "8443", label: "8443 - Printing Type" },
    { value: "3919", label: "3919 - Self-adhesive Plates" },
  ],
};
