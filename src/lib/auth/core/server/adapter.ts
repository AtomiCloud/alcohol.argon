import LogtoClient from '@logto/next';

interface AuthModuleInput {
  endpoint: string;
  appId: string;
  appSecret: string;
  baseUrl: string;
  cookieSecret: string;
  landscape: string;
  resourceTree: Record<string, string>;
  scopes: string[];
}

interface AuthModuleOutput {
  client: LogtoClient;
}

type NodeClient = Awaited<ReturnType<LogtoClient['createNodeClientFromNextApi']>>;
type RefreshFn = (resource?: string, organizationId?: string) => Promise<string>;

// The SDK builds a new node client, with its own copy of the session cookie, on every call. One
// request (the Logto API route, then the auth retriever) would then refresh tokens several times
// in parallel with the same refresh token. Once Logto rotates it, reusing the consumed token
// revokes the whole grant and signs the user out. So each request gets one node client, and its
// refreshes run one at a time, each with the refresh token the previous one stored.
class RequestScopedLogtoClient extends LogtoClient {
  private readonly nodeClients = new WeakMap<object, Promise<NodeClient>>();

  override createNodeClientFromNextApi(...args: Parameters<LogtoClient['createNodeClientFromNextApi']>) {
    const [request] = args;
    let nodeClient = this.nodeClients.get(request);
    if (!nodeClient) {
      nodeClient = super.createNodeClientFromNextApi(...args).then(serializeRefreshes);
      this.nodeClients.set(request, nodeClient);
    }
    return nodeClient;
  }
}

function serializeRefreshes(nodeClient: NodeClient): NodeClient {
  const target = nodeClient as unknown as { getAccessTokenByRefreshToken: RefreshFn };
  const refresh = target.getAccessTokenByRefreshToken.bind(nodeClient);
  let queue: Promise<unknown> = Promise.resolve();
  target.getAccessTokenByRefreshToken = (resource, organizationId) => {
    const run = queue.then(() => refresh(resource, organizationId));
    queue = run.catch(() => undefined);
    return run;
  };
  return nodeClient;
}

function authBuilder(input: AuthModuleInput): AuthModuleOutput {
  const { endpoint, appId, appSecret, baseUrl, cookieSecret, landscape, resourceTree, scopes } = input;
  if (!appSecret.trim() || !cookieSecret.trim()) {
    throw new Error('Required server configuration is unavailable');
  }
  const resources = Object.values(resourceTree);
  const client = new RequestScopedLogtoClient({
    endpoint,
    appId,
    appSecret,
    baseUrl,
    cookieSecret,
    cookieSecure: landscape !== 'lapras',
    resources,
    scopes,
  });
  return { client };
}

export { authBuilder };
export type { AuthModuleInput, AuthModuleOutput };
