import {describe, it, expect, vi} from 'vitest';

// Очередь импортирует Api.js → store → vue; для логики очереди они не нужны
vi.mock('@/libraries/Api', () => ({default: {}}));
vi.mock('@/libraries/localDB', () => ({default: {}}));

const {createQueue} = await import('@/libraries/offlineQueue');

function memoryStorage() {
    const data = {};
    return {
        getValue: async (k, d) => (k in data ? structuredClone(data[k]) : d),
        setValue: async (k, v) => { data[k] = structuredClone(v); },
        data,
    };
}

describe('offlineQueue', () => {
    it('отправляет добавленный запрос', async () => {
        const send = vi.fn(async () => ({ok: true}));
        const q = createQueue({name: 't1', send, storage: memoryStorage()});
        await q.add({uri: 'a', data: {x: 1}});
        await q.process({force: true});
        expect(send).toHaveBeenCalledTimes(1);
        expect((await q.list())[0].status).toBe('sent');
    });

    it('при ошибке сети оставляет запрос и повторяет позже', async () => {
        let online = false;
        let clock = 1000;
        const send = vi.fn(async () => { if (!online) throw Object.assign(new Error('нет сети'), {retry: true}); return 1; });
        const q = createQueue({name: 't2', send, storage: memoryStorage(), now: () => clock});
        await q.add({uri: 'a'});
        await q.process({force: true});
        expect((await q.list())[0].status).toBe('pending');
        expect(await q.pendingCount()).toBe(1);

        online = true;
        await q.process();                 // пауза перед повтором ещё не прошла
        expect(send).toHaveBeenCalledTimes(1);
        clock += 60000;
        await q.process();
        expect((await q.list())[0].status).toBe('sent');
    });

    it('ответ 4xx не повторяет — помечает failed', async () => {
        const send = async () => { throw Object.assign(new Error('Плохие данные'), {retry: false}); };
        const q = createQueue({name: 't3', send, storage: memoryStorage()});
        await q.add({uri: 'a'});
        await q.process({force: true});
        const [item] = await q.list();
        expect(item.status).toBe('failed');
        expect(item.lastError).toBe('Плохие данные');
    });

    it('dedupeKey заменяет неотправленный запрос', async () => {
        const send = async () => { throw Object.assign(new Error('нет сети'), {retry: true}); };
        const q = createQueue({name: 't4', send, storage: memoryStorage()});
        await q.add({uri: 'draft', data: {v: 1}, dedupeKey: 'draft'});
        await q.add({uri: 'draft', data: {v: 2}, dedupeKey: 'draft'});
        const list = await q.list();
        expect(list).toHaveLength(1);
        expect(list[0].data.v).toBe(2);
    });

    it('переживает «перезапуск» — читает очередь из хранилища', async () => {
        const storage = memoryStorage();
        const failing = async () => { throw Object.assign(new Error('нет сети'), {retry: true}); };
        await createQueue({name: 't5', send: failing, storage}).add({uri: 'a'});
        const send = vi.fn(async () => 1);
        const q2 = createQueue({name: 't5', send, storage});
        await q2.process({force: true});
        expect(send).toHaveBeenCalledTimes(1);
    });
});
