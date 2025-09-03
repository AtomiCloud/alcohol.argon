import { withApiAtomi } from '@/adapters/atomi/next';
import { buildTime } from '@/adapters/external/core';

export default withApiAtomi(buildTime, async (req, res, { authState }) => {
  if (!authState.isAuthenticated) {
    res.status(401).json({ message: 'Unauthorized' });
    res.end();
  } else {
    res.json(authState);
    res.end();
  }
});
