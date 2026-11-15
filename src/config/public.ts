import type { CommonConfig } from './common/schema';
import type { ClientConfig } from './client/schema';

// This is the browser contract. New schema/environment fields are private until
// they are deliberately added here, including fields nested under public objects.
export function projectPublicConfig(common: CommonConfig, client: ClientConfig) {
  return {
    common: {
      landscape: common.landscape,
      app: {
        name: common.app.name,
        description: common.app.description,
        url: common.app.url,
        build: { sha: common.app.build.sha, version: common.app.build.version, time: common.app.build.time },
        servicetree: {
          landscape: common.app.servicetree.landscape,
          platform: common.app.servicetree.platform,
          service: common.app.servicetree.service,
          module: common.app.servicetree.module,
        },
      },
      seo: {
        twitter: {
          ...(common.seo.twitter.site === undefined ? {} : { site: common.seo.twitter.site }),
          ...(common.seo.twitter.creator === undefined ? {} : { creator: common.seo.twitter.creator }),
        },
        og: { locale: common.seo.og.locale },
      },
      pwa: {
        themeColor: common.pwa.themeColor,
        backgroundColor: common.pwa.backgroundColor,
        display: common.pwa.display,
        orientation: common.pwa.orientation,
        categories: [...common.pwa.categories],
        startUrl: common.pwa.startUrl,
        scope: common.pwa.scope,
      },
      errorPortal: {
        baseUri: common.errorPortal.baseUri,
        version: common.errorPortal.version,
        service: common.errorPortal.service,
      },
      clients: { alcohol: { zinc: { url: common.clients.alcohol.zinc.url } } },
      onboarding: { defaultCharityId: common.onboarding.defaultCharityId },
    },
    client: {
      landscape: client.landscape,
      payment: { airwallex: { env: client.payment.airwallex.env } },
      features: { showStreaks: client.features.showStreaks, emojiTitles: client.features.emojiTitles },
      support: { email: client.support.email },
      navbarshowoff: client.navbarshowoff,
      navbar: { showAuth: client.navbar.showAuth },
      tracker: { plausible: { enabled: client.tracker.plausible.enabled, domain: client.tracker.plausible.domain } },
      faro: {
        enabled: client.faro.enabled,
        collectorurl: client.faro.collectorurl,
        sessionTracking: {
          enabled: client.faro.sessionTracking.enabled,
          samplingRate: client.faro.sessionTracking.samplingRate,
        },
      },
    },
  };
}

export type PublicConfig = ReturnType<typeof projectPublicConfig>;
