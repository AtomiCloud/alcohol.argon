import { buildTime } from '@/adapters/external/core';
import { withApiLogtoOnly } from '@/adapters/atomi/next';

export default withApiLogtoOnly(buildTime, (req, res, auth) => {
  auth.handleAuthRoutes({ fetchUserInfo: true })(req, res);
});
