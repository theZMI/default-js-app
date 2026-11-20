// Скачивание файлов на устройство и открытие их системными приложениями.
//  - Cordova: cordova-plugin-file (пути), cordova-plugin-file-transfer (скачивание с прогрессом),
//    cordova-plugin-file-opener2 (открыть файл: установка APK, PDF и т.п.);
//  - веб: обычное скачивание браузером по ссылке.
import {FEATURES} from '@/config/features';
import {getPlugin, getGlobal, isCordova} from '@/native/cordova';

export function isFilesAvailable() {
    return FEATURES.files;
}

// Папка для скачанных файлов: externalDataDirectory (Android, видна приложениям-установщикам
// без доп. разрешений), иначе dataDirectory (iOS)
export function downloadsDir() {
    const file = getGlobal('cordova.file');
    return file ? (file.externalDataDirectory || file.dataDirectory) : null;
}

/**
 * Скачать файл. onProgress(percent 0..100).
 * Cordova — возвращает URL скачанного файла (file://…); веб — запускает скачивание браузером и возвращает url.
 */
export async function downloadFile(url, fileName, {onProgress = () => {}} = {}) {
    if (!isFilesAvailable()) throw new Error('Скачивание файлов отключено в настройках приложения.');
    if (!isCordova()) {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return url;
    }

    await getPlugin('cordova.file');
    const FileTransfer = window.FileTransfer;
    const dir = downloadsDir();
    if (!FileTransfer || !dir) throw new Error('Скачивание файлов недоступно: не установлены плагины file/file-transfer.');

    return new Promise((resolve, reject) => {
        const transfer = new FileTransfer();
        transfer.onprogress = (e) => {
            if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        transfer.download(
            encodeURI(url),
            dir + fileName,
            (entry) => resolve(entry.toURL()),
            (err) => reject(Object.assign(new Error('Не удалось скачать файл — проверьте интернет и попробуйте ещё раз.'), {cause: err})),
        );
    });
}

/** Открыть скачанный файл системой (для APK — запуск установки). */
export async function openFile(fileUrl, mimeType) {
    const opener = await getPlugin('cordova.plugins.fileOpener2');
    if (!opener) {
        window.open(fileUrl, '_blank');
        return;
    }
    return new Promise((resolve, reject) => {
        opener.open(fileUrl, mimeType, {
            success: resolve,
            error: () => reject(new Error('Не удалось открыть файл.')),
        });
    });
}

export const MIME = {
    APK: 'application/vnd.android.package-archive',
    PDF: 'application/pdf',
};
