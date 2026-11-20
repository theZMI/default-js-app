// Локальная база на IndexedDB (обёртка idb). Переживает перезапуск приложения и в вебе,
// и в Cordova; в отличие от localStorage, хранит большие объёмы и Blob (фото, файлы).
//
//   import localDB from '@/libraries/localDB';
//   await localDB.put('notes', {id: 1, text: 'Привет'});
//   const all = await localDB.getAll('notes');
//
// Новая таблица — добавьте её в TABLES и поднимите DB_VERSION (иначе upgrade не запустится).
import {openDB} from 'idb';
import {toRaw} from 'vue';

const DB_NAME = 'app-db';
const DB_VERSION = 1;
const TABLES = {
    // имя таблицы: имя поля-ключа
    kv: 'key',
    images: 'id',
    files: 'id',
};

let dbPromise = null;

function db() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(database) {
                for (const [table, keyPath] of Object.entries(TABLES)) {
                    if (!database.objectStoreNames.contains(table)) {
                        database.createObjectStore(table, {keyPath});
                    }
                }
            },
        });
    }
    return dbPromise;
}

// Vue-реактивные объекты (Proxy) IndexedDB клонировать не умеет — снимаем обёртку.
// Blob/File оставляем как есть: structuredClone их поддерживает.
function plain(value) {
    return typeof structuredClone === 'function' ? structuredClone(toRaw(value)) : JSON.parse(JSON.stringify(value));
}

export default {
    async get(table, key) { return (await db()).get(table, key); },
    async getAll(table) { return (await db()).getAll(table); },
    async put(table, value) { return (await db()).put(table, plain(value)); },
    async delete(table, key) { return (await db()).delete(table, key); },
    async clear(table) { return (await db()).clear(table); },

    // Простое key-value поверх таблицы kv
    async getValue(key, fallback = null) {
        const row = await this.get('kv', key);
        return row ? row.value : fallback;
    },
    async setValue(key, value) {
        return this.put('kv', {key, value});
    },
};
