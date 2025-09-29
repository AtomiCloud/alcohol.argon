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

export interface CharityPrincipalRes {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface CharityRes {
  principal: CharityPrincipalRes;
}

export interface CompleteHabitReq {
  notes?: string | null;
}

export interface ConfigurationPrincipalRes {
  id?: string | null;
  userId?: string | null;
  timezone?: string | null;
  defaultCharityId?: string | null;
}

export interface ConfigurationRes {
  principal: ConfigurationPrincipalRes;
  charity: CharityPrincipalRes;
}

export interface CreateCharityReq {
  name?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface CreateConfigurationReq {
  timezone?: string | null;
  defaultCharityId?: string | null;
}

export interface CreateHabitReq {
  task?: string | null;
  daysOfWeek?: string[] | null;
  notificationTime?: string | null;
  stake?: string | null;
  /** @format uuid */
  charityId: string;
}

export interface CreateUserReq {
  idToken?: string | null;
  accessToken?: string | null;
}

export interface ErrorInfo {
  schema?: any;
  id?: string | null;
  title?: string | null;
  version?: string | null;
}

export interface HabitExecutionRes {
  /** @format uuid */
  id: string;
  /** @format uuid */
  habitVersionId: string;
  date?: string | null;
  status?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  paymentProcessed: boolean;
}

export interface HabitVersionRes {
  /** @format uuid */
  id: string;
  /** @format uuid */
  habitId: string;
  /** @format int32 */
  version: number;
  task?: string | null;
  daysOfWeek?: string[] | null;
  notificationTime?: string | null;
  stake?: string | null;
  ratio?: string | null;
  /** @format uuid */
  charityId: string;
}

export interface Info {
  landscape?: string | null;
  platform?: string | null;
  service?: string | null;
  module?: string | null;
  version?: string | null;
  status?: string | null;
  /** @format date-time */
  timeStamp: string;
}

export interface MarkDailyFailuresReq {
  date?: string | null;
  userIds?: string[] | null;
}

export type Unit = object;

export interface UpdateCharityReq {
  name?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateConfigurationReq {
  timezone?: string | null;
  defaultCharityId?: string | null;
}

export interface UpdateHabitReq {
  task?: string | null;
  daysOfWeek?: string[] | null;
  notificationTime?: string | null;
  stake?: string | null;
  /** @format uuid */
  charityId: string;
  enabled: boolean;
}

export interface UpdateUserReq {
  idToken?: string | null;
  accessToken?: string | null;
}

export interface UserPrincipalRes {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  emailVerified: boolean;
  active: boolean;
}

export interface UserRes {
  principal: UserPrincipalRes;
}

export interface VCharityListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharityListData = CharityPrincipalRes[];

export interface VCharityCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharityCreateData = CharityPrincipalRes;

export interface VCharityDetailParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharityDetailData = CharityRes;

export interface VCharityUpdateParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharityUpdateData = CharityPrincipalRes;

export interface VCharityDeleteParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharityDeleteData = Unit;

export interface VConfigurationDetailParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationDetailData = ConfigurationRes;

export interface VConfigurationUpdateParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationUpdateData = ConfigurationPrincipalRes;

export interface VConfigurationCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationCreateData = ConfigurationPrincipalRes;

export interface VEmailCreateParams {
  to: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VEmailCreateData = any;

export interface VHabitListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitListData = HabitVersionRes[];

export interface VHabitCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitCreateData = HabitVersionRes;

export interface VHabitDetailParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitDetailData = HabitVersionRes;

export interface VHabitUpdateParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitUpdateData = HabitVersionRes;

export interface VHabitDeleteParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitDeleteData = Unit;

export interface VHabitExecutionsCreateParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitExecutionsCreateData = HabitExecutionRes;

export interface VHabitExecutionsListParams {
  date?: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitExecutionsListData = HabitExecutionRes[];

export interface VHabitExecutionsMarkDailyFailuresCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

/** @format int32 */
export type VHabitExecutionsMarkDailyFailuresCreateData = number;

export type GetRootData = Info;

export interface VUserListParams {
  Id?: string;
  Username?: string;
  Email?: string;
  EmailVerified?: boolean;
  Active?: boolean;
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

export interface VUserCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserCreateData = UserPrincipalRes;

export interface VUserMeListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserMeListData = string;

export interface VUserMeAllListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserMeAllListData = UserRes;

export interface VUserDetailParams {
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserDetailData = UserRes;

export interface VUserUpdateParams {
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserUpdateData = UserPrincipalRes;

export interface VUserDeleteParams {
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserDeleteData = any;

export interface VUserUsernameDetailParams {
  username: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VUserUsernameDetailData = UserRes;

export interface VErrorInfoListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VErrorInfoListData = string[];

export interface VErrorInfoDetailParams {
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

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
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
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
      }, new FormData());
    },
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
      const r = response as HttpResponse<T, E>;
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
 * @title Lapras Alcohol Zinc API
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
      format: 'json',
      ...params,
    });

  api = {
    /**
     * No description
     *
     * @tags Charity
     * @name VCharityList
     * @request GET:/api/v{version}/Charity
     * @secure
     * @response `200` `VCharityListData` Success
     */
    vCharityList: ({ version, ...query }: VCharityListParams, params: RequestParams = {}) =>
      this.request<VCharityListData, any>({
        path: `/api/v${version}/Charity`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Charity
     * @name VCharityCreate
     * @request POST:/api/v{version}/Charity
     * @secure
     * @response `200` `VCharityCreateData` Success
     */
    vCharityCreate: ({ version, ...query }: VCharityCreateParams, data: CreateCharityReq, params: RequestParams = {}) =>
      this.request<VCharityCreateData, any>({
        path: `/api/v${version}/Charity`,
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
     * @tags Charity
     * @name VCharityDetail
     * @request GET:/api/v{version}/Charity/{id}
     * @secure
     * @response `200` `VCharityDetailData` Success
     */
    vCharityDetail: ({ id, version, ...query }: VCharityDetailParams, params: RequestParams = {}) =>
      this.request<VCharityDetailData, any>({
        path: `/api/v${version}/Charity/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Charity
     * @name VCharityUpdate
     * @request PUT:/api/v{version}/Charity/{id}
     * @secure
     * @response `200` `VCharityUpdateData` Success
     */
    vCharityUpdate: (
      { id, version, ...query }: VCharityUpdateParams,
      data: UpdateCharityReq,
      params: RequestParams = {},
    ) =>
      this.request<VCharityUpdateData, any>({
        path: `/api/v${version}/Charity/${id}`,
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
     * @tags Charity
     * @name VCharityDelete
     * @request DELETE:/api/v{version}/Charity/{id}
     * @secure
     * @response `200` `VCharityDeleteData` Success
     */
    vCharityDelete: ({ id, version, ...query }: VCharityDeleteParams, params: RequestParams = {}) =>
      this.request<VCharityDeleteData, any>({
        path: `/api/v${version}/Charity/${id}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Configuration
     * @name VConfigurationDetail
     * @request GET:/api/v{version}/Configuration/{id}
     * @secure
     * @response `200` `VConfigurationDetailData` Success
     */
    vConfigurationDetail: ({ id, version, ...query }: VConfigurationDetailParams, params: RequestParams = {}) =>
      this.request<VConfigurationDetailData, any>({
        path: `/api/v${version}/Configuration/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Configuration
     * @name VConfigurationUpdate
     * @request PUT:/api/v{version}/Configuration/{id}
     * @secure
     * @response `200` `VConfigurationUpdateData` Success
     */
    vConfigurationUpdate: (
      { id, version, ...query }: VConfigurationUpdateParams,
      data: UpdateConfigurationReq,
      params: RequestParams = {},
    ) =>
      this.request<VConfigurationUpdateData, any>({
        path: `/api/v${version}/Configuration/${id}`,
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
     * @tags Configuration
     * @name VConfigurationCreate
     * @request POST:/api/v{version}/Configuration
     * @secure
     * @response `200` `VConfigurationCreateData` Success
     */
    vConfigurationCreate: (
      { version, ...query }: VConfigurationCreateParams,
      data: CreateConfigurationReq,
      params: RequestParams = {},
    ) =>
      this.request<VConfigurationCreateData, any>({
        path: `/api/v${version}/Configuration`,
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
     * @tags Email
     * @name VEmailCreate
     * @request POST:/api/v{version}/Email/{to}
     * @secure
     * @response `200` `VEmailCreateData` Success
     */
    vEmailCreate: ({ to, version, ...query }: VEmailCreateParams, params: RequestParams = {}) =>
      this.request<VEmailCreateData, any>({
        path: `/api/v${version}/Email/${to}`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Habit
     * @name VHabitList
     * @request GET:/api/v{version}/Habit
     * @secure
     * @response `200` `VHabitListData` Success
     */
    vHabitList: ({ version, ...query }: VHabitListParams, params: RequestParams = {}) =>
      this.request<VHabitListData, any>({
        path: `/api/v${version}/Habit`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Habit
     * @name VHabitCreate
     * @request POST:/api/v{version}/Habit
     * @secure
     * @response `200` `VHabitCreateData` Success
     */
    vHabitCreate: ({ version, ...query }: VHabitCreateParams, data: CreateHabitReq, params: RequestParams = {}) =>
      this.request<VHabitCreateData, any>({
        path: `/api/v${version}/Habit`,
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
     * @tags Habit
     * @name VHabitDetail
     * @request GET:/api/v{version}/Habit/{id}
     * @secure
     * @response `200` `VHabitDetailData` Success
     */
    vHabitDetail: ({ id, version, ...query }: VHabitDetailParams, params: RequestParams = {}) =>
      this.request<VHabitDetailData, any>({
        path: `/api/v${version}/Habit/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Habit
     * @name VHabitUpdate
     * @request PUT:/api/v{version}/Habit/{id}
     * @secure
     * @response `200` `VHabitUpdateData` Success
     */
    vHabitUpdate: ({ id, version, ...query }: VHabitUpdateParams, data: UpdateHabitReq, params: RequestParams = {}) =>
      this.request<VHabitUpdateData, any>({
        path: `/api/v${version}/Habit/${id}`,
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
     * @tags Habit
     * @name VHabitDelete
     * @request DELETE:/api/v{version}/Habit/{id}
     * @secure
     * @response `200` `VHabitDeleteData` Success
     */
    vHabitDelete: ({ id, version, ...query }: VHabitDeleteParams, params: RequestParams = {}) =>
      this.request<VHabitDeleteData, any>({
        path: `/api/v${version}/Habit/${id}`,
        method: 'DELETE',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Habit
     * @name VHabitExecutionsCreate
     * @request POST:/api/v{version}/Habit/{id}/executions
     * @secure
     * @response `200` `VHabitExecutionsCreateData` Success
     */
    vHabitExecutionsCreate: (
      { id, version, ...query }: VHabitExecutionsCreateParams,
      data: CompleteHabitReq,
      params: RequestParams = {},
    ) =>
      this.request<VHabitExecutionsCreateData, any>({
        path: `/api/v${version}/Habit/${id}/executions`,
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
     * @tags Habit
     * @name VHabitExecutionsList
     * @request GET:/api/v{version}/Habit/executions
     * @secure
     * @response `200` `VHabitExecutionsListData` Success
     */
    vHabitExecutionsList: ({ version, ...query }: VHabitExecutionsListParams, params: RequestParams = {}) =>
      this.request<VHabitExecutionsListData, any>({
        path: `/api/v${version}/Habit/executions`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Habit
     * @name VHabitExecutionsMarkDailyFailuresCreate
     * @request POST:/api/v{version}/Habit/executions/mark-daily-failures
     * @secure
     * @response `200` `VHabitExecutionsMarkDailyFailuresCreateData` Success
     */
    vHabitExecutionsMarkDailyFailuresCreate: (
      { version, ...query }: VHabitExecutionsMarkDailyFailuresCreateParams,
      data: MarkDailyFailuresReq,
      params: RequestParams = {},
    ) =>
      this.request<VHabitExecutionsMarkDailyFailuresCreateData, any>({
        path: `/api/v${version}/Habit/executions/mark-daily-failures`,
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
    vUserCreate: ({ version, ...query }: VUserCreateParams, data: CreateUserReq, params: RequestParams = {}) =>
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
    vUserMeList: ({ version, ...query }: VUserMeListParams, params: RequestParams = {}) =>
      this.request<VUserMeListData, any>({
        path: `/api/v${version}/User/Me`,
        method: 'GET',
        secure: true,
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
    vUserMeAllList: ({ version, ...query }: VUserMeAllListParams, params: RequestParams = {}) =>
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
    vUserDetail: ({ id, version, ...query }: VUserDetailParams, params: RequestParams = {}) =>
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
    vUserUpdate: ({ id, version, ...query }: VUserUpdateParams, data: UpdateUserReq, params: RequestParams = {}) =>
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
    vUserDelete: ({ id, version, ...query }: VUserDeleteParams, params: RequestParams = {}) =>
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
    vUserUsernameDetail: ({ username, version, ...query }: VUserUsernameDetailParams, params: RequestParams = {}) =>
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
     * @tags V1Error
     * @name VErrorInfoList
     * @request GET:/api/v{version}/error-info
     * @secure
     * @response `200` `VErrorInfoListData` Success
     */
    vErrorInfoList: ({ version, ...query }: VErrorInfoListParams, params: RequestParams = {}) =>
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
    vErrorInfoDetail: ({ id, version, ...query }: VErrorInfoDetailParams, params: RequestParams = {}) =>
      this.request<VErrorInfoDetailData, any>({
        path: `/api/v${version}/error-info/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
