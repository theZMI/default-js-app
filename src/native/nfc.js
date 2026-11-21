// NFC: чтение меток и карт (пропуска, билеты, NFC-наклейки на маршруте) — phonegap-nfc.
// Только Android-телефоны с NFC; на iOS чтение возможно в ограниченном режиме, в браузере —
// только Chrome Android через Web NFC (NDEFReader), его тоже поддерживаем.
//   const stop = await startNfcScan((tag) => console.log(tag.id, tag.records));
import {FEATURES} from '@/config/features';
import {getPlugin} from '@/native/cordova';

function bytesToHex(bytes) {
    return Array.from(bytes || [], (b) => ((b < 0 ? b + 256 : b)).toString(16).padStart(2, '0')).join(':').toUpperCase();
}

function decodeRecord(record, ndef) {
    try {
        const type = ndef?.bytesToString ? ndef.bytesToString(record.type) : '';
        let value = '';
        if (type === 'T') value = ndef.textHelper.decodePayload(record.payload);
        else if (type === 'U') value = ndef.uriHelper.decodePayload(record.payload);
        else value = ndef.bytesToString(record.payload);
        return {type, value};
    } catch (e) {
        return {type: '?', value: ''};
    }
}

/** 'ok' | 'disabled' (NFC выключен в настройках) | 'unsupported' */
export async function nfcStatus() {
    if (!FEATURES.nfc) return 'unsupported';
    const nfc = await getPlugin('nfc');
    if (nfc) {
        return new Promise((resolve) => nfc.enabled(() => resolve('ok'), (e) => resolve(e === 'NFC_DISABLED' ? 'disabled' : 'unsupported')));
    }
    return 'NDEFReader' in window ? 'ok' : 'unsupported';
}

export async function openNfcSettings() {
    const nfc = await getPlugin('nfc');
    nfc?.showSettings();
}

/**
 * Слушать приложенные метки. onTag({id, techTypes, records: [{type, value}]}).
 * Возвращает Promise<stop()>.
 */
export async function startNfcScan(onTag) {
    if (!FEATURES.nfc) throw new Error('NFC отключён в настройках приложения.');
    const nfc = await getPlugin('nfc');
    if (nfc) {
        const ndef = window.ndef;
        const handler = (event) => {
            const tag = event.tag || {};
            onTag({
                id: bytesToHex(tag.id),
                techTypes: tag.techTypes || [],
                records: (tag.ndefMessage || []).map((r) => decodeRecord(r, ndef)),
            });
        };
        await new Promise((resolve, reject) => nfc.addTagDiscoveredListener(handler, resolve, reject));
        await new Promise((resolve) => nfc.addNdefListener(handler, resolve, resolve));
        return () => {
            nfc.removeTagDiscoveredListener(handler);
            nfc.removeNdefListener(handler);
        };
    }
    if ('NDEFReader' in window) {
        const reader = new window.NDEFReader();
        const controller = new AbortController();
        await reader.scan({signal: controller.signal});
        reader.onreading = (e) => {
            const decoder = new TextDecoder();
            onTag({
                id: e.serialNumber?.toUpperCase() || '',
                techTypes: [],
                records: e.message.records.map((r) => ({type: r.recordType, value: r.data ? decoder.decode(r.data) : ''})),
            });
        };
        return () => controller.abort();
    }
    throw new Error('NFC есть только в приложении на Android-телефоне с NFC.');
}
