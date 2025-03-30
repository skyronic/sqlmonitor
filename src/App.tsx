import "./App.css";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import TestBed from "./components/TestBed";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestBed />
    </QueryClientProvider>
  )

}

export default App;
