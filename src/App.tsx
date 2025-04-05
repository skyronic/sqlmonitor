import "./App.css";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import Layout from "./app/layout";
import { PageProvider, usePage } from "./store/PageContext";
import DashboardPage from "./app/DashboardPage";
import ConnectionsPage from "./app/ConnectionsPage";
import { useEffect } from "react";
import { seedDatabase } from "./store/seedData";

const queryClient = new QueryClient()

function App() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Option(Alt)+Shift+S keyboard shortcut
      if (e.altKey && e.shiftKey && e.key === 'S') {
        if (confirm('This will reset the database with sample data. Continue?')) {
          seedDatabase();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PageProvider>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <PageContent />
        </Layout>
      </QueryClientProvider>
    </PageProvider>
  )
}

const PageContent = () => {
  const { currentPage } = usePage();

  if (currentPage.type === 'category') {
    return <DashboardPage dashboardId={currentPage.categoryId} />;
  }
  
  return <ConnectionsPage />;
}

export default App;
