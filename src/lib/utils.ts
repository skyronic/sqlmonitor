import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { invoke } from "@tauri-apps/api/core"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type RunQueryResponse = {
  success: boolean;
  error?: string;
  value?: string;
  logs: string[];
}

export async function runQuery(
  connectionString: string, 
  connectionType: 'postgres' | 'mysql', 
  query: string
): Promise<RunQueryResponse> {
  try {
    const result = await invoke("run_query", {
      connectionString,
      connectionType,
      query
    }) as RunQueryResponse;
    
    return result;
  } catch (error) {
    console.error("Query execution error:", error);
    return {
      success: false,
      error: String(error),
      logs: ["Error executing query", String(error)]
    };
  }
}
