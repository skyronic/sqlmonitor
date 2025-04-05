use tauri_plugin_sql::{Migration, MigrationKind};
use serde::Serialize;
use sqlx::{Connection, Row, FromRow};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rustlang!", name)
}

#[derive(Serialize)]
struct TestConnectionResponse {
    success: bool,
    logs: Vec<String>,
}

#[tauri::command]
#[allow(non_snake_case)]
async fn test_connection(connectionString: String, connectionType: String) -> Result<TestConnectionResponse, String> {
    let mut logs = Vec::new();
    logs.push(format!("Connecting to {} database...", connectionType));
    
    let result = match connectionType.as_str() {
        "postgres" => {
            logs.push("Attempting PostgreSQL connection".to_string());
            match sqlx::PgConnection::connect(&connectionString).await {
                Ok(_) => {
                    logs.push("Connection established successfully".to_string());
                    logs.push("Connection test completed".to_string());
                    true
                },
                Err(e) => {
                    logs.push(format!("Connection failed: {}", e));
                    false
                }
            }
        },
        "mysql" => {
            logs.push("Attempting MySQL connection".to_string());
            match sqlx::MySqlConnection::connect(&connectionString).await {
                Ok(_) => {
                    logs.push("Connection established successfully".to_string());
                    logs.push("Connection test completed".to_string());
                    true
                },
                Err(e) => {
                    logs.push(format!("Connection failed: {}", e));
                    false
                }
            }
        },
        _ => {
            logs.push(format!("Unsupported database type: {}", connectionType));
            false
        }
    };
    
    Ok(TestConnectionResponse {
        success: result,
        logs,
    })
}

#[derive(Serialize)]
struct RunQueryResponse {
    success: bool,
    error: Option<String>,
    value: Option<String>,
    logs: Vec<String>,
}

#[tauri::command]
#[allow(non_snake_case)]
async fn run_query(connectionString: String, connectionType: String, query: String) -> Result<RunQueryResponse, String> {
    let mut logs = Vec::new();
    logs.push(format!("Connecting to {} database...", connectionType));
    logs.push(format!("Executing query: {}", query));
    
    let result = match connectionType.as_str() {
        "postgres" => {
            logs.push("Attempting PostgreSQL connection".to_string());
            match execute_postgres_query(connectionString, query, &mut logs).await {
                Ok(value) => RunQueryResponse {
                    success: true,
                    error: None,
                    value: Some(value),
                    logs,
                },
                Err(error) => RunQueryResponse {
                    success: false,
                    error: Some(error),
                    value: None,
                    logs,
                }
            }
        },
        "mysql" => {
            logs.push("Attempting MySQL connection".to_string());
            match execute_mysql_query(connectionString, query, &mut logs).await {
                Ok(value) => RunQueryResponse {
                    success: true,
                    error: None,
                    value: Some(value),
                    logs,
                },
                Err(error) => RunQueryResponse {
                    success: false,
                    error: Some(error),
                    value: None,
                    logs,
                }
            }
        },
        _ => {
            let error = format!("Unsupported database type: {}", connectionType);
            logs.push(error.clone());
            RunQueryResponse {
                success: false,
                error: Some(error),
                value: None,
                logs,
            }
        }
    };
    
    Ok(result)
}

async fn execute_postgres_query(connection_string: String, query: String, logs: &mut Vec<String>) -> Result<String, String> {
    let mut conn = sqlx::PgConnection::connect(&connection_string).await
        .map_err(|e| format!("Connection failed: {}", e))?;
    
    logs.push("Connection established successfully".to_string());
    
    let rows = sqlx::query(&query)
        .fetch_all(&mut conn)
        .await
        .map_err(|e| format!("Query execution failed: {}", e))?;
    
    if rows.is_empty() {
        return Err("Query returned no rows".to_string());
    }
    
    if rows.len() > 1 {
        return Err("Query returned multiple rows, expected single row".to_string());
    }
    
    let row = &rows[0];
    
    // Try to get the first column
    let column_count = row.columns().len();
    if column_count == 0 {
        return Err("Query returned a row with no columns".to_string());
    }
    
    if column_count > 1 {
        return Err("Query returned multiple columns, expected single column".to_string());
    }
    
    // Get value as string
    let value: Option<String> = row.try_get(0)
        .map_err(|e| format!("Failed to extract value from result: {}", e))?;
    
    match value {
        Some(v) => Ok(v),
        None => Err("Query returned NULL value".to_string()),
    }
}

async fn execute_mysql_query(connection_string: String, query: String, logs: &mut Vec<String>) -> Result<String, String> {
    let mut conn = sqlx::MySqlConnection::connect(&connection_string).await
        .map_err(|e| format!("Connection failed: {}", e))?;
    
    logs.push("Connection established successfully".to_string());
    
    let rows = sqlx::query(&query)
        .fetch_all(&mut conn)
        .await
        .map_err(|e| format!("Query execution failed: {}", e))?;
    
    if rows.is_empty() {
        return Err("Query returned no rows".to_string());
    }
    
    if rows.len() > 1 {
        return Err("Query returned multiple rows, expected single row".to_string());
    }
    
    let row = &rows[0];
    
    // Try to get the first column
    let column_count = row.columns().len();
    if column_count == 0 {
        return Err("Query returned a row with no columns".to_string());
    }
    
    if column_count > 1 {
        return Err("Query returned multiple columns, expected single column".to_string());
    }
    
    // Get value as string
    let value: Option<String> = row.try_get(0)
        .map_err(|e| format!("Failed to extract value from result: {}", e))?;
    
    match value {
        Some(v) => Ok(v),
        None => Err("Query returned NULL value".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
            -- Connections table
            CREATE TABLE IF NOT EXISTS connections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('postgres', 'mysql')),
                connection_string TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            -- Categories table
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            -- Monitors table
            CREATE TABLE IF NOT EXISTS monitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                connection_id INTEGER NOT NULL,
                category_id INTEGER NULL,
                enabled BOOLEAN NOT NULL DEFAULT 1,
                starred BOOLEAN NOT NULL DEFAULT 0,
                cadence TEXT NOT NULL CHECK (cadence IN ('hourly', 'daily')),
                query TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (connection_id) REFERENCES connections (id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
            );

            -- Measurements table
            CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                monitor_id INTEGER NOT NULL,
                value REAL NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (monitor_id) REFERENCES monitors (id) ON DELETE CASCADE
            );

            -- Indexes - check if they exist before creating
            CREATE INDEX IF NOT EXISTS idx_monitors_connection_id ON monitors (connection_id);
            CREATE INDEX IF NOT EXISTS idx_monitors_category_id ON monitors (category_id);
            CREATE INDEX IF NOT EXISTS idx_monitors_starred ON monitors (starred);
            CREATE INDEX IF NOT EXISTS idx_measurements_monitor_id ON measurements (monitor_id);
            CREATE INDEX IF NOT EXISTS idx_measurements_created_at ON measurements (created_at);
            "#,
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:sqlmonitor.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, test_connection, run_query])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
