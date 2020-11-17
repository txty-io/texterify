import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

if (process.env.SENTRY_DSN_FRONTEND) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN_FRONTEND,
        integrations: [new Integrations.BrowserTracing()]
    });
}

window.Sentry = Sentry;
