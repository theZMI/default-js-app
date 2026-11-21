// Формат ответа бэкенда: {is_success, is_error, data}
export function IsApiResponse(obj) {
    return !!obj && typeof obj === 'object' && ['is_success', 'is_error', 'data'].every((field) => field in obj);
}

export function ToApiResponse(data) {
    return {
        is_success: false,
        is_error: false,
        data: data
    };
}
