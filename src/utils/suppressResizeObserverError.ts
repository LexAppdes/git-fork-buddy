/**
 * Suppresses the "ResizeObserver loop completed with undelivered notifications" error
 * This is a common, harmless error that occurs when ResizeObserver callbacks trigger
 * additional resize events, creating a loop that the browser intentionally breaks.
 */
export function suppressResizeObserverError() {
  // Store the original error handler
  const originalErrorHandler = window.onerror;
  
  // Override the error handler to filter out ResizeObserver errors
  window.onerror = (message, source, lineno, colno, error) => {
    // Check if the error is the ResizeObserver loop error
    if (
      typeof message === 'string' && 
      message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Suppress this specific error by returning true
      return true;
    }
    
    // For all other errors, use the original handler or default behavior
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    
    return false;
  };

  // Also handle unhandled promise rejections that might contain this error
  const originalUnhandledRejection = window.onunhandledrejection;
  
  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    
    if (
      reason &&
      typeof reason.message === 'string' &&
      reason.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      event.preventDefault();
      return;
    }
    
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
}
