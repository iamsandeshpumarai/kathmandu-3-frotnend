import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter} from 'react-router-dom'
import { DataproviderWraper } from './Component/Context/ContextDataprovider.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DataproviderWraper>
      <BrowserRouter>
        <App/>
</BrowserRouter>
      </DataproviderWraper>
    </QueryClientProvider>
  </StrictMode>
)