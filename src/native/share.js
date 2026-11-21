// «Поделиться» через системное меню (мессенджеры, почта, «Сохранить в файлы»).
//  - Cordova: cordova-plugin-x-socialsharing — в Android WebView navigator.share не работает;
//  - веб: Web Share API (телефоны, Safari, Chrome на Windows/ChromeOS); файлы — если canShare;
//  - нигде нет — копируем текст/ссылку в буфер обмена.
// Возвращает 'shared' | 'copied' | 'cancelled'.
import {FEATURES} from '@/config/features';
import {getPlugin} from '@/native/cordova';

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
    });
}

export function isShareAvailable() {
    return FEATURES.share;
}

/**
 * @param {{title?: string, text?: string, url?: string, files?: File[]}} data
 *   files — File (с именем): фото с камеры, запись диктофона, PDF
 */
export async function share({title = '', text = '', url = '', files = []} = {}) {
    if (!FEATURES.share) throw new Error('«Поделиться» отключено в настройках приложения.');

    const plugin = await getPlugin('plugins.socialsharing');
    if (plugin) {
        // Плагин принимает файлы как data:-URL (base64) — имя файла передаём в схеме df:
        const pluginFiles = await Promise.all(files.map(async (f) =>
            (await blobToDataUrl(f)).replace(/^data:/, `df:${f.name || 'file'};data:`)));
        return new Promise((resolve, reject) => {
            plugin.shareWithOptions(
                {subject: title, message: [text, url].filter(Boolean).join('\n'), files: pluginFiles, chooserTitle: title || 'Поделиться'},
                (result) => resolve(result?.completed === false ? 'cancelled' : 'shared'),
                (e) => reject(new Error(`Не удалось поделиться: ${e}`)),
            );
        });
    }

    if (navigator.share) {
        const payload = {title, text, url};
        if (files.length && navigator.canShare?.({files})) payload.files = files;
        try {
            await navigator.share(payload);
            return 'shared';
        } catch (e) {
            if (e?.name === 'AbortError') return 'cancelled';
            // не поддержан формат — ниже скопируем текст
        }
    }

    const fallback = [title, text, url].filter(Boolean).join('\n');
    try {
        await navigator.clipboard.writeText(fallback);
        return 'copied';
    } catch (e) {
        throw new Error('Этот браузер не умеет делиться и копировать — выделите текст вручную.', {cause: e});
    }
}
