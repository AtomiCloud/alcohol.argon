declare namespace NodeJS {
  interface ProcessEnv {
    BUILD_TIME_COMMON_CONFIG?: string;
    BUILD_TIME_CLIENT_CONFIG?: string;
    BUILD_TIME_VARIABLES?: string;
    LANDSCAPE?: string;
    ATOMI_LANDSCAPE?: string;
  }
}
