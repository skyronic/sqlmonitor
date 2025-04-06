import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Database from '@tauri-apps/plugin-sql';
import type { Connection, Category, Monitor, Measurement } from '../types';

// Database initialization
let dbPromise: Promise<Database> | null = null;

// Initialize database connection
const getDb = async (): Promise<Database> => {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:sqlmonitor.db');
  }
  return dbPromise;
};

// Utility function to get current timestamp in ISO format
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

// ============ Connection Hooks ============

export const useListConnections = () => {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const db = await getDb();
      return await db.select<Connection[]>('SELECT * FROM connections ORDER BY name');
    }
  });
};

export const useAddConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (connection: Omit<Connection, 'id' | 'created_at' | 'updated_at'>) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      // Insert the connection
      await db.execute(
        'INSERT INTO connections (name, type, connection_string, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [connection.name, connection.type, connection.connection_string, now, now]
      );
      
      // Get the newly created connection
      const result = await db.select<Connection[]>(
        'SELECT * FROM connections ORDER BY id DESC LIMIT 1'
      );
      
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  });
};

export const useUpdateConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Connection> & { id: number }) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      const params = [];
      const updates = [];
      
      if (data.name !== undefined) {
        updates.push('name = $' + (params.length + 1));
        params.push(data.name);
      }
      
      if (data.type !== undefined) {
        updates.push('type = $' + (params.length + 1));
        params.push(data.type);
      }
      
      if (data.connection_string !== undefined) {
        updates.push('connection_string = $' + (params.length + 1));
        params.push(data.connection_string);
      }
      
      updates.push('updated_at = $' + (params.length + 1));
      params.push(now);
      
      // Add id as the last parameter
      params.push(id);
      
      await db.execute(
        `UPDATE connections SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
      );
      
      // Get the updated connection
      const result = await db.select<Connection[]>(
        'SELECT * FROM connections WHERE id = $1',
        [id]
      );
      
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  });
};

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDb();
      await db.execute('DELETE FROM connections WHERE id = $1', [id]);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      // Also invalidate monitors since they might reference this connection
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    }
  });
};

// ============ Category Hooks ============

export const useListCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const db = await getDb();
      return await db.select<Category[]>('SELECT * FROM categories ORDER BY name');
    }
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      await db.execute(
        'INSERT INTO categories (name, description, created_at, updated_at) VALUES ($1, $2, $3, $4)',
        [category.name, category.description, now, now]
      );
      
      // Get the newly created category
      const result = await db.select<Category[]>(
        'SELECT * FROM categories ORDER BY id DESC LIMIT 1'
      );
      
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, description }: { id: number, name: string, description: string | null }) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      await db.execute(
        'UPDATE categories SET name = $1, description = $2, updated_at = $3 WHERE id = $4',
        [name, description, now, id]
      );
      
      // Get the updated category
      const result = await db.select<Category[]>(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );
      
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const db = await getDb();
      // This will set category_id to NULL in monitors due to ON DELETE SET NULL
      await db.execute('DELETE FROM categories WHERE id = $1', [id]);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Also invalidate monitors since they might reference this category
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    }
  });
};

// ============ Monitor Hooks ============

export const useListMonitors = (categoryId?: number) => {
  return useQuery({
    queryKey: categoryId !== undefined ? ['monitors', 'category', categoryId] : ['monitors'],
    queryFn: async () => {
      const db = await getDb();
      let query = 'SELECT * FROM monitors';
      const params = [];
      
      if (categoryId !== undefined) {
        if (categoryId === 0) {
          // Special case: get monitors with no category
          query += ' WHERE category_id IS NULL';
        } else {
          query += ' WHERE category_id = $1';
          params.push(categoryId);
        }
      }
      
      query += ' ORDER BY name';
      return await db.select<Monitor[]>(query, params);
    }
  });
};

export const useListStarredMonitors = () => {
  return useQuery({
    queryKey: ['monitors', 'starred'],
    queryFn: async () => {
      const db = await getDb();
      return await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE starred = 1 ORDER BY name'
      );
    }
  });
};

export const useGetMonitor = (id: number) => {
  return useQuery({
    queryKey: ['monitors', id],
    queryFn: async () => {
      const db = await getDb();
      const result = await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE id = $1', 
        [id]
      );
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!id
  });
};

export const useAddMonitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (monitor: Omit<Monitor, 'id' | 'created_at' | 'updated_at' | 'last_attempt_at' | 'last_success_at' | 'last_error_at' | 'error_message'>) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      await db.execute(
        `INSERT INTO monitors (
          name, connection_id, category_id, enabled, starred, cadence, query, 
          last_attempt_at, last_success_at, last_error_at, error_message,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          monitor.name,
          monitor.connection_id,
          monitor.category_id,
          monitor.enabled ? 1 : 0,
          monitor.starred ? 1 : 0,
          monitor.cadence,
          monitor.query,
          null, // last_attempt_at
          null, // last_success_at
          null, // last_error_at
          null, // error_message
          now,
          now
        ]
      );
      
      // Get the newly created monitor
      const result = await db.select<Monitor[]>(
        'SELECT * FROM monitors ORDER BY id DESC LIMIT 1'
      );
      
      return result[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      if (data.category_id) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'category', data.category_id] });
      }
      if (data.starred) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'starred'] });
      }
    }
  });
};

export const useEditMonitor = (id: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Omit<Monitor, 'id' | 'created_at' | 'updated_at'>>) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      // Get the original monitor to check for changes
      const originalResult = await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE id = $1', 
        [id]
      );
      const originalMonitor = originalResult[0];
      
      const updates = [];
      const params = [];
      
      if (data.name !== undefined) {
        updates.push('name = $' + (params.length + 1));
        params.push(data.name);
      }
      
      if (data.connection_id !== undefined) {
        updates.push('connection_id = $' + (params.length + 1));
        params.push(data.connection_id);
      }
      
      if (data.category_id !== undefined) {
        updates.push('category_id = $' + (params.length + 1));
        params.push(data.category_id);
      }
      
      if (data.enabled !== undefined) {
        updates.push('enabled = $' + (params.length + 1));
        params.push(data.enabled ? 1 : 0);
      }
      
      if (data.starred !== undefined) {
        updates.push('starred = $' + (params.length + 1));
        params.push(data.starred ? 1 : 0);
      }
      
      if (data.cadence !== undefined) {
        updates.push('cadence = $' + (params.length + 1));
        params.push(data.cadence);
      }
      
      if (data.query !== undefined) {
        updates.push('query = $' + (params.length + 1));
        params.push(data.query);
      }

      if (data.last_attempt_at !== undefined) {
        updates.push('last_attempt_at = $' + (params.length + 1));
        params.push(data.last_attempt_at);
      }

      if (data.last_success_at !== undefined) {
        updates.push('last_success_at = $' + (params.length + 1));
        params.push(data.last_success_at);
      }

      if (data.last_error_at !== undefined) {
        updates.push('last_error_at = $' + (params.length + 1));
        params.push(data.last_error_at);
      }

      if (data.error_message !== undefined) {
        updates.push('error_message = $' + (params.length + 1));
        params.push(data.error_message);
      }
      
      updates.push('updated_at = $' + (params.length + 1));
      params.push(now);
      
      // Add id as the last parameter
      params.push(id);
      
      await db.execute(
        `UPDATE monitors SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
      );
      
      // Get the updated monitor
      const updatedResult = await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE id = $1', 
        [id]
      );
      const updatedMonitor = updatedResult[0];
      
      return {
        updatedMonitor,
        originalCategoryId: originalMonitor.category_id,
        originalStarred: originalMonitor.starred
      };
    },
    onSuccess: (data) => {
      const { updatedMonitor, originalCategoryId, originalStarred } = data;
      
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitors', id] });
      
      // Invalidate category queries if category changed
      if (updatedMonitor.category_id !== originalCategoryId) {
        if (originalCategoryId) {
          queryClient.invalidateQueries({ queryKey: ['monitors', 'category', originalCategoryId] });
        }
        if (updatedMonitor.category_id) {
          queryClient.invalidateQueries({ queryKey: ['monitors', 'category', updatedMonitor.category_id] });
        }
      }
      
      // Invalidate starred queries if starred status changed
      if (updatedMonitor.starred !== originalStarred) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'starred'] });
      }
    }
  });
};

export const useToggleMonitorEnabled = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: number, enabled: boolean }) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      await db.execute(
        'UPDATE monitors SET enabled = $1, updated_at = $2 WHERE id = $3',
        [enabled ? 1 : 0, now, id]
      );
      
      // Get the updated monitor
      const result = await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE id = $1', 
        [id]
      );
      
      return result[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitors', data.id] });
      
      if (data.category_id) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'category', data.category_id] });
      }
      
      if (data.starred) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'starred'] });
      }
    }
  });
};

export const useToggleMonitorStarred = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, starred }: { id: number, starred: boolean }) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      await db.execute(
        'UPDATE monitors SET starred = $1, updated_at = $2 WHERE id = $3',
        [starred ? 1 : 0, now, id]
      );
      
      // Get the updated monitor
      const result = await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE id = $1', 
        [id]
      );
      
      return result[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitors', data.id] });
      queryClient.invalidateQueries({ queryKey: ['monitors', 'starred'] });
      
      if (data.category_id) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'category', data.category_id] });
      }
    }
  });
};

export const useDeleteMonitor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      // First, get the monitor to know its category and starred status
      const db = await getDb();
      const monitorResult = await db.select<Monitor[]>(
        'SELECT * FROM monitors WHERE id = $1', 
        [id]
      );
      const monitor = monitorResult[0];
      
      // Then delete the monitor
      await db.execute('DELETE FROM monitors WHERE id = $1', [id]);
      
      return monitor;
    },
    onSuccess: (monitor) => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitors', monitor.id] });
      
      if (monitor.category_id) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'category', monitor.category_id] });
      }
      
      if (monitor.starred) {
        queryClient.invalidateQueries({ queryKey: ['monitors', 'starred'] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['measurements', monitor.id] });
    }
  });
};

// ============ Measurement Hooks ============

export const useListMeasurements = (monitor_id: number) => {
  return useQuery({
    queryKey: ['measurements', monitor_id],
    queryFn: async () => {
      const db = await getDb();
      return await db.select<Measurement[]>(
        'SELECT * FROM measurements WHERE monitor_id = $1 ORDER BY created_at DESC',
        [monitor_id]
      );
    },
    enabled: !!monitor_id
  });
};

export const useAddMeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (measurement: Omit<Measurement, 'id' | 'created_at'>) => {
      const db = await getDb();
      const now = getCurrentTimestamp();
      
      await db.execute(
        'INSERT INTO measurements (monitor_id, value, created_at) VALUES ($1, $2, $3)',
        [measurement.monitor_id, measurement.value, now]
      );
      
      // Get the newly created measurement
      const result = await db.select<Measurement[]>(
        'SELECT * FROM measurements WHERE monitor_id = $1 ORDER BY id DESC LIMIT 1',
        [measurement.monitor_id]
      );
      
      return result[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', data.monitor_id] });
      queryClient.invalidateQueries({ queryKey: ['measurements', 'latest', data.monitor_id] });
      queryClient.invalidateQueries({ queryKey: ['measurements', 'stats', data.monitor_id] });
    }
  });
};

export const useClearMeasurements = (monitor_id: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const db = await getDb();
      await db.execute('DELETE FROM measurements WHERE monitor_id = $1', [monitor_id]);
      return monitor_id;
    },
    onSuccess: (monitor_id) => {
      queryClient.invalidateQueries({ queryKey: ['measurements', monitor_id] });
      queryClient.invalidateQueries({ queryKey: ['measurements', 'latest', monitor_id] });
      queryClient.invalidateQueries({ queryKey: ['measurements', 'stats', monitor_id] });
    }
  });
};

// ============ Utility Hooks ============

// Get the latest measurement for a monitor
export const useLatestMeasurement = (monitor_id: number) => {
  return useQuery({
    queryKey: ['measurements', 'latest', monitor_id],
    queryFn: async () => {
      const db = await getDb();
      const result = await db.select<Measurement[]>(
        'SELECT * FROM measurements WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT 1',
        [monitor_id]
      );
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!monitor_id
  });
};

// Get measurement statistics for a monitor
export interface MeasurementStats {
  count: number;
  average: number;
  minimum: number;
  maximum: number;
  sum: number;
}

export const useMeasurementStats = (monitor_id: number) => {
  return useQuery({
    queryKey: ['measurements', 'stats', monitor_id],
    queryFn: async () => {
      const db = await getDb();
      const result = await db.select<MeasurementStats[]>(
        `SELECT 
          COUNT(*) as count,
          AVG(value) as average,
          MIN(value) as minimum,
          MAX(value) as maximum,
          SUM(value) as sum
        FROM measurements WHERE monitor_id = $1`,
        [monitor_id]
      );
      
      return result[0];
    },
    enabled: !!monitor_id
  });
};

// Get measurements for a specific time range
export const useTimeRangeMeasurements = (
  monitor_id: number, 
  startDate: string, 
  endDate: string
) => {
  return useQuery({
    queryKey: ['measurements', 'range', monitor_id, startDate, endDate],
    queryFn: async () => {
      const db = await getDb();
      return await db.select<Measurement[]>(
        `SELECT * FROM measurements 
        WHERE monitor_id = $1 AND created_at >= $2 AND created_at <= $3 
        ORDER BY created_at`,
        [monitor_id, startDate, endDate]
      );
    },
    enabled: !!monitor_id && !!startDate && !!endDate
  });
};

// Get recent measurements (last 50)
export const useRecentMeasurements = (monitor_id: number) => {
  return useQuery({
    queryKey: ['measurements', 'recent', monitor_id],
    queryFn: async () => {
      const db = await getDb();
      return await db.select<Measurement[]>(
        'SELECT * FROM measurements WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT 50',
        [monitor_id]
      );
    },
    enabled: !!monitor_id
  });
};
