// Push-уведомления с сервера через Firebase Cloud Messaging (FCM).
// В заготовке модуль готов, но плагин НЕ установлен: ему нужен файл google-services.json
// конкретного Firebase-проекта, без него сборка APK падает. Как подключить — пример «Push»
// и README («Push-уведомления»). Кратко:
//   1. console.firebase.google.com → проект → Android-приложение с id из config.xml
//   2. google-services.json → в корень cordova-проекта (+ <resource-file> в config.xml)
//   3. cordova plugin add cordova-plugin-firebasex --save
//   4. FEATURES.push = true; токен из getToken() отправить на свой сервер
//   5. Сервер шлёт сообщения через Firebase Admin SDK (HTTP v1 API) на этот токен
import {FEATURES} from '@/config/features';
import {getPlugin, promisify} from '@/native/cordova';

async function plugin() {
    return FEATURES.push ? getPlugin('FirebasePlugin') : null;
}

export async function isPushAvailable() {
    return !!(await plugin());
}

/** Разрешение (Android 13+, iOS) + токен устройства для отправки с сервера */
export async function getToken() {
    const fb = await plugin();
    if (!fb) throw new Error('Push не подключён: нужен cordova-plugin-firebasex и google-services.json (см. README).');
    const granted = await promisify((ok, fail) => fb.hasPermission(ok, fail));
    if (!granted) await promisify((ok, fail) => fb.grantPermission(ok, fail));
    return promisify((ok, fail) => fb.getToken(ok, fail));
}

/** Пришло сообщение (в приложении или по нажатию на уведомление) */
export async function onMessage(handler) {
    const fb = await plugin();
    if (fb) fb.onMessageReceived(handler, (e) => console.warn('push:', e));
}

/** Токен поменялся — отправьте новый на сервер */
export async function onTokenRefresh(handler) {
    const fb = await plugin();
    if (fb) fb.onTokenRefresh(handler, (e) => console.warn('push:', e));
}
