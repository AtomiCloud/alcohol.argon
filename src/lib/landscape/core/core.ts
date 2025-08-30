type LandscapeSource = () => string;

const envLandscapeSource: LandscapeSource = () => process.env.LANDSCAPE || process.env.ATOMI_LANDSCAPE || 'base';

export { envLandscapeSource };
export type { LandscapeSource };
