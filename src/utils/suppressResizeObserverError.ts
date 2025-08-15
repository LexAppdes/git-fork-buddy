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
      (message.includes('ResizeObserver loop completed with undelivered notifications') ||
       message.includes('ResizeObserver loop limit exceeded'))
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
      (reason.message.includes('ResizeObserver loop completed with undelivered notifications') ||
       reason.message.includes('ResizeObserver loop limit exceeded'))
    ) {
      event.preventDefault();
      return;
    }

    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };

  // Handle console errors as well (some libraries might log to console)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Check if any of the arguments contain the ResizeObserver error message
    const hasResizeObserverError = args.some(arg =>
      typeof arg === 'string' &&
      (arg.includes('ResizeObserver loop completed with undelivered notifications') ||
       arg.includes('ResizeObserver loop limit exceeded'))
    );

    if (hasResizeObserverError) {
      // Suppress the error by not calling the original console.error
      return;
    }

    // For all other console errors, call the original function
    originalConsoleError.apply(console, args);
  };

  // Use a more robust approach by catching ResizeObserver errors at the source
  if (typeof window !== 'undefined' && window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;

    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          try {
            callback(entries, observer);
          } catch (error) {
            // Suppress ResizeObserver loop errors
            if (
              error instanceof Error &&
              (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
               error.message.includes('ResizeObserver loop limit exceeded'))
            ) {
              return;
            }
            // Re-throw other errors
            throw error;
          }
        };

        super(wrappedCallback);
      }
    };
  }
}
