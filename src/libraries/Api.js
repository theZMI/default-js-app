import axios from 'axios';
import { IsApiResponse, ToApiResponse } from '@/helpers/api';
import { userErrorMessage } from '@/helpers/errors';
import EnvConfig from "@/env";
import store from "@/store";

export default {
    API_ROOT_URL: `${EnvConfig.SITE_ROOT_URL}api/v1.0/`,
    CONF_TIMEOUT: 5000,
    lastResponse: {},
    // Bearer-токен авторизации (например, Laravel Sanctum) — выставьте после входа: Api.authToken = token
    authToken: null,

    authHeaders() {
        return this.authToken ? {Authorization: `Bearer ${this.authToken}`} : {};
    },

    _on401() { // Обработчик ответа 401 (не авторизован) — переопределите, например, разлогином: Api._on401 = () => {...}
    },
    _prepareResponse(response, errorMessage = 'Сервер прислал непонятный ответ — попробуйте чуть позже.') {
        // Ответ не в формате сайта (например, HTML-страница хостинга): его содержимое
        // показывать нельзя, поэтому заменяем его понятным текстом ошибки
        if (!IsApiResponse(response)) {
            response = ToApiResponse({message: errorMessage});
            response.is_error = true;
        }
        // If both flags (is_success and is_error) set as false, then show error
        if (!response.is_success && !response.is_error) {
            response.is_error = true;
        }
        return response;
    },
    // options.timeout — для тяжёлых запросов, по умолчанию CONF_TIMEOUT
    async _call(uri, method, data, options = {}) {
        store.dispatch('networkInformation/update', { status: 'loading' });
        const send_request_time = Math.floor(Date.now() / 1000);

        try { // Запрос выполнился успешно, и is_success==true
            const response = await axios({
                url: `${this.API_ROOT_URL}${uri}`,
                responseType: 'json',
                timeout: options.timeout ?? this.CONF_TIMEOUT,
                method,
                // GET — параметры в query, тело только у остальных методов
                params: method === 'GET' ? data : undefined,
                data: method === 'GET' ? undefined : data,
                headers: {
                    'Content-Type' : 'application/json; charset=UTF-8',
                    'API-Request-Time': send_request_time.toString(),
                    ...this.authHeaders(),
                },
            });
            this.lastResponse = {
                ...this._prepareResponse(response.data),
                is_response_from_server: IsApiResponse(response.data),
                status: response.status,
                send_request_time,
                response_time: Math.floor(Date.now() / 1000),
            };

            if (this.lastResponse.is_success) {
                store.dispatch('networkInformation/update', { status: 'success' });
                return this.lastResponse.data;
            }
        } catch (e) { // Ошибка выполнения запроса
            this.lastResponse = {
                ...this._prepareResponse(e?.response?.data, userErrorMessage(e)),
                is_response_from_server: IsApiResponse(e?.response?.data || ''),
                status: e?.response?.status || 400,
                send_request_time,
                response_time: Math.floor(Date.now() / 1000),
                is_server_maintenance: e?.response?.status === 503,
                error: e,
            };
            store.dispatch('networkInformation/update', {
                // значок «нет сети» — только если ответа не было вовсе
                status: e?.response ? 'success' : 'error',
                lastError: this.lastResponse.data.message
            });
            if (parseInt(e?.response?.status) === 401) { // Ошибка авторизации
                this._on401();
            }

            throw this.lastResponse;
        }

        // Запрос успешно выполнился, но is_error==true
        store.dispatch('networkInformation/update', {
            status: 'success', // ответ сервера получен — с сетью всё в порядке
            lastError: this.lastResponse.data?.message
        });
        throw {
            ...this.lastResponse,
            is_response_from_server: IsApiResponse(this.lastResponse),
            status: 200,
            send_request_time,
        }
    },

    get(uri, data = [], options) {
        return this._call(uri, 'GET', data, options);
    },
    post(uri, data, options) { // Создание ресурса
        return this._call(uri, 'POST', data, options);
    },
    put(uri, data, options) { // Замена ресурса целиком
        return this._call(uri, 'PUT', data, options);
    },
    patch(uri, data, options) { // Редактирование ресурса
        return this._call(uri, 'PATCH', data, options);
    },
    delete(uri, data = [], options) {
        return this._call(uri, 'DELETE', data, options);
    }
}