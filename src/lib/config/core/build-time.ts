class BuildTimeProcessor {
  private readonly prefix: string;

  constructor(prefix?: string) {
    this.prefix = prefix || 'ATOMI_';
  }

  /**
   * Scan environment variables for ATOMI_ prefixed variables
   * @param env - Environment object (defaults to process.env)
   * @returns Filtered environment variables
   */
  scanEnvironmentVariables(env: Record<string, string | undefined> = process.env): Record<string, string> {
    const variables: Record<string, string> = {};

    for (const [key, value] of Object.entries(env)) {
      if (!key.startsWith(this.prefix) || value === undefined) continue;
      variables[key] = value;
    }

    return variables;
  }
}

export { BuildTimeProcessor };
