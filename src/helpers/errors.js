// Текст ошибки для пользователя. Служебные сообщения браузера и библиотек («Network Error»,
// «Failed to fetch», «Request failed with status code 500») показывать нельзя: они на
// английском и ничего не объясняют. Свои сообщения приложения и сайта — всегда на русском,
// так их и отличаем от служебных.
const CYRILLIC = /[а-яё]/i;

function isRussianText(text) {
  return typeof text === 'string' && CYRILLIC.test(text);
}

export function httpErrorMessage(status) {
  if (status === 401) return 'Нужно войти в аккаунт.';
  if (status === 403) return 'Нет доступа.';
  if (status === 404) return 'На сервере такого нет.';
  if (status === 413) return 'Файл слишком большой.';
  if (status === 429) return 'Слишком много попыток — подождите минуту.';
  if (status === 503) return 'Сервер временно недоступен — попробуйте чуть позже.';
  if (status >= 500) return 'На сервере произошла ошибка — попробуйте чуть позже.';
  return `Сервер отклонил запрос (код ${status}).`;
}

// Ответа нет вовсе. Это не обязательно плохой интернет: nginx хостинга подменяет ответы
// сайта с кодом 5xx своей страницей без CORS-заголовков, и браузер скрывает такой ответ
// от приложения. Поэтому про отсутствие сети говорим, только если браузер это подтверждает.
function connectionMessage(e) {
  if (navigator.onLine === false) return 'Нет подключения к интернету.';
  if (e?.code === 'ECONNABORTED' || e?.code === 'ETIMEDOUT') return 'Сервер отвечает слишком долго — попробуйте ещё раз.';
  return 'Сервер не ответил — проверьте интернет или попробуйте чуть позже.';
}

function isConnectionError(e) {
  if (e?.isAxiosError) return !e.response;
  return e instanceof TypeError && /fetch|network|load failed/i.test(e.message || ''); // сбой fetch()
}

// e — ошибка любого вида: ответ Api.js, ошибка axios или fetch, обычный Error.
// fallback — на случай, когда сказать что-то конкретнее нечего.
export function userErrorMessage(e, fallback = 'Что-то пошло не так — попробуйте ещё раз.') {
  const serverMessage = e?.data?.message || e?.response?.data?.data?.message;
  if (isRussianText(serverMessage)) return serverMessage;
  if (e?.response?.status) return httpErrorMessage(e.response.status);
  if (isConnectionError(e)) return connectionMessage(e);
  if (e?.name === 'QuotaExceededError') return 'Не хватает места на устройстве — освободите память и попробуйте ещё раз.';
  if (isRussianText(e?.message)) return e.message;
  return fallback;
}
