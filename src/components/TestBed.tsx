// TestBed.tsx
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  useListConnections, useAddConnection, 
  useListCategories, useAddCategory,
  useListMonitors, useAddMonitor, useListStarredMonitors, useToggleMonitorStarred,
  useListMeasurements, useAddMeasurement, useClearMeasurements,
  useLatestMeasurement, useMeasurementStats
} from '../store/backend';
import type { Monitor } from '../types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function TestBedWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestBed />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function TestBed() {
  // State for form inputs
  const [connectionName, setConnectionName] = useState('');
  const [connectionType, setConnectionType] = useState<'postgres' | 'mysql'>('postgres');
  const [connectionString, setConnectionString] = useState('');
  
  const [categoryName, setCategoryName] = useState('');
  
  const [monitorName, setMonitorName] = useState('');
  const [monitorQuery, setMonitorQuery] = useState('SELECT COUNT(*) FROM users');
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [monitorCadence, setMonitorCadence] = useState<'hourly' | 'daily'>('hourly');
  
  const [selectedMonitor, setSelectedMonitor] = useState<number | null>(null);
  const [measurementValue, setMeasurementValue] = useState<number>(0);
  
  // Queries
  const { data: connections, isLoading: connectionsLoading } = useListConnections();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: monitors, isLoading: monitorsLoading } = useListMonitors();
  const { data: starredMonitors } = useListStarredMonitors();
  const { data: measurements } = useListMeasurements(selectedMonitor || 0);
  const { data: latestMeasurement } = useLatestMeasurement(selectedMonitor || 0);
  const { data: measurementStats } = useMeasurementStats(selectedMonitor || 0);
  
  // Mutations
  const addConnection = useAddConnection();
  const addCategory = useAddCategory();
  const addMonitor = useAddMonitor();
  const addMeasurement = useAddMeasurement();
  const clearMeasurements = useClearMeasurements(selectedMonitor || 0);
  const toggleStarred = useToggleMonitorStarred();
  
  // Handlers
  const handleAddConnection = () => {
    if (!connectionName || !connectionString) return;
    
    addConnection.mutate({
      name: connectionName,
      type: connectionType,
      connection_string: connectionString
    }, {
      onSuccess: () => {
        setConnectionName('');
        setConnectionString('');
      }
    });
  };
  
  const handleAddCategory = () => {
    if (!categoryName) return;
    
    addCategory.mutate({
      name: categoryName,
      description: null
    }, {
      onSuccess: () => {
        setCategoryName('');
      }
    });
  };
  
  const handleAddMonitor = () => {
    if (!monitorName || !selectedConnection || !monitorQuery) return;
    
    addMonitor.mutate({
      name: monitorName,
      connection_id: selectedConnection,
      category_id: selectedCategory,
      enabled: true,
      starred: false,
      cadence: monitorCadence,
      query: monitorQuery
    }, {
      onSuccess: () => {
        setMonitorName('');
        setMonitorQuery('SELECT COUNT(*) FROM users');
        setSelectedConnection(null);
        setSelectedCategory(null);
      }
    });
  };
  
  const handleAddMeasurement = () => {
    if (!selectedMonitor) return;
    
    addMeasurement.mutate({
      monitor_id: selectedMonitor,
      value: measurementValue
    }, {
      onSuccess: () => {
        setMeasurementValue(0);
      }
    });
  };
  
  const handleClearMeasurements = () => {
    if (!selectedMonitor) return;
    clearMeasurements.mutate();
  };
  
  const handleToggleStarred = (monitor: Monitor) => {
    toggleStarred.mutate({
      id: monitor.id,
      starred: !monitor.starred
    });
  };
  
  if (connectionsLoading || categoriesLoading || monitorsLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>SQL Monitor TestBed</h1>
      
      <div style={{ display: 'flex', gap: 20 }}>
        {/* Left column */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 30, border: '1px solid #ccc', padding: 15, borderRadius: 5 }}>
            <h2>Connections</h2>
            <div style={{ marginBottom: 10 }}>
              <input 
                type="text" 
                value={connectionName} 
                onChange={e => setConnectionName(e.target.value)}
                placeholder="Connection Name"
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              />
              <select 
                value={connectionType} 
                onChange={e => setConnectionType(e.target.value as 'postgres' | 'mysql')}
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
              <input 
                type="text" 
                value={connectionString} 
                onChange={e => setConnectionString(e.target.value)}
                placeholder="Connection String"
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              />
              <button 
                onClick={handleAddConnection}
                disabled={addConnection.isPending}
                style={{ padding: '5px 10px' }}
              >
                Add Connection
              </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Type</th>
                  <th style={tableHeaderStyle}>Connection String</th>
                </tr>
              </thead>
              <tbody>
                {connections?.map(connection => (
                  <tr key={connection.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{connection.id}</td>
                    <td style={tableCellStyle}>{connection.name}</td>
                    <td style={tableCellStyle}>{connection.type}</td>
                    <td style={tableCellStyle}>{connection.connection_string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginBottom: 30, border: '1px solid #ccc', padding: 15, borderRadius: 5 }}>
            <h2>Categories</h2>
            <div style={{ marginBottom: 10 }}>
              <input 
                type="text" 
                value={categoryName} 
                onChange={e => setCategoryName(e.target.value)}
                placeholder="Category Name"
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              />
              <button 
                onClick={handleAddCategory}
                disabled={addCategory.isPending}
                style={{ padding: '5px 10px' }}
              >
                Add Category
              </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map(category => (
                  <tr key={category.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{category.id}</td>
                    <td style={tableCellStyle}>{category.name}</td>
                    <td style={tableCellStyle}>{new Date(category.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Right column */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 30, border: '1px solid #ccc', padding: 15, borderRadius: 5 }}>
            <h2>Monitors</h2>
            <div style={{ marginBottom: 10 }}>
              <input 
                type="text" 
                value={monitorName} 
                onChange={e => setMonitorName(e.target.value)}
                placeholder="Monitor Name"
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              />
              <select 
                value={selectedConnection || ''} 
                onChange={e => setSelectedConnection(e.target.value ? Number(e.target.value) : null)}
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              >
                <option value="">Select Connection</option>
                {connections?.map(conn => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.type})
                  </option>
                ))}
              </select>
              <select 
                value={selectedCategory || ''} 
                onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              >
                <option value="">No Category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select 
                value={monitorCadence} 
                onChange={e => setMonitorCadence(e.target.value as 'hourly' | 'daily')}
                style={{ width: '100%', marginBottom: 5, padding: 5 }}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
              </select>
              <textarea 
                value={monitorQuery} 
                onChange={e => setMonitorQuery(e.target.value)}
                placeholder="SQL Query"
                style={{ width: '100%', marginBottom: 5, padding: 5, height: 60 }}
              />
              <button 
                onClick={handleAddMonitor}
                disabled={addMonitor.isPending}
                style={{ padding: '5px 10px' }}
              >
                Add Monitor
              </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Connection</th>
                  <th style={tableHeaderStyle}>Category</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monitors?.map(monitor => (
                  <tr key={monitor.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{monitor.id}</td>
                    <td style={tableCellStyle}>{monitor.name}</td>
                    <td style={tableCellStyle}>
                      {connections?.find(c => c.id === monitor.connection_id)?.name || 'Unknown'}
                    </td>
                    <td style={tableCellStyle}>
                      {monitor.category_id 
                        ? categories?.find(c => c.id === monitor.category_id)?.name || 'Unknown'
                        : 'None'}
                    </td>
                    <td style={tableCellStyle}>
                      {monitor.enabled ? 'Enabled' : 'Disabled'} 
                      {monitor.starred ? ' ⭐' : ''}
                    </td>
                    <td style={tableCellStyle}>
                      <button 
                        onClick={() => setSelectedMonitor(monitor.id)}
                        style={{ marginRight: 5, padding: '3px 6px' }}
                      >
                        View Measurements
                      </button>
                      <button 
                        onClick={() => handleToggleStarred(monitor)}
                        style={{ padding: '3px 6px' }}
                      >
                        {monitor.starred ? 'Unstar' : 'Star'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginBottom: 30, border: '1px solid #ccc', padding: 15, borderRadius: 5 }}>
            <h2>Starred Monitors</h2>
            {starredMonitors?.length === 0 ? (
              <p>No starred monitors yet.</p>
            ) : (
              <ul>
                {starredMonitors?.map(monitor => (
                  <li key={monitor.id}>
                    {monitor.name} - {monitor.cadence}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {selectedMonitor && (
            <div style={{ border: '1px solid #ccc', padding: 15, borderRadius: 5 }}>
              <h2>Measurements for {monitors?.find(m => m.id === selectedMonitor)?.name}</h2>
              <div style={{ marginBottom: 10 }}>
                <input 
                  type="number" 
                  value={measurementValue} 
                  onChange={e => setMeasurementValue(Number(e.target.value))}
                  placeholder="Value"
                  style={{ marginRight: 5, padding: 5 }}
                />
                <button 
                  onClick={handleAddMeasurement}
                  disabled={addMeasurement.isPending}
                  style={{ marginRight: 5, padding: '5px 10px' }}
                >
                  Add Measurement
                </button>
                <button 
                  onClick={handleClearMeasurements}
                  disabled={clearMeasurements.isPending}
                  style={{ padding: '5px 10px' }}
                >
                  Clear All
                </button>
              </div>
              
              {measurementStats && (
                <div style={{ margin: '10px 0', padding: 10, backgroundColor: '#f5f5f5', borderRadius: 5 }}>
                  <h3>Statistics</h3>
                  <div>Count: {measurementStats.count}</div>
                  <div>Average: {measurementStats.average?.toFixed(2) || 'N/A'}</div>
                  <div>Minimum: {measurementStats.minimum?.toFixed(2) || 'N/A'}</div>
                  <div>Maximum: {measurementStats.maximum?.toFixed(2) || 'N/A'}</div>
                  <div>Sum: {measurementStats.sum?.toFixed(2) || 'N/A'}</div>
                </div>
              )}
              
              {latestMeasurement && (
                <div style={{ margin: '10px 0', padding: 10, backgroundColor: '#f0f8ff', borderRadius: 5 }}>
                  <h3>Latest Measurement</h3>
                  <div>Value: {latestMeasurement.value}</div>
                  <div>Timestamp: {new Date(latestMeasurement.created_at).toLocaleString()}</div>
                </div>
              )}
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>ID</th>
                    <th style={tableHeaderStyle}>Value</th>
                    <th style={tableHeaderStyle}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements?.map(measurement => (
                    <tr key={measurement.id} style={tableRowStyle}>
                      <td style={tableCellStyle}>{measurement.id}</td>
                      <td style={tableCellStyle}>{measurement.value}</td>
                      <td style={tableCellStyle}>{new Date(measurement.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f2f2f2',
  padding: '8px',
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid #ddd',
};

const tableCellStyle: React.CSSProperties = {
  padding: '8px',
};
