import * as Sentry from "@sentry/react-native";

/**
 * Error severity levels for categorizing errors
 */
export type ErrorSeverity = "fatal" | "error" | "warning" | "info" | "debug";

/**
 * Error category for tagging and filtering
 */
export type ErrorCategory =
  | "database"
  | "navigation"
  | "data-operation"
  | "ui"
  | "network"
  | "system"
  | "unknown";

/**
 * Capture an exception with full context
 */
export function captureException(
  error: Error | string,
  context?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    userId?: string;
  },
) {
  const errorObj = typeof error === "string" ? new Error(error) : error;

  // Set context
  if (context?.extra) {
    Sentry.captureException(errorObj, {
      extra: context.extra,
      tags: {
        category: context.category || "unknown",
        ...context.tags,
      },
      level: context.severity || "error",
    });
  } else {
    Sentry.captureException(errorObj, {
      tags: {
        category: context?.category || "unknown",
        ...context?.tags,
      },
      level: context?.severity || "error",
    });
  }

  // Log to console in development
  if (__DEV__) {
    console.error(
      `[Sentry] ${context?.category || "unknown"}:`,
      errorObj.message,
    );
  }
}

/**
 * Capture a message for non-error events
 */
export function captureMessage(
  message: string,
  options?: {
    level?: ErrorSeverity;
    category?: ErrorCategory;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  },
) {
  Sentry.captureMessage(message, {
    level: options?.level || "info",
    tags: {
      category: options?.category || "unknown",
      ...options?.tags,
    },
    extra: options?.extra,
  });

  if (__DEV__) {
    console.log(`[Sentry] ${message}`);
  }
}

/**
 * Add a breadcrumb for tracking user actions and events
 */
export function addBreadcrumb(
  message: string,
  options?: {
    category?: "user-action" | "system" | "data" | "navigation";
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  },
) {
  Sentry.addBreadcrumb({
    message,
    category: options?.category || "user-action",
    level: options?.level || "info",
    data: options?.data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrap an async function with automatic error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: {
    operation?: string;
    category?: ErrorCategory;
  },
): Promise<T | null> {
  try {
    addBreadcrumb(`Operation started: ${context?.operation || "unknown"}`, {
      category: "system",
    });
    return await fn();
  } catch (error) {
    captureException(error as Error, {
      category: context?.category || "unknown",
      extra: {
        operation: context?.operation,
      },
    });
    return null;
  }
}

/**
 * Wrap a sync function with automatic error handling
 */
export function withErrorHandlingSync<T>(
  fn: () => T,
  context?: {
    operation?: string;
    category?: ErrorCategory;
  },
): T | null {
  try {
    addBreadcrumb(`Operation started: ${context?.operation || "unknown"}`, {
      category: "system",
    });
    return fn();
  } catch (error) {
    captureException(error as Error, {
      category: context?.category || "unknown",
      extra: {
        operation: context?.operation,
      },
    });
    return null;
  }
}

/**
 * Set user information for error context
 */
export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email || undefined,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Set custom context for errors
 */
export function setCustomContext(key: string, value: Record<string, any>) {
  Sentry.setContext(key, value);
}

/**
 * Set a tag for filtering errors in Sentry dashboard
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Capture database error specifically
 */
export function captureDatabaseError(
  error: Error | string,
  operation: string,
  details?: Record<string, any>,
) {
  captureException(error, {
    category: "database",
    severity: "error",
    tags: {
      operation,
    },
    extra: details,
  });
}

/**
 * Capture data operation error
 */
export function captureDataOperationError(
  error: Error | string,
  operation: string,
  details?: Record<string, any>,
) {
  captureException(error, {
    category: "data-operation",
    severity: "error",
    tags: {
      operation,
    },
    extra: details,
  });
}

/**
 * Capture UI error
 */
export function captureUIError(
  error: Error | string,
  component: string,
  details?: Record<string, any>,
) {
  captureException(error, {
    category: "ui",
    severity: "error",
    tags: {
      component,
    },
    extra: details,
  });
}

/**
 * Capture navigation error
 */
export function captureNavigationError(
  error: Error | string,
  route: string,
  details?: Record<string, any>,
) {
  captureException(error, {
    category: "navigation",
    severity: "error",
    tags: {
      route,
    },
    extra: details,
  });
}
