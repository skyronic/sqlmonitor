import React from 'react';

interface DashboardPageProps {
  dashboardId: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ dashboardId }) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Dashboard ID: {dashboardId}</p>
    </div>
  );
};

export default DashboardPage; 