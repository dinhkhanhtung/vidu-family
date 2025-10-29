import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  environment: process.env.NODE_ENV,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Release Health
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Performance Monitoring
  enabled: process.env.NODE_ENV === 'production',

  // Filter out specific errors
  beforeSend(event, hint) {
    // Filter out network errors and other non-actionable errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;
        if (
          message.includes('Network request failed') ||
          message.includes('Load failed') ||
          message.includes('Script error')
        ) {
          return null;
        }
      }
    }
    return event;
  },

  // Set tags for better error categorization
  initialScope: {
    tags: {
      component: 'family-expense-manager',
    },
  },
});

export default Sentry;
