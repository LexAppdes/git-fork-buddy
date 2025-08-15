import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './Index.css'
import { suppressResizeObserverError } from './utils/suppressResizeObserverError'

// Suppress ResizeObserver loop errors
suppressResizeObserverError()

createRoot(document.getElementById("root")!).render(<App />);
