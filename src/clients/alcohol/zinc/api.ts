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

export interface AirwallexEvent {
  id?: string | null;
  name?: string | null;
  account_id?: string | null;
  accountId?: string | null;
  data: AirwallexEventData;
  created_at?: string | null;
  createdAt?: string | null;
  sourceId?: string | null;
}

export interface AirwallexEventData {
  object: AirwallexEventDataObject;
}

export interface AirwallexEventDataObject {
  /** @format double */
  amount: number;
  /** @format double */
  base_amount: number;
  base_currency?: string | null;
  /** @format double */
  captured_amount: number;
  merchant_order_id?: string | null;
  /** @format uuid */
  request_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  currency?: string | null;
  descriptor?: string | null;
  id?: string | null;
  status?: string | null;
  customer_id?: string | null;
  initial_payment_intent_id?: string | null;
  merchant_trigger_reason?: string | null;
  next_triggered_by?: string | null;
  purpose?: string | null;
}

export interface AwardWeeklyReq {
  userId?: string | null;
}

export interface AwardWeeklyRes {
  userId?: string | null;
  /** @format int32 */
  awards: number;
}

export interface CausePrincipalRes {
  id?: string | null;
  key?: string | null;
  name?: string | null;
}

export interface CauseRes {
  principal: CausePrincipalRes;
}

export interface CharityPrincipalRes {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  mission?: string | null;
  countries?: string[] | null;
  primaryRegistrationNumber?: string | null;
  primaryRegistrationCountry?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export interface CharityRes {
  principal: CharityPrincipalRes;
}

export interface ClientSecretRes {
  clientSecret?: string | null;
  customerId?: string | null;
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

export interface ConfirmPaymentIntentReq {
  paymentConsentId?: string | null;
}

export interface ConfirmPaymentIntentRes {
  paymentIntentId?: string | null;
  status?: string | null;
  /** @format double */
  amount: number;
  currency?: string | null;
}

export interface CreateCauseReq {
  key?: string | null;
  name?: string | null;
}

export interface CreateCharityReq {
  name?: string | null;
  slug?: string | null;
  mission?: string | null;
  countries?: string[] | null;
  primaryRegistrationNumber?: string | null;
  primaryRegistrationCountry?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export interface CreateConfigurationReq {
  timezone?: string | null;
  defaultCharityId?: string | null;
}

export interface CreateCustomerRes {
  customerId?: string | null;
  clientSecret?: string | null;
}

export interface CreateHabitReq {
  task?: string | null;
  daysOfWeek?: string[] | null;
  notificationTime?: string | null;
  stake?: string | null;
  /** @format uuid */
  charityId: string;
  timezone?: string | null;
}

export interface CreatePaymentIntentReq {
  /** @format double */
  amount: number;
  currency?: string | null;
  description?: string | null;
}

export interface CreatePaymentIntentRes {
  paymentIntentId?: string | null;
  status?: string | null;
  /** @format double */
  amount: number;
  currency?: string | null;
}

export interface CreateUserReq {
  idToken?: string | null;
  accessToken?: string | null;
}

export interface CreateVacationReq {
  startDate?: string | null;
  endDate?: string | null;
  timezone?: string | null;
}

export interface ErrorInfo {
  schema?: any;
  id?: string | null;
  title?: string | null;
  version?: string | null;
}

export interface HabitCharityRefRes {
  id?: string | null;
  name?: string | null;
  url?: string | null;
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

export interface HabitOverviewHabitRes {
  id?: string | null;
  name?: string | null;
  notificationTime?: string | null;
  timezone?: string | null;
  days?: boolean[] | null;
  stake: StakeRes;
  enabled: boolean;
  charity: HabitCharityRefRes;
  status: HabitStatusRes;
  /** @format int32 */
  timeLeftToEodMinutes: number;
  version: HabitVersionMetaRes;
  totalDebt?: string | null;
}

export interface HabitOverviewResponse {
  habits?: HabitOverviewHabitRes[] | null;
  totalDebt?: string | null;
  /** @format int32 */
  usedSkip: number;
  /** @format int32 */
  totalSkip: number;
}

export interface HabitStatusRes {
  /** @format int32 */
  currentStreak: number;
  /** @format int32 */
  maxStreak: number;
  isCompleteToday: boolean;
  week: WeekStatusRes;
}

export interface HabitVersionMetaRes {
  id?: string | null;
  /** @format int32 */
  version: number;
  isActive: boolean;
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
  timezone?: string | null;
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

export interface MarkDailyFailuresCronRes {
  /** @format int32 */
  totalMarked: number;
}

export interface MarkDailyFailuresReq {
  date?: string | null;
  habitIds?: string[] | null;
}

export interface PaymentConsentRes {
  hasPaymentConsent: boolean;
  consentId?: string | null;
  status?: string | null;
}

export interface PledgeSyncSummaryRes {
  /** @format int32 */
  causesUpserted: number;
  /** @format int32 */
  charitiesCreated: number;
  /** @format int32 */
  charitiesUpdated: number;
  /** @format int32 */
  externalIdsLinked: number;
  /** @format int32 */
  charitiesProcessed: number;
}

export interface ProtectionBalanceRes {
  userId?: string | null;
  /** @format int32 */
  balance: number;
  /** @format int32 */
  cap: number;
}

export interface SetCharityCausesReq {
  keys?: string[] | null;
}

export interface SkipHabitReq {
  notes?: string | null;
}

export interface StakeRes {
  /** @format double */
  amount: number;
  currency?: string | null;
}

export interface UpdateCauseReq {
  name?: string | null;
}

export interface UpdateCharityReq {
  name?: string | null;
  slug?: string | null;
  mission?: string | null;
  countries?: string[] | null;
  primaryRegistrationNumber?: string | null;
  primaryRegistrationCountry?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
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
  timezone?: string | null;
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

export interface VacationRes {
  /** @format uuid */
  id: string;
  userId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  timezone?: string | null;
  createdAt?: string | null;
}

export interface WeekStatusRes {
  sunday?: string | null;
  monday?: string | null;
  tuesday?: string | null;
  wednesday?: string | null;
  thursday?: string | null;
  friday?: string | null;
  saturday?: string | null;
  start?: string | null;
  end?: string | null;
}

export interface VCausesListParams {
  Key?: string;
  Name?: string;
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

export type VCausesListData = CausePrincipalRes[];

export interface VCausesCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCausesCreateData = CausePrincipalRes;

export interface VCausesDetailParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCausesDetailData = CauseRes;

export interface VCausesUpdateParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCausesUpdateData = CausePrincipalRes;

export interface VCausesDeleteParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCausesDeleteData = any;

export interface VCharityListParams {
  Name?: string;
  Slug?: string;
  Country?: string;
  PrimaryRegistrationNumber?: string;
  PrimaryRegistrationCountry?: string;
  CauseKey?: string;
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

export type VCharityDeleteData = any;

export interface VCharityCausesUpdateParams {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharityCausesUpdateData = any;

export interface VCharitySupportedCountriesListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharitySupportedCountriesListData = string[];

export interface VConfigurationDetailParams {
  userId: string;
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
  userId: string;
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationUpdateData = ConfigurationPrincipalRes;

export interface VConfigurationMeListParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationMeListData = ConfigurationRes;

export interface VConfigurationDetail2Params {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationDetail2Data = ConfigurationRes;

export interface VConfigurationUpdate2Params {
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationUpdate2Data = ConfigurationPrincipalRes;

export interface VConfigurationCreateParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationCreateData = ConfigurationPrincipalRes;

export interface VConfigurationCreate2Params {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VConfigurationCreate2Data = ConfigurationPrincipalRes;

export interface VEmailCreateParams {
  to: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VEmailCreateData = any;

export interface VHabitDetailParams {
  /** @format uuid */
  Id?: string;
  UserId?: string;
  Task?: string;
  Enabled?: boolean;
  /** @format int32 */
  Limit?: number;
  /** @format int32 */
  Skip?: number;
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitDetailData = HabitVersionRes[];

export interface VHabitCreateParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitCreateData = HabitVersionRes;

export interface VHabitDetail2Params {
  userId: string;
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitDetail2Data = HabitVersionRes;

export interface VHabitUpdateParams {
  userId: string;
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
  userId: string;
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitDeleteData = any;

export interface VHabitExecutionsCreateParams {
  userId: string;
  /** @format uuid */
  habitVersionId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitExecutionsCreateData = HabitExecutionRes;

export interface VHabitExecutionsSkipCreateParams {
  userId: string;
  /** @format uuid */
  habitVersionId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitExecutionsSkipCreateData = HabitExecutionRes;

export interface VHabitExecutionsListParams {
  /** @format uuid */
  Id?: string;
  Date?: string;
  /** @format int32 */
  Limit?: number;
  /** @format int32 */
  Skip?: number;
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitExecutionsListData = HabitExecutionRes[];

export interface VHabitOverviewListParams {
  /** @format int32 */
  Limit?: number;
  /** @format int32 */
  Skip?: number;
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitOverviewListData = HabitOverviewResponse;

export interface VHabitExecutionsMarkDailyFailuresCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

/** @format int32 */
export type VHabitExecutionsMarkDailyFailuresCreateData = number;

export interface VHabitCronMarkDailyFailuresCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VHabitCronMarkDailyFailuresCreateData = MarkDailyFailuresCronRes;

export interface VPaymentCustomersUpdateParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentCustomersUpdateData = CreateCustomerRes;

export interface VPaymentClientSecretListParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentClientSecretListData = ClientSecretRes;

export interface VPaymentConsentListParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentConsentListData = PaymentConsentRes;

export interface VPaymentConsentDeleteParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentConsentDeleteData = any;

export interface VPaymentIntentCreateParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentIntentCreateData = CreatePaymentIntentRes;

export interface VPaymentIntentCreate2Params {
  userId: string;
  intentId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentIntentCreate2Data = ConfirmPaymentIntentRes;

export interface VPaymentWebhookCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VPaymentWebhookCreateData = any;

export interface VCharitiesSyncPledgeCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VCharitiesSyncPledgeCreateData = PledgeSyncSummaryRes;

export interface VProtectionDetailParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VProtectionDetailData = ProtectionBalanceRes;

export interface VProtectionAwardWeeklyCreateParams {
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VProtectionAwardWeeklyCreateData = AwardWeeklyRes;

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

export interface VVacationCreateParams {
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VVacationCreateData = VacationRes;

export interface VVacationDetailParams {
  /** @format int32 */
  Year?: number;
  /** @format int32 */
  Limit?: number;
  /** @format int32 */
  Skip?: number;
  userId: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VVacationDetailData = VacationRes[];

export interface VVacationDeleteParams {
  userId: string;
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VVacationDeleteData = any;

export interface VVacationEndTodayPartialUpdateParams {
  userId: string;
  /** @format uuid */
  id: string;
  /**
   * The requested API version
   * @default "1.0"
   */
  version: string;
}

export type VVacationEndTodayPartialUpdateData = VacationRes;

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
 * Alcohol-Zinc: API for LazyTax
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
     * @tags Causes
     * @name VCausesList
     * @request GET:/api/v{version}/Causes
     * @secure
     * @response `200` `VCausesListData` Success
     */
    vCausesList: ({ version, ...query }: VCausesListParams, params: RequestParams = {}) =>
      this.request<VCausesListData, any>({
        path: `/api/v${version}/Causes`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Causes
     * @name VCausesCreate
     * @request POST:/api/v{version}/Causes
     * @secure
     * @response `200` `VCausesCreateData` Success
     */
    vCausesCreate: ({ version, ...query }: VCausesCreateParams, data: CreateCauseReq, params: RequestParams = {}) =>
      this.request<VCausesCreateData, any>({
        path: `/api/v${version}/Causes`,
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
     * @tags Causes
     * @name VCausesDetail
     * @request GET:/api/v{version}/Causes/{id}
     * @secure
     * @response `200` `VCausesDetailData` Success
     */
    vCausesDetail: ({ id, version, ...query }: VCausesDetailParams, params: RequestParams = {}) =>
      this.request<VCausesDetailData, any>({
        path: `/api/v${version}/Causes/${id}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Causes
     * @name VCausesUpdate
     * @request PUT:/api/v{version}/Causes/{id}
     * @secure
     * @response `200` `VCausesUpdateData` Success
     */
    vCausesUpdate: ({ id, version, ...query }: VCausesUpdateParams, data: UpdateCauseReq, params: RequestParams = {}) =>
      this.request<VCausesUpdateData, any>({
        path: `/api/v${version}/Causes/${id}`,
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
     * @tags Causes
     * @name VCausesDelete
     * @request DELETE:/api/v{version}/Causes/{id}
     * @secure
     * @response `200` `VCausesDeleteData` Success
     */
    vCausesDelete: ({ id, version, ...query }: VCausesDeleteParams, params: RequestParams = {}) =>
      this.request<VCausesDeleteData, any>({
        path: `/api/v${version}/Causes/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

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
        query: query,
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
        ...params,
      }),

    /**
     * No description
     *
     * @tags Charity
     * @name VCharityCausesUpdate
     * @request PUT:/api/v{version}/Charity/{id}/causes
     * @secure
     * @response `200` `VCharityCausesUpdateData` Success
     */
    vCharityCausesUpdate: (
      { id, version, ...query }: VCharityCausesUpdateParams,
      data: SetCharityCausesReq,
      params: RequestParams = {},
    ) =>
      this.request<VCharityCausesUpdateData, any>({
        path: `/api/v${version}/Charity/${id}/causes`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Charity
     * @name VCharitySupportedCountriesList
     * @request GET:/api/v{version}/Charity/supported-countries
     * @secure
     * @response `200` `VCharitySupportedCountriesListData` Success
     */
    vCharitySupportedCountriesList: (
      { version, ...query }: VCharitySupportedCountriesListParams,
      params: RequestParams = {},
    ) =>
      this.request<VCharitySupportedCountriesListData, any>({
        path: `/api/v${version}/Charity/supported-countries`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Configuration
     * @name VConfigurationDetail
     * @request GET:/api/v{version}/Configuration/{userId}/{id}
     * @secure
     * @response `200` `VConfigurationDetailData` Success
     */
    vConfigurationDetail: ({ userId, id, version, ...query }: VConfigurationDetailParams, params: RequestParams = {}) =>
      this.request<VConfigurationDetailData, any>({
        path: `/api/v${version}/Configuration/${userId}/${id}`,
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
     * @request PUT:/api/v{version}/Configuration/{userId}/{id}
     * @secure
     * @response `200` `VConfigurationUpdateData` Success
     */
    vConfigurationUpdate: (
      { userId, id, version, ...query }: VConfigurationUpdateParams,
      data: UpdateConfigurationReq,
      params: RequestParams = {},
    ) =>
      this.request<VConfigurationUpdateData, any>({
        path: `/api/v${version}/Configuration/${userId}/${id}`,
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
     * @name VConfigurationMeList
     * @request GET:/api/v{version}/Configuration/me
     * @secure
     * @response `200` `VConfigurationMeListData` Success
     */
    vConfigurationMeList: ({ version, ...query }: VConfigurationMeListParams, params: RequestParams = {}) =>
      this.request<VConfigurationMeListData, any>({
        path: `/api/v${version}/Configuration/me`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Configuration
     * @name VConfigurationDetail2
     * @request GET:/api/v{version}/Configuration/{id}
     * @originalName vConfigurationDetail
     * @duplicate
     * @secure
     * @response `200` `VConfigurationDetail2Data` Success
     */
    vConfigurationDetail2: ({ id, version, ...query }: VConfigurationDetail2Params, params: RequestParams = {}) =>
      this.request<VConfigurationDetail2Data, any>({
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
     * @name VConfigurationUpdate2
     * @request PUT:/api/v{version}/Configuration/{id}
     * @originalName vConfigurationUpdate
     * @duplicate
     * @secure
     * @response `200` `VConfigurationUpdate2Data` Success
     */
    vConfigurationUpdate2: (
      { id, version, ...query }: VConfigurationUpdate2Params,
      data: UpdateConfigurationReq,
      params: RequestParams = {},
    ) =>
      this.request<VConfigurationUpdate2Data, any>({
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
     * @request POST:/api/v{version}/Configuration/{userId}
     * @secure
     * @response `200` `VConfigurationCreateData` Success
     */
    vConfigurationCreate: (
      { userId, version, ...query }: VConfigurationCreateParams,
      data: CreateConfigurationReq,
      params: RequestParams = {},
    ) =>
      this.request<VConfigurationCreateData, any>({
        path: `/api/v${version}/Configuration/${userId}`,
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
     * @tags Configuration
     * @name VConfigurationCreate2
     * @request POST:/api/v{version}/Configuration
     * @originalName vConfigurationCreate
     * @duplicate
     * @secure
     * @response `200` `VConfigurationCreate2Data` Success
     */
    vConfigurationCreate2: (
      { version, ...query }: VConfigurationCreate2Params,
      data: CreateConfigurationReq,
      params: RequestParams = {},
    ) =>
      this.request<VConfigurationCreate2Data, any>({
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
     * @name VHabitDetail
     * @request GET:/api/v{version}/Habit/{userId}
     * @secure
     * @response `200` `VHabitDetailData` Success
     */
    vHabitDetail: ({ userId, version, ...query }: VHabitDetailParams, params: RequestParams = {}) =>
      this.request<VHabitDetailData, any>({
        path: `/api/v${version}/Habit/${userId}`,
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
     * @name VHabitCreate
     * @request POST:/api/v{version}/Habit/{userId}
     * @secure
     * @response `200` `VHabitCreateData` Success
     */
    vHabitCreate: (
      { userId, version, ...query }: VHabitCreateParams,
      data: CreateHabitReq,
      params: RequestParams = {},
    ) =>
      this.request<VHabitCreateData, any>({
        path: `/api/v${version}/Habit/${userId}`,
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
     * @name VHabitDetail2
     * @request GET:/api/v{version}/Habit/{userId}/{id}
     * @originalName vHabitDetail
     * @duplicate
     * @secure
     * @response `200` `VHabitDetail2Data` Success
     */
    vHabitDetail2: ({ userId, id, version, ...query }: VHabitDetail2Params, params: RequestParams = {}) =>
      this.request<VHabitDetail2Data, any>({
        path: `/api/v${version}/Habit/${userId}/${id}`,
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
     * @request PUT:/api/v{version}/Habit/{userId}/{id}
     * @secure
     * @response `200` `VHabitUpdateData` Success
     */
    vHabitUpdate: (
      { userId, id, version, ...query }: VHabitUpdateParams,
      data: UpdateHabitReq,
      params: RequestParams = {},
    ) =>
      this.request<VHabitUpdateData, any>({
        path: `/api/v${version}/Habit/${userId}/${id}`,
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
     * @request DELETE:/api/v{version}/Habit/{userId}/{id}
     * @secure
     * @response `200` `VHabitDeleteData` Success
     */
    vHabitDelete: ({ userId, id, version, ...query }: VHabitDeleteParams, params: RequestParams = {}) =>
      this.request<VHabitDeleteData, any>({
        path: `/api/v${version}/Habit/${userId}/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Habit
     * @name VHabitExecutionsCreate
     * @request POST:/api/v{version}/Habit/{userId}/{habitVersionId}/executions
     * @secure
     * @response `200` `VHabitExecutionsCreateData` Success
     */
    vHabitExecutionsCreate: (
      { userId, habitVersionId, version, ...query }: VHabitExecutionsCreateParams,
      data: CompleteHabitReq,
      params: RequestParams = {},
    ) =>
      this.request<VHabitExecutionsCreateData, any>({
        path: `/api/v${version}/Habit/${userId}/${habitVersionId}/executions`,
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
     * @name VHabitExecutionsSkipCreate
     * @request POST:/api/v{version}/Habit/{userId}/{habitVersionId}/executions/skip
     * @secure
     * @response `200` `VHabitExecutionsSkipCreateData` Success
     */
    vHabitExecutionsSkipCreate: (
      { userId, habitVersionId, version, ...query }: VHabitExecutionsSkipCreateParams,
      data: SkipHabitReq,
      params: RequestParams = {},
    ) =>
      this.request<VHabitExecutionsSkipCreateData, any>({
        path: `/api/v${version}/Habit/${userId}/${habitVersionId}/executions/skip`,
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
     * @request GET:/api/v{version}/Habit/{userId}/executions
     * @secure
     * @response `200` `VHabitExecutionsListData` Success
     */
    vHabitExecutionsList: ({ userId, version, ...query }: VHabitExecutionsListParams, params: RequestParams = {}) =>
      this.request<VHabitExecutionsListData, any>({
        path: `/api/v${version}/Habit/${userId}/executions`,
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
     * @name VHabitOverviewList
     * @request GET:/api/v{version}/Habit/{userId}/overview
     * @secure
     * @response `200` `VHabitOverviewListData` Success
     */
    vHabitOverviewList: ({ userId, version, ...query }: VHabitOverviewListParams, params: RequestParams = {}) =>
      this.request<VHabitOverviewListData, any>({
        path: `/api/v${version}/Habit/${userId}/overview`,
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
     * @tags HabitCron
     * @name VHabitCronMarkDailyFailuresCreate
     * @request POST:/api/v{version}/habit-cron/mark-daily-failures
     * @secure
     * @response `200` `VHabitCronMarkDailyFailuresCreateData` Success
     */
    vHabitCronMarkDailyFailuresCreate: (
      { version, ...query }: VHabitCronMarkDailyFailuresCreateParams,
      params: RequestParams = {},
    ) =>
      this.request<VHabitCronMarkDailyFailuresCreateData, any>({
        path: `/api/v${version}/habit-cron/mark-daily-failures`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name VPaymentCustomersUpdate
     * @request PUT:/api/v{version}/Payment/{userId}/customers
     * @secure
     * @response `200` `VPaymentCustomersUpdateData` Success
     */
    vPaymentCustomersUpdate: (
      { userId, version, ...query }: VPaymentCustomersUpdateParams,
      params: RequestParams = {},
    ) =>
      this.request<VPaymentCustomersUpdateData, any>({
        path: `/api/v${version}/Payment/${userId}/customers`,
        method: 'PUT',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name VPaymentClientSecretList
     * @request GET:/api/v{version}/Payment/{userId}/client-secret
     * @secure
     * @response `200` `VPaymentClientSecretListData` Success
     */
    vPaymentClientSecretList: (
      { userId, version, ...query }: VPaymentClientSecretListParams,
      params: RequestParams = {},
    ) =>
      this.request<VPaymentClientSecretListData, any>({
        path: `/api/v${version}/Payment/${userId}/client-secret`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name VPaymentConsentList
     * @request GET:/api/v{version}/Payment/{userId}/consent
     * @secure
     * @response `200` `VPaymentConsentListData` Success
     */
    vPaymentConsentList: ({ userId, version, ...query }: VPaymentConsentListParams, params: RequestParams = {}) =>
      this.request<VPaymentConsentListData, any>({
        path: `/api/v${version}/Payment/${userId}/consent`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name VPaymentConsentDelete
     * @request DELETE:/api/v{version}/Payment/{userId}/consent
     * @secure
     * @response `200` `VPaymentConsentDeleteData` Success
     */
    vPaymentConsentDelete: ({ userId, version, ...query }: VPaymentConsentDeleteParams, params: RequestParams = {}) =>
      this.request<VPaymentConsentDeleteData, any>({
        path: `/api/v${version}/Payment/${userId}/consent`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Payment
     * @name VPaymentIntentCreate
     * @request POST:/api/v{version}/Payment/{userId}/intent
     * @secure
     * @response `200` `VPaymentIntentCreateData` Success
     */
    vPaymentIntentCreate: (
      { userId, version, ...query }: VPaymentIntentCreateParams,
      data: CreatePaymentIntentReq,
      params: RequestParams = {},
    ) =>
      this.request<VPaymentIntentCreateData, any>({
        path: `/api/v${version}/Payment/${userId}/intent`,
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
     * @tags Payment
     * @name VPaymentIntentCreate2
     * @request POST:/api/v{version}/Payment/{userId}/intent/{intentId}
     * @originalName vPaymentIntentCreate
     * @duplicate
     * @secure
     * @response `200` `VPaymentIntentCreate2Data` Success
     */
    vPaymentIntentCreate2: (
      { userId, intentId, version, ...query }: VPaymentIntentCreate2Params,
      data: ConfirmPaymentIntentReq,
      params: RequestParams = {},
    ) =>
      this.request<VPaymentIntentCreate2Data, any>({
        path: `/api/v${version}/Payment/${userId}/intent/${intentId}`,
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
     * @tags Payment
     * @name VPaymentWebhookCreate
     * @request POST:/api/v{version}/Payment/webhook
     * @secure
     * @response `200` `VPaymentWebhookCreateData` Success
     */
    vPaymentWebhookCreate: (
      { version, ...query }: VPaymentWebhookCreateParams,
      data: AirwallexEvent,
      params: RequestParams = {},
    ) =>
      this.request<VPaymentWebhookCreateData, any>({
        path: `/api/v${version}/Payment/webhook`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags PledgeSync
     * @name VCharitiesSyncPledgeCreate
     * @request POST:/api/v{version}/charities/sync/pledge
     * @secure
     * @response `200` `VCharitiesSyncPledgeCreateData` Success
     */
    vCharitiesSyncPledgeCreate: ({ version, ...query }: VCharitiesSyncPledgeCreateParams, params: RequestParams = {}) =>
      this.request<VCharitiesSyncPledgeCreateData, any>({
        path: `/api/v${version}/charities/sync/pledge`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Protection
     * @name VProtectionDetail
     * @request GET:/api/v{version}/Protection/{userId}
     * @secure
     * @response `200` `VProtectionDetailData` Success
     */
    vProtectionDetail: ({ userId, version, ...query }: VProtectionDetailParams, params: RequestParams = {}) =>
      this.request<VProtectionDetailData, any>({
        path: `/api/v${version}/Protection/${userId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Protection
     * @name VProtectionAwardWeeklyCreate
     * @request POST:/api/v{version}/Protection/award-weekly
     * @secure
     * @response `200` `VProtectionAwardWeeklyCreateData` Success
     */
    vProtectionAwardWeeklyCreate: (
      { version, ...query }: VProtectionAwardWeeklyCreateParams,
      data: AwardWeeklyReq,
      params: RequestParams = {},
    ) =>
      this.request<VProtectionAwardWeeklyCreateData, any>({
        path: `/api/v${version}/Protection/award-weekly`,
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

    /**
     * No description
     *
     * @tags Vacation
     * @name VVacationCreate
     * @request POST:/api/v{version}/Vacation/{userId}
     * @secure
     * @response `200` `VVacationCreateData` Success
     */
    vVacationCreate: (
      { userId, version, ...query }: VVacationCreateParams,
      data: CreateVacationReq,
      params: RequestParams = {},
    ) =>
      this.request<VVacationCreateData, any>({
        path: `/api/v${version}/Vacation/${userId}`,
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
     * @tags Vacation
     * @name VVacationDetail
     * @request GET:/api/v{version}/Vacation/{userId}
     * @secure
     * @response `200` `VVacationDetailData` Success
     */
    vVacationDetail: ({ userId, version, ...query }: VVacationDetailParams, params: RequestParams = {}) =>
      this.request<VVacationDetailData, any>({
        path: `/api/v${version}/Vacation/${userId}`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vacation
     * @name VVacationDelete
     * @request DELETE:/api/v{version}/Vacation/{userId}/{id}
     * @secure
     * @response `200` `VVacationDeleteData` Success
     */
    vVacationDelete: ({ userId, id, version, ...query }: VVacationDeleteParams, params: RequestParams = {}) =>
      this.request<VVacationDeleteData, any>({
        path: `/api/v${version}/Vacation/${userId}/${id}`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vacation
     * @name VVacationEndTodayPartialUpdate
     * @request PATCH:/api/v{version}/Vacation/{userId}/{id}/end-today
     * @secure
     * @response `200` `VVacationEndTodayPartialUpdateData` Success
     */
    vVacationEndTodayPartialUpdate: (
      { userId, id, version, ...query }: VVacationEndTodayPartialUpdateParams,
      params: RequestParams = {},
    ) =>
      this.request<VVacationEndTodayPartialUpdateData, any>({
        path: `/api/v${version}/Vacation/${userId}/${id}/end-today`,
        method: 'PATCH',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
