import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { invoke } from "@tauri-apps/api/core"
import type { Monitor, Connection } from "../types"

// Create a logger
const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data ? data : ''),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error ? error : ''),
  debug: (message: string, data?: any) => console.debug(`[DEBUG] ${message}`, data ? data : '')
};

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
  logger.info('Starting query execution', { connectionType, query });
  
  try {
    const result = await invoke("run_query", {
      connectionString,
      connectionType,
      query
    }) as RunQueryResponse;
    
    if (result.success) {
      logger.info('Query executed successfully', { value: result.value, logs: result.logs });
    } else {
      logger.error('Query execution failed', { error: result.error, logs: result.logs });
    }
    
    return result;
  } catch (error) {
    logger.error('Query execution error', error);
    return {
      success: false,
      error: String(error),
      logs: ["Error executing query", String(error)]
    };
  }
}

export async function runMonitor(
  monitor: Monitor, 
  connection: Connection,
  editMonitor: (data: { id: number } & Partial<Monitor>) => Promise<any>,
  addMeasurement: (data: { monitor_id: number, value: number }) => Promise<any>
) {
  logger.info('Starting monitor execution', { monitorId: monitor.id, query: monitor.query });
  const now = new Date().toISOString();
  
  try {
    // First update last_attempt_at
    logger.debug('Updating last attempt timestamp', { monitorId: monitor.id, timestamp: now });
    await editMonitor({
      id: monitor.id,
      last_attempt_at: now
    });

    // Run the query
    logger.debug('Executing monitor query', { monitorId: monitor.id });
    const result = await runQuery(
      connection.connection_string,
      connection.type,
      monitor.query
    );

    // Update monitor status based on result
    if (result.success && result.value !== undefined) {
      const value = parseFloat(result.value);
      if (isNaN(value)) {
        logger.error('Failed to parse query result as number', { monitorId: monitor.id, value: result.value });
        await editMonitor({
          id: monitor.id,
          last_error_at: now,
          error_message: 'Query result could not be converted to a number'
        });
        return;
      }

      // Update success status
      logger.info('Monitor executed successfully', { monitorId: monitor.id, value });
      await editMonitor({
          id: monitor.id,
          last_success_at: now,
          last_error_at: null,
          error_message: null
      });

      // Create measurement
      logger.debug('Recording measurement', { monitorId: monitor.id, value });
      await addMeasurement({
        monitor_id: monitor.id,
        value: value
      });
    } else {
      // Update error status
      logger.error('Monitor execution failed', { 
        monitorId: monitor.id, 
        error: result.error, 
        logs: result.logs 
      });
      await editMonitor({
          id: monitor.id,
          last_error_at: now,
          error_message: result.error || 'Unknown error'
      });
    }
  } catch (error) {
    logger.error('Unexpected error in monitor execution', { monitorId: monitor.id, error });
    await editMonitor({
      id: monitor.id,
      last_error_at: now,
      error_message: String(error)
    });
  }
}
