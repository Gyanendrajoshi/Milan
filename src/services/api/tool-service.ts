import { ToolMaster, ToolMasterFormData, toolPrefixMap } from "@/types/tool-master";
import { toolStorage } from "../storage/tool-storage";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all tools
 * In production: Replace with actual API call to GET /api/tools
 */
export async function getTools(): Promise<ToolMaster[]> {
  // await delay(300); // Removed delay
  return toolStorage.getAll();
}

/**
 * Get a tool by ID
 * In production: Replace with actual API call to GET /api/tools/{id}
 */
export async function getToolById(id: string): Promise<ToolMaster | null> {
  await delay(200);
  return toolStorage.getById(id) || null;
}

/**
 * Create a new tool
 * In production: Replace with actual API call to POST /api/tools
 */
export async function createTool(
  data: ToolMasterFormData
): Promise<ToolMaster> {
  await delay(400);

  const toolData = {
    ...data,
    toolPrefixCode: toolPrefixMap[data.toolPrefix],
  };

  const newTool = toolStorage.save(toolData);
  return newTool;
}

/**
 * Update an existing tool
 * In production: Replace with actual API call to PUT /api/tools/{id}
 */
export async function updateTool(
  id: string,
  data: Partial<ToolMasterFormData>
): Promise<ToolMaster> {
  await delay(400);

  const existing = toolStorage.getById(id);
  if (!existing) {
    throw new Error("Tool not found");
  }

  const toolData = {
    ...existing,
    ...data,
    toolPrefixCode: data.toolPrefix
      ? toolPrefixMap[data.toolPrefix]
      : existing.toolPrefixCode,
  };

  const updatedTool = toolStorage.save({ ...toolData, id });
  return updatedTool;
}

/**
 * Delete a tool
 * In production: Replace with actual API call to DELETE /api/tools/{id}
 */
export async function deleteTool(id: string): Promise<void> {
  await delay(300);

  const existing = toolStorage.getById(id);
  if (!existing) {
    throw new Error("Tool not found");
  }

  toolStorage.delete(id);
}
