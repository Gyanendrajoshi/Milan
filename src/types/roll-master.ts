import { z } from "zod";
import { rollMasterSchema } from "@/lib/validations/roll-master";

export type ItemType = "Film" | "Paper";

export interface RollMaster {
  id: string;
  itemType: ItemType;
  itemCode: string;
  itemName: string;
  supplierItemCode?: string;
  mill?: string;
  quality?: string;
  rollWidthMM: number;
  thicknessMicron?: number;
  density?: number;
  faceGSM?: number;
  releaseGSM?: number;
  adhesiveGSM?: number;
  totalGSM?: number;
  shelfLifeDays?: number;
  purchaseUnit: string;
  stockUnit: string;
  purchaseRate?: number;
  hsnCode?: string;
  location?: string;
  supplierName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RollMasterFormData = Omit<RollMaster, "id" | "createdAt" | "updatedAt">;

export type RollMasterFormValues = z.input<typeof rollMasterSchema>;
