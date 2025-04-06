import React from 'react';
import { useListMonitors, useListCategories } from '@/store/backend';
import { DashboardHeader } from './DashboardHeader';
import { MonitorCard } from './MonitorCard';

interface DashboardPageProps {
  dashboardId: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ dashboardId }) => {
  const categoryId = parseInt(dashboardId);
  const { data: monitors } = useListMonitors(categoryId);
  const { data: categories } = useListCategories();
  
  const category = categories?.find(c => c.id === categoryId);
  const categoryName = category?.name || 'Dashboard';

  const handleRunAll = () => {
    console.log('Running all monitors');
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