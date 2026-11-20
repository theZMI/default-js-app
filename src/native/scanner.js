// Сканер QR и штрихкодов.
//  - Cordova: @red-mobile/cordova-plugin-barcodescanner (полноэкранный сканер с камеры);
//  - веб: BarcodeDetector (Chrome на Android/macOS/ChromeOS) по фото с камеры —
//    в Safari/Firefox BarcodeDetector нет, тогда scan() бросает понятную ошибку.
// scan() возвращает строку или null, если пользователь отменил сканирование.
import {FEATURES} from '@/config/features';
import {getPlugin, getGlobal} from '@/native/cordova';
import {takePhoto} from '@/native/camera';

export const SCAN_FORMATS = {
    QR: 'QR_CODE',
    ALL: '', // все, кроме PDF_417 и RSS_EXPANDED (так у плагина по умолчанию)
};

// Имена форматов плагина → имена форматов BarcodeDetector
const WEB_FORMATS = {
    QR_CODE: 'qr_code', EAN_13: 'ean_13', EAN_8: 'ean_8', CODE_128: 'code_128',
    CODE_39: 'code_39', UPC_A: 'upc_a', UPC_E: 'upc_e', DATA_MATRIX: 'data_matrix',
    PDF_417: 'pdf417', AZTEC: 'aztec', ITF: 'itf', CODABAR: 'codabar',
};

export function isScannerAvailable() {
    if (!FEATURES.scanner) return false;
    return !!getGlobal('cordova.plugins.barcodeScanner') || 'BarcodeDetector' in window || !!window.cordova;
}

async function nativeScan(plugin, {formats, prompt, torch, frontCamera}) {
    return new Promise((resolve, reject) => {
        plugin.scan(
            (result) => resolve(result.cancelled ? null : result.text),
            (error) => reject(new Error(`Не удалось отсканировать: ${error}`)),
            {
                prompt: prompt || 'Наведите камеру на код', // Android
                formats: formats || undefined,
                showTorchButton: torch !== false,
                preferFrontCamera: !!frontCamera,
                resultDisplayDuration: 0,
                disableSuccessBeep: false,
            },
        );
    });
}

async function webScan({formats}) {
    if (!('BarcodeDetector' in window)) {
        throw new Error('Сканер кодов не поддерживается этим браузером — откройте приложение на телефоне.');
    }
    const webFormats = (formats || '').split(',').map((f) => WEB_FORMATS[f.trim()]).filter(Boolean);
    const detector = new window.BarcodeDetector(webFormats.length ? {formats: webFormats} : undefined);
    const photo = await takePhoto({targetWidth: 1600, targetHeight: 1600});
    if (!photo) return null;
    const bitmap = await createImageBitmap(photo.blob);
    const codes = await detector.detect(bitmap);
    if (!codes.length) throw new Error('На фото не найден код — попробуйте ещё раз ближе и при хорошем свете.');
    return codes[0].rawValue;
}

/**
 * @param {{formats?: string, prompt?: string, torch?: boolean, frontCamera?: boolean}} options
 *   formats — через запятую в нотации плагина ('QR_CODE,EAN_13'), см. SCAN_FORMATS
 */
export async function scan(options = {}) {
    if (!FEATURES.scanner) throw new Error('Сканер отключён в настройках приложения.');
    const plugin = await getPlugin('cordova.plugins.barcodeScanner');
    return plugin ? nativeScan(plugin, options) : webScan(options);
}
