// Фонарик (вспышка камеры) без отдельного плагина: включается через видеопоток задней
// камеры — getUserMedia + constraint torch. Работает в Chrome на Android и в Android WebView
// (нужно разрешение камеры). iOS Safari/WKWebView torch не поддерживают; на компьютере
// вспышки нет. Пока фонарик горит, камера занята — сканер/фото откроются после выключения.
import {FEATURES} from '@/config/features';
import {deviceReady} from '@/native/cordova';
import {ensurePermission, PERMISSIONS} from '@/native/permissions';

let stream = null;

export function isTorchOn() {
    return !!stream;
}

export function isTorchApiAvailable() {
    return FEATURES.torch && !!navigator.mediaDevices?.getUserMedia;
}

export async function torchOn() {
    if (!isTorchApiAvailable()) throw new Error('Фонарик недоступен на этом устройстве.');
    if (stream) return true;
    await deviceReady();
    if (!(await ensurePermission(PERMISSIONS.CAMERA))) throw new Error('Нет доступа к камере — разрешите его в настройках.');
    try {
        stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'environment'}}});
    } catch (e) {
        stream = null;
        throw new Error('Не удалось включить камеру для фонарика.', {cause: e});
    }
    const track = stream.getVideoTracks()[0];
    const caps = track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.torch) {
        await torchOff();
        throw new Error('У этой камеры нет вспышки (или браузер не умеет её включать).');
    }
    await track.applyConstraints({advanced: [{torch: true}]});
    return true;
}

export async function torchOff() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
        await track?.applyConstraints({advanced: [{torch: false}]});
    } catch (e) {
        // камера уже остановлена
    }
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
}

export async function toggleTorch() {
    if (stream) {
        await torchOff();
        return false;
    }
    return torchOn();
}
