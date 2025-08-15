/**
 * Creates a debounced ResizeObserver that helps prevent loops
 * by batching resize observations using requestAnimationFrame
 */
export function createDebouncedResizeObserver(
  callback: ResizeObserverCallback
): ResizeObserver {
  let rafId: number | null = null;
  let pendingEntries: ResizeObserverEntry[] = [];

  const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
    // Add new entries to pending list
    pendingEntries.push(...entries);

    // Cancel any pending RAF call
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    // Schedule callback for next frame
    rafId = requestAnimationFrame(() => {
      try {
        // Call the original callback with all pending entries
        callback(pendingEntries, observer);
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
      } finally {
        // Clear pending entries and RAF ID
        pendingEntries = [];
        rafId = null;
      }
    });
  };

  return new ResizeObserver(debouncedCallback);
}

/**
 * A safer ResizeObserver wrapper that automatically handles common errors
 */
export class SafeResizeObserver extends ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const safeCallback: ResizeObserverCallback = (entries, observer) => {
      try {
        // Use setTimeout to break out of the current call stack
        setTimeout(() => {
          try {
            callback(entries, observer);
          } catch (error) {
            // Silently handle ResizeObserver errors
            if (
              error instanceof Error &&
              (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
               error.message.includes('ResizeObserver loop limit exceeded'))
            ) {
              return;
            }
            console.error('ResizeObserver error:', error);
          }
        }, 0);
      } catch (error) {
        // Suppress any immediate errors
        if (
          error instanceof Error &&
          (error.message.includes('ResizeObserver loop completed with undelivered notifications') ||
           error.message.includes('ResizeObserver loop limit exceeded'))
        ) {
          return;
        }
        console.error('ResizeObserver error:', error);
      }
    };

    super(safeCallback);
  }
}
