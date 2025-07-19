/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateUserReq {
  username?: string | null;
}

export interface ErrorInfo {
  schema?: any;
  id?: string | null;
  title?: string | null;
  version?: string | null;
}

export interface UpdateUserReq {
  username?: string | null;
}

export interface UserExistRes {
  exists: boolean;
}

export interface UserPrincipalRes {
  id?: string | null;
  username?: string | null;
}

export interface UserRes {
  principal: UserPrincipalRes;
}

export type GetRootData = any;

export interface VUserListParams {
  Id?: string;
  Username?: string;
  /** @format int32 */
  Limit?: number;
  /** @format int32 */
  Skip?: number;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserListData = UserPrincipalRes[];

export type VUserCreateData = UserPrincipalRes;

export type VUserMeListData = string;

export type VUserMeAllListData = UserRes;

export type VUserDetailData = UserRes;

export type VUserUpdateData = UserPrincipalRes;

export type VUserDeleteData = any;

export type VUserUsernameDetailData = UserRes;

export type VUserExistDetailData = UserExistRes;

export type VErrorInfoListData = string[];

export type VErrorInfoDetailData = ErrorInfo;

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  JsonApi = 'application/vnd.api+json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(key => 'undefined' !== typeof query[key]);
    return keys
      .map(key => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async response => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then(data => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch(e => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data.data;
    });
  };
}

/**
 * @title Pichu Alcohol Zinc API
 * @version 1.0
 * @contact kirinnee <kirinnee97@gmail.com>
 *
 * Alcohol-Zinc: API for Phinish
 */
export class AlcoholZincApi<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags System
   * @name GetRoot
   * @request GET:/
   * @secure
   * @response `200` `GetRootData` Success
   */
  getRoot = (params: RequestParams = {}) =>
    this.request<GetRootData, any>({
      path: `/`,
      method: 'GET',
      secure: true,
      ...params,
    });

  api = {
    /**
     * No description
     *
     * @tags User
     * @name VUserList
     * @request GET:/api/v{version}/User
     * @secure
     * @response `200` `VUserListData` Success
     */
    vUserList: ({ version, ...query }: VUserListParams, params: RequestParams = {}) =>
      this.request<VUserListData, any>({
        path: `/api/v${version}/User`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserCreate
     * @request POST:/api/v{version}/User
     * @secure
     * @response `200` `VUserCreateData` Success
     */
    vUserCreate: (version: string, data: CreateUserReq, params: RequestParams = {}) =>
      this.request<VUserCreateData, any>({
        path: `/api/v${version}/User`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserMeList
     * @request GET:/api/v{version}/User/Me
     * @secure
     * @response `200` `VUserMeListData` Success
     */
    vUserMeList: (version: string, params: RequestParams = {}) =>
      this.request<VUserMeListData, any>({
        path: `/api/v${version}/User/Me`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserMeAllList
     * @request GET:/api/v{version}/User/Me/All
     * @secure
     * @response `200` `VUserMeAllListData` Success
     */
    vUserMeAllList: (version: string, params: RequestParams = {}) =>
      this.request<VUserMeAllListData, any>({
        path: `/api/v${version}/User/Me/All`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserDetail
     * @request GET:/api/v{version}/User/{id}
     * @secure
     * @response `200` `VUserDetailData` Success
     */
    vUserDetail: (id: string, version: string, params: RequestParams = {}) =>
      this.request<VUserDetailData, any>({
        path: `/api/v${version}/User/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserUpdate
     * @request PUT:/api/v{version}/User/{id}
     * @secure
     * @response `200` `VUserUpdateData` Success
     */
    vUserUpdate: (id: string, version: string, data: UpdateUserReq, params: RequestParams = {}) =>
      this.request<VUserUpdateData, any>({
        path: `/api/v${version}/User/${id}`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserDelete
     * @request DELETE:/api/v{version}/User/{id}
     * @secure
     * @response `200` `VUserDeleteData` Success
     */
    vUserDelete: (id: string, version: string, params: RequestParams = {}) =>
      this.request<VUserDeleteData, any>({
        path: `/api/v${version}/User/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserUsernameDetail
     * @request GET:/api/v{version}/User/username/{username}
     * @secure
     * @response `200` `VUserUsernameDetailData` Success
     */
    vUserUsernameDetail: (username: string, version: string, params: RequestParams = {}) =>
      this.request<VUserUsernameDetailData, any>({
        path: `/api/v${version}/User/username/${username}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name VUserExistDetail
     * @request GET:/api/v{version}/User/exist/{username}
     * @secure
     * @response `200` `VUserExistDetailData` Success
     */
    vUserExistDetail: (username: string, version: string, params: RequestParams = {}) =>
      this.request<VUserExistDetailData, any>({
        path: `/api/v${version}/User/exist/${username}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags V1Error
     * @name VErrorInfoList
     * @request GET:/api/v{version}/error-info
     * @secure
     * @response `200` `VErrorInfoListData` Success
     */
    vErrorInfoList: (version: string, params: RequestParams = {}) =>
      this.request<VErrorInfoListData, any>({
        path: `/api/v${version}/error-info`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags V1Error
     * @name VErrorInfoDetail
     * @request GET:/api/v{version}/error-info/{id}
     * @secure
     * @response `200` `VErrorInfoDetailData` Success
     */
    vErrorInfoDetail: (id: string, version: string, params: RequestParams = {}) =>
      this.request<VErrorInfoDetailData, any>({
        path: `/api/v${version}/error-info/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
