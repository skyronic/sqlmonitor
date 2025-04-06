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
      // Secret key: Option+S (ß) on macOS
      if (e.key === 'ß') {
          seedDatabase();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
      <QueryClientProvider client={queryClient}>
    <PageProvider>
        <Layout>
          <PageContent />
        </Layout>
    </PageProvider>
      </QueryClientProvider>
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
