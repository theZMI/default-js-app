// Вход в аккаунт по коду из письма (как в zmi-music-player-app): без паролей —
// пользователь вводит почту, сервер присылает код, приложение меняет его на токен.
// Токен хранится на устройстве и подставляется во все запросы Api.js (Bearer);
// ответ 401 от сервера = токен протух → выходим из аккаунта.
//
// Сервер (APP.AUTH): POST SEND_CODE_URI {email} → ok; POST LOGIN_URI {email, code} → {token, user};
// POST LOGOUT_URI. APP.AUTH.DEMO = true — работа без сервера (код 1234), для примера и макетов.
import {reactive} from 'vue';
import Api from '@/libraries/Api';
import {APP} from '@/config/app';
import {delay} from '@/helpers/delay';

const STORAGE_KEY = 'auth';

function load() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
        return null;
    }
}

function save() {
    try {
        if (auth.token) localStorage.setItem(STORAGE_KEY, JSON.stringify({token: auth.token, user: auth.user, biometric: auth.biometric}));
        else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // приватный режим — вход не переживёт перезапуск
    }
}

const saved = load();

export const auth = reactive({
    token: saved?.token || null,
    user: saved?.user || null,
    // Пользователь включил «подтверждать вход отпечатком» (пример «Вход в аккаунт»)
    biometric: !!saved?.biometric,
    get loggedIn() {
        return !!this.token;
    },
});

Api.authToken = auth.token;
Api._on401 = () => logout({silent: true});

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function requestCode(email) {
    if (!isEmail(email)) throw new Error('Проверьте адрес почты.');
    if (APP.AUTH.DEMO) {
        await delay(600);
        return;
    }
    await Api.post(APP.AUTH.SEND_CODE_URI, {email});
}

export async function login(email, code) {
    if (!/^\d{4,8}$/.test(String(code).trim())) throw new Error('Код — это несколько цифр из письма.');
    let res;
    if (APP.AUTH.DEMO) {
        await delay(600);
        if (String(code).trim() !== '1234') throw new Error('Неверный код (в демо-режиме код — 1234).');
        res = {token: `demo-${Date.now()}`, user: {email, name: email.split('@')[0]}};
    } else {
        res = await Api.post(APP.AUTH.LOGIN_URI, {email, code: String(code).trim()});
    }
    auth.token = res.token;
    auth.user = res.user || {email};
    Api.authToken = auth.token;
    save();
    return auth.user;
}

export async function logout({silent = false} = {}) {
    if (!silent && !APP.AUTH.DEMO && auth.token) {
        try {
            await Api.post(APP.AUTH.LOGOUT_URI, {});
        } catch (e) {
            // выйти локально нужно в любом случае
        }
    }
    auth.token = null;
    auth.user = null;
    auth.biometric = false;
    Api.authToken = null;
    save();
}

export function setBiometricLogin(enabled) {
    auth.biometric = enabled;
    save();
}
