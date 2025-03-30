import React, { useState } from 'react';
import { 
  useListConnections, 
  useAddConnection, 
  useUpdateConnection, 
  useDeleteConnection 
} from '../store/backend';
import { Connection } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import  {invoke} from "@tauri-apps/api/core"

const ConnectionsPage: React.FC = () => {
  const { data: connections = [], isLoading } = useListConnections();
  const addConnectionMutation = useAddConnection();
  const updateConnectionMutation = useUpdateConnection();
  const deleteConnectionMutation = useDeleteConnection();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'postgres' | 'mysql'>('postgres');
  const [connectionString, setConnectionString] = useState('');
  const [testResults, setTestResults] = useState<{ success: boolean; logs: string[] } | null>(null);

  const resetForm = () => {
    setName('');
    setType('postgres');
    setConnectionString('');
    setIsEditing(false);
    setEditingConnection(null);
    setTestResults(null);
    setShowForm(false);
  };

  const handleAdd = async () => {
    try {
      await addConnectionMutation.mutateAsync({
        name,
        type,
        connection_string: connectionString,
      });
      resetForm();
    } catch (error) {
      console.error('Error adding connection:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingConnection) return;
    
    try {
      await updateConnectionMutation.mutateAsync({
        id: editingConnection.id,
        name,
        type,
        connection_string: connectionString,
      });
      resetForm();
    } catch (error) {
      console.error('Error updating connection:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteConnectionMutation.mutateAsync(id);
      resetForm();
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const startEditing = (connection: Connection) => {
    setIsEditing(true);
    setEditingConnection(connection);
    setName(connection.name);
    setType(connection.type);
    setConnectionString(connection.connection_string);
    setShowForm(true);
  };

  const testConnection = async () => {
    try {
      setTestResults({
        success: false,
        logs: ["Connecting to database..."]
      });
      
      const result = await invoke("test_connection", {
        connectionString: connectionString,
        connectionType: type
      });
      
      setTestResults(result as { success: boolean; logs: string[] });
    } catch (error) {
      console.error("Connection test error:", error);
      setTestResults({
        success: false,
        logs: [
          "Connecting to database...",
          `Error: ${error}`
        ]
      });
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Connections</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Add Connection
          </Button>
        )}
      </div>
      
      {/* Form for adding/editing connections */}
      {showForm && (
        <div className="bg-card p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Edit Connection' : 'Add New Connection'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Connection Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Database"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Database Type</label>
              <Select
                value={type}
                onValueChange={(value: 'postgres' | 'mysql') => setType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Connection String</label>
              <Input
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="postgres://user:password@localhost:5432/database"
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={isEditing ? handleUpdate : handleAdd}
                disabled={!name || !connectionString}
              >
                {isEditing ? 'Update' : 'Add'} Connection
              </Button>
              
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={!connectionString}
              >
                Test Connection
              </Button>
              
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>

            {testResults && (
              <div className={`mt-4 p-3 rounded-md ${testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`text-sm font-semibold ${testResults.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResults.success ? 'Connection Successful' : 'Connection Failed'}
                </h3>
                <div className="mt-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                  {testResults.logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Connection List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Connections</h2>
        
        {isLoading ? (
          <div className="text-center py-4">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No connections added yet. Click the "Add Connection" button to get started.
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {connections.map((connection) => (
              <div 
                key={connection.id} 
                className="bg-card p-4 rounded-lg shadow flex justify-between items-center w-full"
              >
                <div>
                  <h3 className="font-medium">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {connection.type === 'postgres' ? 'PostgreSQL' : 'MySQL'}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => startEditing(connection)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(connection.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage; 