import React, { useState } from 'react';
import { useListMonitors, useListCategories, useListConnections, useAddMeasurement, useEditMonitor } from '@/store/backend';
import { DashboardHeader } from './DashboardHeader';
import { MonitorCard } from './MonitorCard';
import { runMonitor } from '@/lib/utils';
import type { Monitor } from '@/types';

interface DashboardPageProps {
  dashboardId: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ dashboardId }) => {
  const categoryId = parseInt(dashboardId);
  const { data: monitors } = useListMonitors(categoryId);
  const { data: categories } = useListCategories();
  const { data: connections } = useListConnections();
  const addMeasurement = useAddMeasurement();
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [currentMonitorId, setCurrentMonitorId] = useState<number>(0);
  const editMonitor = useEditMonitor(currentMonitorId);
  
  const category = categories?.find(c => c.id === categoryId);
  const categoryName = category?.name || 'Dashboard';

  const handleRunAll = async () => {
    if (!monitors || !connections) return;
    
    setIsRunningAll(true);
    try {
      // Run monitors sequentially to avoid hook issues
      for (const monitor of monitors) {
        const connection = connections.find(c => c.id === monitor.connection_id);
        if (!connection) continue;

        setCurrentMonitorId(monitor.id);

        try {
          await runMonitor(
            monitor,
            connection,
            async (data: { id: number } & Partial<Monitor>) => {
              const { id, ...updateData } = data;
              await editMonitor.mutateAsync(updateData);
            },
            async (data: { monitor_id: number, value: number }) => {
              await addMeasurement.mutateAsync({
                monitor_id: monitor.id,
                value: data.value
              });
            }
          );
        } catch (error) {
          console.error(`Error running monitor ${monitor.id}:`, error);
          // Continue with other monitors even if one fails
        }
      }
    } finally {
      setIsRunningAll(false);
    }
  };

  const handleEditDashboard = () => {
    console.log('Edit dashboard');
  };

  const handleDeleteDashboard = () => {
    console.log('Delete dashboard');
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={categoryName}
        description={null}
        categoryId={categoryId}
        onRunAll={handleRunAll}
        onEditDashboard={handleEditDashboard}
        onDeleteDashboard={handleDeleteDashboard}
        isRunningAll={isRunningAll}
      />
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitors?.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 