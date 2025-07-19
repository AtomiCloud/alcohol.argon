'use client';

import { ClientConfig, CommonConfig } from '@/config';
import { faro, getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { useClientConfig, useCommonConfig } from '../config';

export default function FrontendObservability() {
  const clientCfg = useClientConfig<ClientConfig>();
  const commonCfg = useCommonConfig<CommonConfig>();
  const st = commonCfg.app.servicetree;
  const fcfg = clientCfg.faro;

  // skip if already initialized
  if (faro.api || !fcfg.enabled) {
    return null;
  }

  const name = `${st.module}.${st.service}.${st.platform}`;
  try {
    initializeFaro({
      url: fcfg.collectorurl,
      app: {
        name,
        version: commonCfg.app.build.version,
        environment: st.landscape,
      },
      sessionTracking: {
        enabled: fcfg.sessionTracking.enabled,
        samplingRate: fcfg.sessionTracking.samplingRate,
      },
      instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
    });
  } catch (e) {
    return null;
  }
  return null;
}
