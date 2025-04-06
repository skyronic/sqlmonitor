// types.ts
export interface Connection {
    id: number;
    name: string;
    type: 'postgres' | 'mysql';
    connection_string: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface Monitor {
    id: number;
    name: string;
    connection_id: number;
    category_id: number | null;
    enabled: boolean;
    starred: boolean;
    cadence: 'hourly' | 'daily';
    query: string;
    last_attempt_at: string | null;
    last_success_at: string | null;
    last_error_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface Measurement {
    id: number;
    monitor_id: number;
    value: number;
    created_at: string;
  }
  