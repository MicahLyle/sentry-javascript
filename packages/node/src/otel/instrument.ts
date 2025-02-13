import type { Instrumentation } from '@opentelemetry/instrumentation';
import { addOpenTelemetryInstrumentation } from '@sentry/opentelemetry';

const INSTRUMENTED: Record<string, Instrumentation> = {};

/**
 * Instrument an OpenTelemetry instrumentation once.
 * This will skip running instrumentation again if it was already instrumented.
 */
export function generateInstrumentOnce<Options = unknown>(
  name: string,
  creator: (options?: Options) => Instrumentation,
): ((options?: Options) => void) & { id: string } {
  return Object.assign(
    (options?: Options) => {
      if (INSTRUMENTED[name]) {
        // If options are provided, ensure we update them
        if (options) {
          INSTRUMENTED[name].setConfig(options);
        }
        return;
      }

      const instrumentation = creator(options);
      INSTRUMENTED[name] = instrumentation;

      addOpenTelemetryInstrumentation(instrumentation);
    },
    { id: name },
  );
}
