import axios, {AxiosRequestConfig} from "axios";
import {onRequest, onRequestError, onResponse, onResponseError} from "./interceptors";

export function createAxios(config:AxiosRequestConfig) {
    const instance = axios.create(config);
    instance.interceptors.request.use(onRequest, onRequestError);
    instance.interceptors.response.use(onResponse, onResponseError);

    return instance    
}