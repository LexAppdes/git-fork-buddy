import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './Index.css'
import { suppressResizeObserverError } from './utils/suppressResizeObserverError'

// Suppress ResizeObserver loop errors
suppressResizeObserverError()

// Additional protection: catch any ResizeObserver errors that might slip through
window.addEventListener('error', (event) => {
  if (
    event.error &&
    typeof event.error.message === 'string' &&
    (event.error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
     event.error.message.includes('ResizeObserver loop limit exceeded'))
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
