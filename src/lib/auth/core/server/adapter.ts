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

function authBuilder(input: AuthModuleInput): AuthModuleOutput {
  const { endpoint, appId, appSecret, baseUrl, cookieSecret, landscape, resourceTree, scopes } = input;
  const resources = Object.values(resourceTree);
  const client = new LogtoClient({
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
