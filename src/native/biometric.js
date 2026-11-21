// Вход по отпечатку пальца / лицу: cordova-plugin-fingerprint-aio (Android BiometricPrompt,
// iOS Face ID / Touch ID). Это проверка «владелец телефона рядом», а не пароль: используйте
// её, чтобы разблокировать уже сохранённый вход (токен), а не вместо входа на сервер.
// В браузере биометрии нет — isBiometricAvailable() вернёт {available: false}.
import {FEATURES} from '@/config/features';
import {getPlugin} from '@/native/cordova';

async function plugin() {
    return FEATURES.biometric ? getPlugin('Fingerprint') : null;
}

/** {available: boolean, type?: 'finger'|'face'|'biometric', reason?: string} */
export async function isBiometricAvailable() {
    const fp = await plugin();
    if (!fp) return {available: false, reason: 'Биометрия доступна только в приложении на телефоне.'};
    return new Promise((resolve) => {
        fp.isAvailable(
            (type) => resolve({available: true, type}),
            (e) => resolve({available: false, reason: e?.message || 'На телефоне не настроен отпечаток или лицо.'}),
        );
    });
}

/** Показать системный запрос. true — подтвердили, false — отменили. */
export async function verifyBiometric({title = 'Подтвердите вход', description = '', cancelText = 'Отмена'} = {}) {
    const fp = await plugin();
    if (!fp) throw new Error('Биометрия доступна только в приложении на телефоне.');
    return new Promise((resolve, reject) => {
        fp.show(
            {title, description, cancelButtonTitle: cancelText, disableBackup: false},
            () => resolve(true),
            (e) => {
                // -108 — пользователь нажал «Отмена»
                if (e?.code === -108 || /cancel/i.test(e?.message || '')) resolve(false);
                else reject(new Error(e?.message || 'Не удалось проверить биометрию.'));
            },
        );
    });
}
