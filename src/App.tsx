import "./App.css";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Button } from "./components/ui/button";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button variant="outline">Click me</Button>
      </div>

    </QueryClientProvider>
  )

}

export default App;
