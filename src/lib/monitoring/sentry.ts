/**
 * Error Monitoring & Crash Reporting Integration (Sentry / Centralized Observer)
 * Gracefully captures runtime exceptions, unhandled rejections, and business anomalies.
 */

export interface ErrorReportContext {
  userId?: string;
  role?: string;
  route?: string;
  extra?: Record<string, unknown>;
}

export function captureException(error: Error | unknown, context?: ErrorReportContext) {
  const isProd = process.env.NODE_ENV === 'production';
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  // Structured production error log
  const payload = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '0.1.0-prod',
    ...context,
  };

  if (sentryDsn) {
    // If Sentry DSN is configured, dispatch to Sentry Store API via Beacon/Fetch
    try {
      if (typeof window !== 'undefined') {
        // Client-side Sentry event dispatch
        const sentryMatch = sentryDsn.match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)$/);
        if (sentryMatch) {
          const [, key, host, projectId] = sentryMatch;
          const endpoint = `https://${host}/api/${projectId}/store/?sentry_key=${key}&sentry_version=7`;
          const body = JSON.stringify({
            event_id: crypto.randomUUID().replace(/-/g, ''),
            timestamp: new Date().toISOString(),
            platform: 'javascript',
            environment: process.env.NODE_ENV,
            message: error instanceof Error ? error.message : String(error),
            exception: {
              values: [
                {
                  type: error instanceof Error ? error.name : 'Error',
                  value: error instanceof Error ? error.message : String(error),
                  stacktrace: error instanceof Error && error.stack ? { frames: [{ filename: error.stack }] } : undefined,
                },
              ],
            },
            user: context?.userId ? { id: context.userId, role: context?.role } : undefined,
            extra: { ...context?.extra, route: context?.route },
          });

          if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, body);
          } else {
            fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
          }
        }
      }
    } catch (_) {
      // Never let monitoring crashes break user experience
    }
  }

  if (!isProd) {
    console.error('[RaddiBhaav Monitoring]', payload);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[RaddiBhaav Monitoring : ${level.toUpperCase()}]`, message, extra || '');
  }
}
