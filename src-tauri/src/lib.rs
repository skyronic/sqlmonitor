use tauri_plugin_sql::{Migration, MigrationKind};
use serde::Serialize;
use sqlx::Connection;

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
        .invoke_handler(tauri::generate_handler![greet, test_connection])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
