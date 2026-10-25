import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@cm/contracts';
import { http } from './instance.js';

export const apiRequest = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
    http({ ...config, ...options }).then(({ data }) => data as T);

export type ErrorType<E = ErrorResponse> = AxiosError<E>;
export type BodyType<BodyData> = BodyData;
