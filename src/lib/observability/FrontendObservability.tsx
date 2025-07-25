'use client';

import { ClientConfig, CommonConfig } from '@/config';
import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { useClientConfig, useCommonConfig } from '@/lib/config/providers';

export default function FrontendObservability() {
  const clientCfg = useClientConfig<ClientConfig>();
  const commonCfg = useCommonConfig<CommonConfig>();
  const st = commonCfg.app.servicetree;
  const fCfg = clientCfg.faro;

  // skip if already initialized
  if (faro.api || !fCfg.enabled) {
    return null;
  }

  const name = `${st.module}.${st.service}.${st.platform}`;
  try {
    initializeFaro({
      url: fCfg.collectorurl,
      app: {
        name,
        version: commonCfg.app.build.version,
        environment: st.landscape,
      },
      sessionTracking: {
        enabled: fCfg.sessionTracking.enabled,
        samplingRate: fCfg.sessionTracking.samplingRate,
      },
      instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
    });
  } catch (e) {
    return null;
  }
  return null;
}
