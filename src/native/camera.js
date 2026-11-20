// Фото с камеры и выбор из галереи.
//  - Cordova: cordova-plugin-camera (navigator.camera.getPicture);
//  - веб и Cordova без плагина: <input type="file" accept="image/*" capture> —
//    на телефоне открывает камеру, на компьютере — выбор файла.
// Результат всегда одинаковый: {dataUrl, blob} (blob — для загрузки на сервер/IndexedDB).
import {FEATURES} from '@/config/features';
import {getPlugin} from '@/native/cordova';

export function isCameraAvailable() {
    return FEATURES.camera;
}

const DEFAULT_OPTIONS = {
    quality: 80,
    // Ограничение размера: фото с камеры в полном разрешении весят десятки МБ в base64
    targetWidth: 1920,
    targetHeight: 1920,
    saveToPhotoAlbum: false,
};

function dataUrlToBlob(dataUrl) {
    const [meta, b64] = dataUrl.split(',');
    const mime = (meta.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new Blob([arr], {type: mime});
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

async function nativeGetPicture(fromGallery, options) {
    const camera = await getPlugin('navigator.camera');
    const Camera = window.Camera;
    if (!camera || !Camera) return undefined; // нет плагина — уйдём в веб-фолбэк
    const opts = {...DEFAULT_OPTIONS, ...options};
    return new Promise((resolve, reject) => {
        camera.getPicture(
            (base64) => {
                const dataUrl = 'data:image/jpeg;base64,' + base64;
                resolve({dataUrl, blob: dataUrlToBlob(dataUrl)});
            },
            (message) => {
                // Пользователь закрыл камеру/галерею — это не ошибка
                if (/cancel|no image selected/i.test(String(message))) resolve(null);
                else reject(new Error('Не удалось получить фото.'));
            },
            {
                quality: opts.quality,
                targetWidth: opts.targetWidth,
                targetHeight: opts.targetHeight,
                saveToPhotoAlbum: !fromGallery && opts.saveToPhotoAlbum,
                correctOrientation: true,
                cameraDirection: opts.frontCamera ? Camera.Direction.FRONT : Camera.Direction.BACK,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: fromGallery ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
            },
        );
    });
}

function webPickImage(fromGallery) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        if (!fromGallery) input.setAttribute('capture', 'environment');
        input.style.display = 'none';
        input.addEventListener('change', async () => {
            const file = input.files && input.files[0];
            input.remove();
            resolve(file ? {dataUrl: await blobToDataUrl(file), blob: file} : null);
        }, {once: true});
        // Отмену выбора файла браузер не сообщает надёжно — промис тогда просто не резолвится
        // до следующего выбора; для UI это значит «ничего не произошло», что и нужно.
        input.addEventListener('cancel', () => { input.remove(); resolve(null); }, {once: true});
        document.body.appendChild(input);
        input.click();
    });
}

/** Сделать фото. Возвращает {dataUrl, blob} или null, если пользователь отменил. */
export async function takePhoto(options = {}) {
    if (!isCameraAvailable()) throw new Error('Камера отключена в настройках приложения.');
    const res = await nativeGetPicture(false, options);
    return res === undefined ? webPickImage(false) : res;
}

/** Выбрать фото из галереи. Возвращает {dataUrl, blob} или null. */
export async function selectPhoto(options = {}) {
    if (!isCameraAvailable()) throw new Error('Камера отключена в настройках приложения.');
    const res = await nativeGetPicture(true, options);
    return res === undefined ? webPickImage(true) : res;
}
