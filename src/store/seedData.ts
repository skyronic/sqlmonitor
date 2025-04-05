// seedData.ts
import Database from '@tauri-apps/plugin-sql';

/**
 * Seeds the database with sample data for development
 * Warning: This will delete all existing data
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("Starting database seeding...");
    const db = await Database.load('sqlite:sqlmonitor.db');

    // Clear all existing data
    console.log("Clearing existing data...");
    await db.execute('DELETE FROM measurements');
    await db.execute('DELETE FROM monitors');
    await db.execute('DELETE FROM categories');
    await db.execute('DELETE FROM connections');
    
    // Reset auto-increment counters
    await db.execute('DELETE FROM sqlite_sequence WHERE name IN ("measurements", "monitors", "categories", "connections")');
    
    // Create categories
    console.log("Creating categories...");
    await db.execute('INSERT INTO categories (name, created_at, updated_at) VALUES ($1, $2, $2)', 
      ['User Metrics', getCurrentTimestamp()]);
    await db.execute('INSERT INTO categories (name, created_at, updated_at) VALUES ($1, $2, $2)', 
      ['Business Metrics', getCurrentTimestamp()]);
    
    // Create connections
    console.log("Creating connections...");
    await db.execute('INSERT INTO connections (name, type, connection_string, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)', 
      ['Production DB', 'postgres', 'postgresql://user:pass@prod-db.example.com:5432/app_db', getCurrentTimestamp()]);
    await db.execute('INSERT INTO connections (name, type, connection_string, created_at, updated_at) VALUES ($1, $2, $3, $4, $4)', 
      ['Analytics DB', 'mysql', 'mysql://analyst:pass@analytics.example.com:3306/metrics', getCurrentTimestamp()]);
    
    // Get created categories and connections for reference
    const categories = await db.select<{ id: number, name: string }[]>('SELECT id, name FROM categories');
    const connections = await db.select<{ id: number, name: string }[]>('SELECT id, name FROM connections');
    
    const userCategoryId = categories.find(c => c.name === 'User Metrics')?.id;
    const businessCategoryId = categories.find(c => c.name === 'Business Metrics')?.id;
    const prodDbId = connections.find(c => c.name === 'Production DB')?.id;
    const analyticsDbId = connections.find(c => c.name === 'Analytics DB')?.id;
    
    // Create monitors
    console.log("Creating monitors...");
    
    // User Metrics monitors
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'New Users (24h)', 
        prodDbId, 
        userCategoryId, 
        1, 
        1, 
        'daily',
        'SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL \'1 day\'',
        getCurrentTimestamp()
      ]
    );
    
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'Active Users (24h)', 
        prodDbId, 
        userCategoryId, 
        1, 
        1, 
        'daily',
        'SELECT COUNT(DISTINCT user_id) FROM sessions WHERE created_at >= NOW() - INTERVAL \'1 day\'',
        getCurrentTimestamp()
      ]
    );
    
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'Average Session Duration (minutes)', 
        analyticsDbId, 
        userCategoryId, 
        1, 
        0, 
        'hourly',
        'SELECT AVG(duration_seconds) / 60 FROM sessions WHERE created_at >= NOW() - INTERVAL \'1 day\'',
        getCurrentTimestamp()
      ]
    );
    
    // Business Metrics monitors
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'New Subscriptions (24h)', 
        prodDbId, 
        businessCategoryId, 
        1, 
        1, 
        'daily',
        'SELECT COUNT(*) FROM subscriptions WHERE created_at >= NOW() - INTERVAL \'1 day\'',
        getCurrentTimestamp()
      ]
    );
    
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'Revenue (24h)', 
        prodDbId, 
        businessCategoryId, 
        1, 
        1, 
        'daily',
        'SELECT SUM(amount) FROM payments WHERE status = \'succeeded\' AND created_at >= NOW() - INTERVAL \'1 day\'',
        getCurrentTimestamp()
      ]
    );
    
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'Churn Rate (30d)', 
        analyticsDbId, 
        businessCategoryId, 
        1, 
        0, 
        'daily',
        'SELECT (COUNT(CASE WHEN status = \'cancelled\' THEN 1 END) * 100.0 / COUNT(*)) FROM subscriptions WHERE updated_at >= NOW() - INTERVAL \'30 days\'',
        getCurrentTimestamp()
      ]
    );
    
    await db.execute(`
      INSERT INTO monitors (
        name, connection_id, category_id, enabled, starred, cadence, query, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`, 
      [
        'Support Tickets (24h)', 
        analyticsDbId, 
        businessCategoryId, 
        1, 
        0, 
        'daily',
        'SELECT COUNT(*) FROM support_tickets WHERE created_at >= NOW() - INTERVAL \'1 day\'',
        getCurrentTimestamp()
      ]
    );
    
    // Get created monitors for reference
    const monitors = await db.select<{ id: number, name: string }[]>('SELECT id, name FROM monitors');
    
    // Create measurements
    console.log("Creating measurements...");
    
    // Helper function to create 10 measurements for a monitor with realistic data
    const createMeasurementsForMonitor = async (monitorId: number, monitorName: string) => {
      let baseValue: number;
      let variancePercent: number;
      let trend: number;
      
      // Set realistic base values and variance for each monitor type
      switch(monitorName) {
        case 'New Users (24h)':
          baseValue = 120;
          variancePercent = 0.15;
          trend = 1.05; // Slightly growing
          break;
        case 'Active Users (24h)':
          baseValue = 850;
          variancePercent = 0.08;
          trend = 1.02;
          break;
        case 'Average Session Duration (minutes)':
          baseValue = 8.5;
          variancePercent = 0.1;
          trend = 1.01;
          break;
        case 'New Subscriptions (24h)':
          baseValue = 45;
          variancePercent = 0.2;
          trend = 1.03;
          break;
        case 'Revenue (24h)':
          baseValue = 5250;
          variancePercent = 0.18;
          trend = 1.04;
          break;
        case 'Churn Rate (30d)':
          baseValue = 3.2;
          variancePercent = 0.05;
          trend = 0.98; // Slightly decreasing (which is good for churn)
          break;
        case 'Support Tickets (24h)':
          baseValue = 28;
          variancePercent = 0.25;
          trend = 1.0; // Stable
          break;
        default:
          baseValue = 100;
          variancePercent = 0.1;
          trend = 1.0;
      }
      
      // Create 10 measurements with slight variations and trend
      for (let i = 0; i < 10; i++) {
        // Apply trend over time
        const trendFactor = Math.pow(trend, i);
        const trendedBase = baseValue * trendFactor;
        
        // Add random variance
        const variance = (Math.random() * 2 - 1) * variancePercent * trendedBase;
        let value = trendedBase + variance;
        
        // Round appropriately based on the metric type
        if (monitorName.includes('Rate') || monitorName.includes('Duration')) {
          value = parseFloat(value.toFixed(2)); // 2 decimal places for percentages and durations
        } else {
          value = Math.round(value); // Whole numbers for counts
        }
        
        // Calculate timestamp (10 days ago to now, one day apart)
        const date = new Date();
        date.setDate(date.getDate() - (9 - i));
        date.setHours(9, 0, 0, 0); // 9am measurement each day
        const timestamp = date.toISOString();
        
        await db.execute(
          'INSERT INTO measurements (monitor_id, value, created_at) VALUES ($1, $2, $3)',
          [monitorId, value, timestamp]
        );
      }
    };
    
    // Create measurements for each monitor
    for (const monitor of monitors) {
      await createMeasurementsForMonitor(monitor.id, monitor.name);
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// Helper function to get current timestamp
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
