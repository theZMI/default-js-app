// Офлайн-очередь запросов: действие сохраняется на устройстве и отправляется на сервер,
// когда появится сеть. Для приложений, где связь пропадает (сканер билетов в парке,
// отметки на маршруте): пользователь нажал «Погасить билет» без сети — запрос не теряется.
//
//   import {apiQueue} from '@/libraries/offlineQueue';
//   apiQueue.add({method: 'post', uri: 'tickets/redeem', data: {code}});
//   apiQueue.subscribe((items) => ...);   // для индикатора «ждут отправки: 3»
//
// Как работает:
//  - очередь хранится в IndexedDB (переживает закрытие приложения и перезагрузку телефона);
//  - отправка — по очереди, при появлении сети (событие online), при старте, раз в RETRY_MS
//    и сразу после add();
//  - ошибка сети/5xx — повтор позже с растущей паузой; ответ сервера 4xx (кроме 408/429) —
//    запрос бессмысленно повторять, он помечается failed и остаётся в списке для показа;
//  - dedupeKey: новый запрос с тем же ключом заменяет ещё не отправленный (например,
//    «сохранить черновик» — важна только последняя версия).
// Вместо eval и колбэков-строк старого ApiQueue — обычные данные; что делать после успеха,
// решает подписчик (subscribe) по item.meta.
import Api from '@/libraries/Api';
import localDB from '@/libraries/localDB';

const RETRY_MS = 15000;
const MAX_BACKOFF_MS = 5 * 60 * 1000;

// Отправка через Api.js. Повторять ли — по типу ошибки
async function sendViaApi(item) {
    try {
        return await Api[item.method || 'post'](item.uri, item.data);
    } catch (e) {
        const status = e?.status;
        const retry = !e?.is_response_from_server || status >= 500 || status === 408 || status === 429;
        throw Object.assign(new Error(e?.data?.message || 'Ошибка отправки'), {retry, status});
    }
}

export function createQueue({name, send = sendViaApi, storage = localDB, now = () => Date.now()}) {
    const KEY = `queue:${name}`;
    let items = null;           // загружается лениво из storage
    let processing = false;
    const listeners = new Set();

    async function load() {
        if (!items) items = (await storage.getValue(KEY, [])) || [];
        return items;
    }

    async function save() {
        await storage.setValue(KEY, items);
        listeners.forEach((fn) => fn([...items]));
    }

    const queue = {
        /** Добавить запрос. item: {method, uri, data, dedupeKey?, meta?}. Возвращает id. */
        async add(request) {
            await load();
            const item = {
                id: `${now()}-${Math.random().toString(36).slice(2, 8)}`,
                method: 'post',
                ...request,
                status: 'pending',  // pending | failed | sent
                attempts: 0,
                createdAt: now(),
                nextTryAt: 0,
                lastError: '',
            };
            if (item.dedupeKey) {
                items = items.filter((i) => !(i.dedupeKey === item.dedupeKey && i.status === 'pending'));
            }
            items.push(item);
            await save();
            queue.process();
            return item.id;
        },

        /** Отправить всё, что пора отправлять. Возвращает число отправленных. */
        async process({force = false} = {}) {
            if (processing) return 0;
            processing = true;
            let sent = 0;
            try {
                await load();
                for (const item of items) {
                    if (item.status !== 'pending') continue;
                    if (!force && item.nextTryAt > now()) continue;
                    if (typeof navigator !== 'undefined' && navigator.onLine === false && !force) break;
                    item.attempts++;
                    try {
                        item.response = await send(item);
                        item.status = 'sent';
                        item.sentAt = now();
                        sent++;
                    } catch (e) {
                        item.lastError = e?.message || String(e);
                        if (e?.retry === false) {
                            item.status = 'failed';
                        } else {
                            item.nextTryAt = now() + Math.min(MAX_BACKOFF_MS, 2000 * 2 ** (item.attempts - 1));
                        }
                    }
                    await save();
                }
            } finally {
                processing = false;
            }
            return sent;
        },

        async list() {
            return [...(await load())];
        },

        async pendingCount() {
            return (await load()).filter((i) => i.status === 'pending').length;
        },

        /** Убрать отправленные (и, при all=true, все) из списка */
        async clear({all = false} = {}) {
            await load();
            items = all ? [] : items.filter((i) => i.status !== 'sent');
            await save();
        },

        /** Повторить failed-запросы (например, после исправления данных) */
        async retryFailed() {
            await load();
            items.forEach((i) => { if (i.status === 'failed') Object.assign(i, {status: 'pending', nextTryAt: 0}); });
            await save();
            return queue.process();
        },

        subscribe(fn) {
            listeners.add(fn);
            load().then(() => fn([...items]));
            return () => listeners.delete(fn);
        },

        /** Автоматическая отправка: при появлении сети, при возврате в приложение и по таймеру */
        start() {
            if (typeof window === 'undefined') return () => {};
            const kick = () => queue.process();
            window.addEventListener('online', kick);
            document.addEventListener('visibilitychange', kick);
            const timer = setInterval(kick, RETRY_MS);
            kick();
            return () => {
                window.removeEventListener('online', kick);
                document.removeEventListener('visibilitychange', kick);
                clearInterval(timer);
            };
        },
    };
    return queue;
}

// Общая очередь запросов к бэкенду приложения (Api.js). Запускается в main.js.
export const apiQueue = createQueue({name: 'api'});
