import "./App.css";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Button } from "./components/ui/button";
import Layout from "./app/layout";
import { PageProvider, usePage } from "./store/PageContext";
import DashboardPage from "./app/DashboardPage";
import ConnectionsPage from "./app/ConnectionsPage";

const queryClient = new QueryClient()

function App() {
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

  if (currentPage.type === 'dashboard') {
    return <DashboardPage dashboardId={currentPage.dashboardId} />;
  }
  
  return <ConnectionsPage />;
}

export default App;
