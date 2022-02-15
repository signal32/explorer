import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import authService from "./authService";


export const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
    return config;
}

export const onRequestError = (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
}

export const onResponse = (response: AxiosResponse): AxiosResponse => {
    return response;
}

export const onResponseError = (error: AxiosError): Promise<AxiosError> => {
    if (error.code === "401") {
        authService.refreshLogin()
    }
    return Promise.reject(error);
}